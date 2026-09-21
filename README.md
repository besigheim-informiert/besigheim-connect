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

## Authentication (Clerk)

The frontend reads its Clerk publishable key from `VITE_CLERK_PUBLISHABLE_KEY`.
`ClerkProvider` in `src/main.tsx` picks the variable up automatically through `import.meta.env`, so it is never passed as a prop.
Vite inlines the value at build time - if it is missing, `ClerkProvider` throws and the deployed page stays blank.

For local development, put the **test** instance key in `.env.local` (gitignored):

```sh
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

The production instance (`clerk.unser-besigheim.de`) is wired into `.github/workflows/deploy.yml`.
Publishable keys (`pk_...`) are public by design and are bound to their domain; secret keys (`sk_...`) belong in `.env.local` or a secret store and must never be committed.

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
- Nothing from this path is published automatically: every parsed document waits as `needs_review` until a platform admin approves it in `/admin/freigabe` (see 'Vereinsverwaltung' below), which commits it as a JSON file under `src/content/<type>/`

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

The mail ingest itself never writes to GitHub. Content commits are made by the admin API; its repository, branch and
token parameter are set in `infra/backend/bin/backend.ts` (see 'Vereinsverwaltung' below).

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
- Optional variable `VITE_CLERK_PUBLISHABLE_KEY`: overrides the production Clerk key that the deploy workflow bakes into the build. Only needed to point a deployment at a different Clerk instance
- Optional variable `MAIL_RECIPIENTS`: comma-separated inbound email recipients for SES
- Optional variable `BEDROCK_MODEL_ID`: EU-hosted Bedrock model or inference profile

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

## Vereinsverwaltung (`/admin`)

Vereinsadmins pflegen Vereinsdaten und Veranstaltungen selbst; jede Änderung wird
als Commit nach `src/content/` geschrieben und durch den Deploy-Workflow veröffentlicht.
Per E-Mail eingegangene Inhalte (KI-Extraktion) landen dagegen in einer Freigabe-Warteschlange
und werden erst nach Prüfung durch einen Plattform-Admin veröffentlicht.

### Einrichtung

1. **Clerk-Dashboard**
   - *Organizations* aktivieren. Rollen: `admin` (darf schreiben), `member` (nur lesen).
   - *User & Authentication → Restrictions*: Sign-up-Modus **Restricted** - Konten entstehen nur per Einladung.
   - *Organizations → Settings*: „Allow users to create organizations“ **deaktivieren**.
   - Pro Verein eine Organization anlegen, **Slug = Verein-ID** aus `src/content/vereine/<id>.json`
     (z. B. `spvgg-besigheim`). Die Organization `unser-besigheim` ist die Plattform-Administration und selbst kein Verein;
     ihre Admins sehen die Freigabe. Wer zusätzlich einen Verein pflegt, wird auch in dessen Organization eingeladen.
   - Vereinsadmins per E-Mail in ihre Organization einladen (Rolle `admin`).
2. **GitHub**: nichts zu tun. Der Workflow nutzt den Publishable Key der Produktions-Instanz für
   den Frontend-Build **und** das Backend-Deployment (die API prüft Tokens gegen genau diese Instanz).
   Die optionale Repository-Variable `VITE_CLERK_PUBLISHABLE_KEY` überschreibt beide gemeinsam.
3. **AWS**: Parameter `/besigheim-connect/github-token` im Systems Manager Parameter Store anlegen
   (Typ `SecureString`, Standard-Tier, kostenlos) - ein Fine-grained Personal Access Token nur für
   dieses Repository mit `Contents: Read and write`:
   ```sh
   aws ssm put-parameter --name /besigheim-connect/github-token --type SecureString --value '<token>'
   ```
   Token erneuern: denselben Befehl mit `--overwrite` ausführen.
4. Lokal: `.env.local` mit `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...` (siehe `.gitignore`).

### Berechtigungen (serverseitig erzwungen)

| Wer | Darf |
| --- | --- |
| Nicht angemeldet / ohne Organization | nichts |
| `member` eines Vereins | eigene Vereinsdaten und Veranstaltungen ansehen |
| `admin` eines Vereins | eigene Vereinsdaten bearbeiten, Veranstaltungen anlegen, ändern, löschen |
| `admin` von `unser-besigheim` (Plattform) | E-Mail-Einreichungen prüfen, freigeben, ablehnen. Keine Vereinsseite: zum Bearbeiten eines Vereins in dessen Organization wechseln |

Der Verein kommt immer aus dem verifizierten Clerk-Token (Org-Slug), nie aus dem Request.
