import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CfnOutput,
  Duration,
  Fn,
  RemovalPolicy,
  Stack,
  type StackProps,
  aws_apigatewayv2 as apigatewayv2,
  aws_certificatemanager as acm,
  aws_apigatewayv2_integrations as integrations,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_logs as logs,
  aws_route53 as route53,
  aws_s3 as s3,
  aws_s3_notifications as s3Notifications,
  aws_ses as ses,
  aws_ses_actions as sesActions,
  custom_resources as customResources,
} from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(dirname, "../../..");
const githubPagesIpv4Addresses = [
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
];
const githubPagesIpv6Addresses = [
  "2606:50c0:8000::153",
  "2606:50c0:8001::153",
  "2606:50c0:8002::153",
  "2606:50c0:8003::153",
];

export type BackendStackProps = StackProps & {
  allowedOrigins: string[];
  baseDomain: string;
  githubPagesDnsTarget: string;
  mailRecipients: string[];
};

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const apiDomainName = `api.${props.baseDomain}`;

    const hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: props.baseDomain,
    });

    const apiCertificate = new acm.Certificate(this, "ApiCertificate", {
      domainName: apiDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const apiDomain = new apigatewayv2.DomainName(this, "ApiDomainName", {
      certificate: apiCertificate,
      domainName: apiDomainName,
      endpointType: apigatewayv2.EndpointType.REGIONAL,
      securityPolicy: apigatewayv2.SecurityPolicy.TLS_1_2,
    });

    new route53.ARecord(this, "GithubPagesApexARecord", {
      target: route53.RecordTarget.fromValues(...githubPagesIpv4Addresses),
      ttl: Duration.hours(1),
      zone: hostedZone,
    });

    new route53.AaaaRecord(this, "GithubPagesApexAaaaRecord", {
      target: route53.RecordTarget.fromValues(...githubPagesIpv6Addresses),
      ttl: Duration.hours(1),
      zone: hostedZone,
    });

    new route53.CnameRecord(this, "GithubPagesWwwCnameRecord", {
      domainName: props.githubPagesDnsTarget,
      recordName: "www",
      ttl: Duration.hours(1),
      zone: hostedZone,
    });

    const submissionsTable = new dynamodb.Table(
      this,
      "ContactSubmissionsTable",
      {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },

        removalPolicy: RemovalPolicy.DESTROY,
        timeToLiveAttribute: "expiresAt",
      }
    );

    const ingestedDocumentsTable = new dynamodb.Table(
      this,
      "IngestedDocumentsTable",
      {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
        removalPolicy: RemovalPolicy.DESTROY,
        timeToLiveAttribute: "expiresAt",
      }
    );

    const apiLogGroup = new logs.LogGroup(this, "ApiHandlerLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });

    const apiHandler = new NodejsFunction(this, "ApiHandler", {
      bundling: {
        minify: true,
        sourceMap: true,
        target: "node22",
      },
      depsLockFilePath: path.join(workspaceRoot, "package-lock.json"),
      entry: path.join(workspaceRoot, "apps/backend/src/handler.ts"),
      environment: {
        SUBMISSIONS_TABLE_NAME: submissionsTable.tableName,
      },
      handler: "handler",
      logGroup: apiLogGroup,
      memorySize: 256,
      projectRoot: workspaceRoot,
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: Duration.seconds(10),
    });

    submissionsTable.grantWriteData(apiHandler);

    const emailBucket = new s3.Bucket(this, "IncomingEmailBucket", {
      autoDeleteObjects: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        {
          expiration: Duration.days(30),
          prefix: "raw/",
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const mailIngestLogGroup = new logs.LogGroup(
      this,
      "MailIngestHandlerLogGroup",
      {
        removalPolicy: RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.ONE_WEEK,
      }
    );

    const mailIngestHandler = new NodejsFunction(this, "MailIngestHandler", {
      bundling: {
        minify: true,
        sourceMap: true,
        target: "node22",
      },
      depsLockFilePath: path.join(workspaceRoot, "package-lock.json"),
      entry: path.join(workspaceRoot, "apps/backend/src/mail-ingest.ts"),
      environment: {
        INGESTED_DOCUMENTS_TABLE_NAME: ingestedDocumentsTable.tableName,
      },
      handler: "handler",
      logGroup: mailIngestLogGroup,
      memorySize: 512,
      projectRoot: workspaceRoot,
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: Duration.seconds(60),
    });

    emailBucket.grantRead(mailIngestHandler);
    ingestedDocumentsTable.grantWriteData(mailIngestHandler);

    mailIngestHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [
          `arn:${this.partition}:bedrock:${this.region}::foundation-model/*`,
          `arn:${this.partition}:bedrock:${this.region}:${this.account}:inference-profile/*`,
          `arn:${this.partition}:bedrock:eu-*::foundation-model/*`,
          `arn:${this.partition}:bedrock:eu-*:${this.account}:inference-profile/*`,
        ],
      })
    );

    emailBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3Notifications.LambdaDestination(mailIngestHandler),
      {
        prefix: "raw/",
      }
    );

    const receiptRuleSet = new ses.ReceiptRuleSet(this, "ReceiptRuleSet", {
      dropSpam: true,
    });

    receiptRuleSet.addRule("StoreIncomingEmail", {
      actions: [
        new sesActions.S3({
          bucket: emailBucket,
          objectKeyPrefix: "raw/",
        }),
      ],
      recipients: props.mailRecipients,
      scanEnabled: true,
      tlsPolicy: ses.TlsPolicy.REQUIRE,
    });

    new customResources.AwsCustomResource(this, "ActivateReceiptRuleSet", {
      onCreate: {
        action: "setActiveReceiptRuleSet",
        parameters: {
          RuleSetName: receiptRuleSet.receiptRuleSetName,
        },
        physicalResourceId: customResources.PhysicalResourceId.of(
          `active-receipt-rule-set`
        ),
        service: "SES",
      },
      onUpdate: {
        action: "setActiveReceiptRuleSet",
        parameters: {
          RuleSetName: receiptRuleSet.receiptRuleSetName,
        },
        physicalResourceId: customResources.PhysicalResourceId.of(
          `active-receipt-rule-set`
        ),
        service: "SES",
      },
      policy: customResources.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["ses:SetActiveReceiptRuleSet"],
          resources: ["*"],
        }),
      ]),
    });

    const httpApi = new apigatewayv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [
          apigatewayv2.CorsHttpMethod.GET,
          apigatewayv2.CorsHttpMethod.OPTIONS,
          apigatewayv2.CorsHttpMethod.POST,
        ],
        allowOrigins: props.allowedOrigins,
        maxAge: Duration.days(10),
      },
    });

    new apigatewayv2.ApiMapping(this, "ApiDomainMapping", {
      api: httpApi,
      domainName: apiDomain,
    });

    new route53.ARecord(this, "ApiAliasRecord", {
      recordName: "api",
      target: route53.RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          apiDomain.regionalDomainName,
          apiDomain.regionalHostedZoneId
        )
      ),
      zone: hostedZone,
    });

    const apiIntegration = new integrations.HttpLambdaIntegration(
      "ApiIntegration",
      apiHandler
    );

    httpApi.addRoutes({
      integration: apiIntegration,
      methods: [apigatewayv2.HttpMethod.GET],
      path: "/health",
    });

    httpApi.addRoutes({
      integration: apiIntegration,
      methods: [apigatewayv2.HttpMethod.POST],
      path: "/contact",
    });

    new CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
    });

    new CfnOutput(this, "CustomApiUrl", {
      value: `https://${apiDomainName}`,
    });

    new CfnOutput(this, "FrontendCustomDomain", {
      value: `https://${props.baseDomain}`,
    });

    new CfnOutput(this, "GithubPagesDnsTarget", {
      value: props.githubPagesDnsTarget,
    });

    new CfnOutput(this, "HostedZoneId", {
      value: hostedZone.hostedZoneId,
    });

    new CfnOutput(this, "HostedZoneNameServers", {
      value: Fn.join(", ", hostedZone.hostedZoneNameServers ?? []),
    });

    new CfnOutput(this, "ContactSubmissionsTableName", {
      value: submissionsTable.tableName,
    });

    new CfnOutput(this, "IngestedDocumentsTableName", {
      value: ingestedDocumentsTable.tableName,
    });

    new CfnOutput(this, "IncomingEmailBucketName", {
      value: emailBucket.bucketName,
    });

    new CfnOutput(this, "MailRecipients", {
      value: props.mailRecipients.join(","),
    });
  }
}
