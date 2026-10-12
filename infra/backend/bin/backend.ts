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
    "http://localhost:8080",
  ],
  // Public key; comes from the CLERK_PUBLISHABLE_KEY variable in the deploy workflow.
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? "",
  githubContentBranch: "main",
  githubContentRepo: "besigheim-informiert/besigheim-connect",
  // Create once: aws ssm put-parameter --name /besigheim-connect/github-token --type SecureString --value '<fine-grained PAT, contents:write>'
  githubTokenParameterName: "/besigheim-connect/github-token",
  githubPagesDnsTarget: "besigheim-informiert.github.io",
  mailRecipients: ["tanja.bayer@cubesoft.org"],
  // Platform organisation: its admins review mail submissions. It is not a club and has no club page.
  siteAdminOrgSlug: "unser-besigheim",
};

Tags.of(app).add("Application", "besigheim-connect");

new BackendStack(app, `BesigheimConnectBackend`, {
  allowedOrigins: config.allowedOrigins,
  baseDomain: config.baseDomain,
  clerkPublishableKey: config.clerkPublishableKey,
  env: {
    account: config.account,
    region: config.region,
  },
  githubContentBranch: config.githubContentBranch,
  githubContentRepo: config.githubContentRepo,
  githubPagesDnsTarget: config.githubPagesDnsTarget,
  githubTokenParameterName: config.githubTokenParameterName,
  mailRecipients: config.mailRecipients,
  siteAdminOrgSlug: config.siteAdminOrgSlug,
});

new GithubActionsOidcStack(app, "GitHubActionsOIDC", {
  env: { account: config.account, region: config.region },
  clientIds: ["sts.amazonaws.com"],
  deployStackNames: ["BesigheimConnectBackend"],
  subject: "repo:besigheim-informiert/besigheim-connect:*",
});
