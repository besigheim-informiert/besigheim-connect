#!/usr/bin/env node
import { App, Tags } from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stack";
import { GithubActionsOidcStack } from "../lib/github-actions-oidc.stack";

const app = new App();

const config = {
  account: "027825871768",
  region: "eu-central-1",
  baseDomain: "unser-besigheim.de",
  allowedOrigins: [
    "https://unser-besigheim.de",
    "https://www.unser-besigheim.de",
    "https://localhost:4403",
  ],
  githubPagesDnsTarget: "besigheim-informiert.github.io",
  mailRecipients: ["tanja.bayer@cubesoft.org"],
};

Tags.of(app).add("Application", "besigheim-connect");

new BackendStack(app, `BesigheimConnectBackend`, {
  allowedOrigins: config.allowedOrigins,
  baseDomain: config.baseDomain,
  env: {
    account: config.account,
    region: config.region,
  },
  githubPagesDnsTarget: config.githubPagesDnsTarget,
  mailRecipients: config.mailRecipients,
});

new GithubActionsOidcStack(app, "GitHubActionsOIDC", {
  env: { account: config.account, region: config.region },
  clientIds: ["sts.amazonaws.com"],
  roleName: "GithubActionsRole",
  subject: "repo:besigheim-informiert/besigheim-connect:*",
});
