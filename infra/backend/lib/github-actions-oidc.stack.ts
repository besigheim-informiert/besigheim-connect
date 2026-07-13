import { Duration, Stack, StackProps } from "aws-cdk-lib";
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
  roleName: string;
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

    const cloudFormationPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [
            "acm:*",
            "apigateway:*",
            "applicationinsights:*",
            "athena:*",
            "autoscaling:*",
            "aws-marketplace:*",
            "ce:*",
            "cloudformation:*",
            "cloudfront:*",
            "cloudwatch:*",
            "cognito-identity:*",
            "cognito-idp:*",
            "cur:*",
            "datasync:*",
            "dynamodb:*",
            "ec2:*",
            "ec2-instance-connect:*",
            "ec2messages:*",
            "ecr:*",
            "eks:*",
            "elasticache:*",
            "elasticfilesystem:*",
            "elasticloadbalancing:*",
            "events:*",
            "glue:*",
            "iam:*",
            "imagebuilder:*",
            "kms:*",
            "lambda:*",
            "launchwizard:*",
            "logs:*",
            "network-firewall:*",
            "networkmanager:*",
            "pipes:*",
            "ram:*",
            "resource-explorer:*",
            "resource-explorer-2:*",
            "resource-groups:*",
            "route53:*",
            "route53domains:*",
            "s3:*",
            "s3-object-lambda:*",
            "scheduler:*",
            "schemas:*",
            "secretsmanager:*",
            "servicequotas:*",
            "shield:*",
            "sns:*",
            "ssm:*",
            "ssmmessages:*",
            "tag:*",
            "transfer:*",
            "waf:*",
            "waf-regional:*",
            "wafv2:*",
          ],
          effect: Effect.ALLOW,
          resources: ["*"],
        }),
      ],
    });

    new Role(this, "GithubActionsOIDCRole", {
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
        CloudFormationPolicy: cloudFormationPolicy,
      },
    });
  }
}
