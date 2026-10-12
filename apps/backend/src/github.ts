/**
 * Git projection of the published content: every published record is one JSON
 * file under `src/content/<typ>/`, committed to the main branch. A push there
 * triggers the GitHub Actions build, which is how a change becomes visible on
 * the static site a few minutes later.
 */
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import {
  type ContentType,
  publishedContentDir,
} from "../../../src/shared/content-schema";

const ssm = new SSMClient({});

export type GithubConfig = {
  repo: string;
  branch: string;
  /** SSM Parameter Store name of the SecureString holding the GitHub token. */
  tokenParameterName: string;
};

export type Committer = { name: string; email: string };

export type ContentFile = {
  path: string;
  sha: string;
  record: Record<string, unknown>;
};

const defaultCommitter: Committer = {
  email: "github-actions[bot]@users.noreply.github.com",
  name: "besigheim-connect admin",
};

let cachedToken: { name: string; value: string } | undefined;
/** Blob contents keyed by git sha - immutable, so safe to cache for the Lambda's lifetime. */
const blobCache = new Map<string, Record<string, unknown>>();

export function githubConfigFromEnv(): GithubConfig | undefined {
  const repo = process.env.GITHUB_REPO;
  const tokenParameterName = process.env.GITHUB_TOKEN_PARAMETER_NAME;
  if (!repo || !tokenParameterName) return undefined;
  return { branch: process.env.GITHUB_BRANCH ?? "main", repo, tokenParameterName };
}

export function recordPath(type: ContentType, id: string): string {
  return `${publishedContentDir[type]}/${id}.json`;
}

export async function readRecord(
  config: GithubConfig,
  type: ContentType,
  id: string,
): Promise<ContentFile | undefined> {
  const path = recordPath(type, id);
  const response = await request(config, `contents/${path}?ref=${config.branch}`);
  if (response.status === 404) return undefined;
  await assertOk(response, `read ${path}`);
  const body = (await response.json()) as { content?: string; encoding?: string; sha: string };
  const record = parseBlob(body.content ?? "");
  blobCache.set(body.sha, record);
  return { path, record, sha: body.sha };
}

/** Every published record of a type. Blob reads run in parallel and are cached by sha. */
export async function listRecords(
  config: GithubConfig,
  type: ContentType,
): Promise<ContentFile[]> {
  const dir = publishedContentDir[type];
  const response = await request(config, `contents/${dir}?ref=${config.branch}`);
  if (response.status === 404) return [];
  await assertOk(response, `list ${dir}`);
  const entries = (await response.json()) as Array<{
    name: string;
    path: string;
    sha: string;
    type: string;
  }>;
  const files = entries.filter((entry) => entry.type === "file" && entry.name.endsWith(".json"));

  const results: ContentFile[] = [];
  for (const chunk of chunks(files, 10)) {
    results.push(
      ...(await Promise.all(
        chunk.map(async (entry) => ({
          path: entry.path,
          record: await readBlob(config, entry.sha),
          sha: entry.sha,
        })),
      )),
    );
  }
  return results;
}

export async function writeRecord(
  config: GithubConfig,
  input: {
    type: ContentType;
    id: string;
    record: Record<string, unknown>;
    message: string;
    /** Current blob sha when updating; omit to create (fails if the file exists). */
    sha?: string;
    committer?: Committer;
  },
): Promise<{ path: string; sha: string; commitSha: string | null }> {
  const path = recordPath(input.type, input.id);
  const content = Buffer.from(JSON.stringify(input.record, null, 2) + "\n").toString("base64");
  const response = await request(config, `contents/${path}`, {
    body: JSON.stringify({
      branch: config.branch,
      committer: input.committer ?? defaultCommitter,
      content,
      message: input.message,
      ...(input.sha ? { sha: input.sha } : {}),
    }),
    method: "PUT",
  });
  await assertOk(response, `write ${path}`);
  const body = (await response.json()) as {
    commit?: { sha?: string };
    content?: { sha?: string };
  };
  return { commitSha: body.commit?.sha ?? null, path, sha: body.content?.sha ?? "" };
}

export async function deleteRecord(
  config: GithubConfig,
  input: { type: ContentType; id: string; sha: string; message: string; committer?: Committer },
): Promise<void> {
  const path = recordPath(input.type, input.id);
  const response = await request(config, `contents/${path}`, {
    body: JSON.stringify({
      branch: config.branch,
      committer: input.committer ?? defaultCommitter,
      message: input.message,
      sha: input.sha,
    }),
    method: "DELETE",
  });
  await assertOk(response, `delete ${path}`);
}

async function readBlob(config: GithubConfig, sha: string): Promise<Record<string, unknown>> {
  const cached = blobCache.get(sha);
  if (cached) return cached;
  const response = await request(config, `git/blobs/${sha}`);
  await assertOk(response, `read blob ${sha}`);
  const body = (await response.json()) as { content?: string };
  const record = parseBlob(body.content ?? "");
  blobCache.set(sha, record);
  return record;
}

function parseBlob(base64: string): Record<string, unknown> {
  const text = Buffer.from(base64.replace(/\n/g, ""), "base64").toString("utf8");
  const parsed = JSON.parse(text);
  return typeof parsed === "object" && parsed !== null ? parsed : {};
}

async function request(config: GithubConfig, endpoint: string, init?: RequestInit) {
  const token = await loadToken(config.tokenParameterName);
  return fetch(`https://api.github.com/repos/${config.repo}/${endpoint}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "besigheim-connect-backend",
      "x-github-api-version": "2022-11-28",
      ...init?.headers,
    },
  });
}

async function assertOk(response: Response, action: string) {
  if (response.ok) return;
  const body = await response.text();
  throw new Error(`GitHub ${action} failed with ${response.status}: ${body.slice(0, 500)}`);
}

/**
 * The token lives in SSM Parameter Store as a SecureString (standard tier, no
 * monthly charge). Cached for the Lambda's lifetime; a rotated token is picked
 * up with the next cold start.
 */
async function loadToken(parameterName: string): Promise<string> {
  if (cachedToken?.name === parameterName) return cachedToken.value;

  const response = await ssm.send(
    new GetParameterCommand({ Name: parameterName, WithDecryption: true }),
  );
  const value = response.Parameter?.Value?.trim() ?? "";

  if (!value) {
    throw new Error(`GitHub token parameter ${parameterName} is empty`);
  }
  cachedToken = { name: parameterName, value };
  return value;
}

function* chunks<T>(items: T[], size: number): Generator<T[]> {
  for (let index = 0; index < items.length; index += size) {
    yield items.slice(index, index + size);
  }
}
