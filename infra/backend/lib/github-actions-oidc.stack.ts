import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  Effect,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface GithubActionsOidcStackProps extends StackProps {
  clientIds: string[];
  deployStackNames: string[];
  subject: string;
}

export class GithubActionsOidcStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: GithubActionsOidcStackProps
  ) {
    super(scope, id, props);

    const oidcProvider = new OpenIdConnectProvider(this, "OIDCProvider", {
      clientIds: props.clientIds,
      url: `https://token.actions.githubusercontent.com`,
    });

    const cdkBootstrapQualifier = "hnb659fds";
    const cdkAssetsBucketArn = `arn:${this.partition}:s3:::cdk-${cdkBootstrapQualifier}-assets-${this.account}-${this.region}`;
    const cdkBootstrapVersionParameterArn = `arn:${this.partition}:ssm:${this.region}:${this.account}:parameter/cdk-bootstrap/${cdkBootstrapQualifier}/version`;
    const cdkCloudFormationExecutionRoleArn = `arn:${this.partition}:iam::${this.account}:role/cdk-${cdkBootstrapQualifier}-cfn-exec-role-${this.account}-${this.region}`;
    const cloudFormationStackArns = props.deployStackNames.map(
      (stackName) =>
        `arn:${this.partition}:cloudformation:${this.region}:${this.account}:stack/${stackName}/*`
    );

    const deployPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [
            "cloudformation:CreateChangeSet",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DescribeStacks",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:GetTemplate",
            "cloudformation:GetTemplateSummary",
          ],
          effect: Effect.ALLOW,
          resources: cloudFormationStackArns,
        }),
        new PolicyStatement({
          actions: [
            "cloudformation:DescribeStacks",
            "cloudformation:ListStacks",
            "cloudformation:ValidateTemplate",
          ],
          effect: Effect.ALLOW,
          resources: ["*"],
        }),
        new PolicyStatement({
          actions: [
            "s3:GetBucketLocation",
            "s3:GetEncryptionConfiguration",
            "s3:ListBucket",
          ],
          effect: Effect.ALLOW,
          resources: [cdkAssetsBucketArn],
        }),
        new PolicyStatement({
          actions: ["s3:GetObject", "s3:PutObject"],
          effect: Effect.ALLOW,
          resources: [`${cdkAssetsBucketArn}/*`],
        }),
        new PolicyStatement({
          actions: ["ssm:GetParameter"],
          effect: Effect.ALLOW,
          resources: [cdkBootstrapVersionParameterArn],
        }),
        new PolicyStatement({
          actions: ["iam:GetRole", "iam:PassRole"],
          conditions: {
            StringEquals: {
              "iam:PassedToService": "cloudformation.amazonaws.com",
            },
          },
          effect: Effect.ALLOW,
          resources: [cdkCloudFormationExecutionRoleArn],
        }),
        new PolicyStatement({
          actions: ["sts:GetCallerIdentity"],
          effect: Effect.ALLOW,
          resources: ["*"],
        }),
      ],
    });

    const deployRole = new Role(this, "GithubActionsOIDCRole", {
      description: "Role for Github Actions OIDC",
      assumedBy: new WebIdentityPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            [`token.actions.githubusercontent.com:aud`]: "sts.amazonaws.com",
          },
          StringLike: {
            [`token.actions.githubusercontent.com:sub`]: props.subject,
          },
        }
      ),
      maxSessionDuration: Duration.hours(2),
      inlinePolicies: {
        DeployPolicy: deployPolicy,
      },
    });

    new CfnOutput(this, "GithubActionsRoleArn", {
      value: deployRole.roleArn,
    });
  }
}
