# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Nx
- AWS CDK

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## AWS backend

The frontend remains at the repository root so Lovable can continue to edit and preview it with `npm run dev`.
Nx project metadata has been added around that shape:

```sh
npm run nx -- show projects
npm run nx -- run web:build
npm run nx -- run backend:synth
```

The AWS backend is defined with CDK in `infra/backend` and Lambda code in `apps/backend`.
By default it deploys to AWS account `027825871768`, region `eu-central-1`.

```sh
npm run backend-bootstrap
npm run backend-diff
npm run backend-deploy
```

The stack creates an HTTP API with:

- `GET /health`
- `POST /contact`

Contact submissions are stored in DynamoDB with a 180-day TTL.
The backend also creates an SES inbound mail flow:

- SES receipt rule receives configured mail recipients
- Raw emails are stored in S3
- A Lambda parses the email with Bedrock in the EU model profile
- Parsed documents are stored in DynamoDB
- Complete documents are committed to GitHub as individual JSON files under `src/content/<type>/`

Frontend content is loaded from one JSON file per entry:

- `src/content/vereine/*.json`
- `src/content/veranstaltungen/*.json`
- `src/content/engagement/*.json`
- `src/content/barrierefreiheit/*.json`

After deployment, copy the `ApiUrl` stack output into the frontend environment:

```sh
VITE_API_BASE_URL=https://example.execute-api.eu-central-1.amazonaws.com npm run dev
```

For production CORS origins, pass them at synth/deploy time:

```sh
FRONTEND_ORIGINS=https://www.example.de npm run backend-deploy
```

To override the target environment intentionally, use CDK context or environment variables:

```sh
npm run cdk -- synth -c stage=prod -c region=eu-central-1
CDK_DEPLOY_ACCOUNT=027825871768 CDK_DEPLOY_REGION=eu-central-1 npm run backend-deploy
```

Mail ingestion can be configured with:

- `MAIL_RECIPIENTS`: comma-separated SES recipient addresses or domains. Defaults to `daten@unser-besigheim.de`
- `BEDROCK_MODEL_ID`: Bedrock model or inference profile. Defaults to `eu.amazon.nova-lite-v1:0`
- `GITHUB_REPOSITORY`: owner/repo used for document commits. GitHub Actions sets this automatically
- `GITHUB_BRANCH`: target branch for document commits. Defaults to `main`
- `GITHUB_TOKEN_SECRET_NAME`: optional AWS Secrets Manager secret containing a GitHub token. If omitted, parsing and DynamoDB storage still run, but GitHub commits are skipped

For SES receiving, verify the domain/address in SES and point the domain MX record at the inbound SES endpoint for `eu-central-1`.
The deployed receipt rule set is activated by the stack.

### GitHub Actions deployment

The workflow in `.github/workflows/deploy.yml` deploys the frontend to GitHub Pages and deploys the CDK backend to account `027825871768` in `eu-central-1`.
It runs on pushes to `main` and can also be started manually with a `dev` or `prod` stage.

Configure these repository settings before the first run:

- Secret `AWS_DEPLOY_ROLE_ARN`: IAM role ARN assumed through GitHub OIDC
- Optional variable `FRONTEND_ORIGINS`: comma-separated CORS origins, for example `https://www.example.de`
- Optional variable `VITE_API_BASE_URL`: deployed backend API URL used by the contact form
- Optional variable `VITE_BASE_PATH`: GitHub Pages base path. Defaults to `/<repository-name>/`; use `/` for a custom domain or user/organization Pages site
- Optional variable `MAIL_RECIPIENTS`: comma-separated inbound email recipients for SES
- Optional variable `BEDROCK_MODEL_ID`: EU-hosted Bedrock model or inference profile
- Optional variable `GITHUB_TOKEN_SECRET_NAME`: AWS Secrets Manager secret name that contains a GitHub token for committing parsed documents

The AWS role needs permission to deploy the CDK stack and access the CDK bootstrap resources in the account.
In GitHub repository settings, set Pages to deploy from GitHub Actions.

If CDK prints `Need to perform AWS calls for account 027825871768, but no credentials have been configured`, the GitHub deploy role has not been created yet or local AWS credentials are missing.
The GitHub OIDC role is a one-time setup step and cannot create itself from GitHub Actions.
Run this once from a machine that has the `unser-besigheim` profile configured in `~/.aws/credentials` with administrator credentials for account `027825871768`:

```sh
AWS_PROFILE=unser-besigheim npm run backend-bootstrap
AWS_PROFILE=unser-besigheim npm run cdk -- deploy GitHubActionsOIDC -c includeGithubOidc=true -c githubRepo=OWNER/REPO
```

Then copy the `GithubActionsRoleArn` output into the GitHub secret `AWS_DEPLOY_ROLE_ARN`.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
