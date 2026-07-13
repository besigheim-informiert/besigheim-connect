import type { S3Event } from "aws-lambda";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { simpleParser, type AddressObject } from "mailparser";
import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";

const bedrock = new BedrockRuntimeClient({});
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const secretsManager = new SecretsManagerClient({});

const documentRequirements = {
  barrierefreiheit: [
    "name",
    "kategorie",
    "strasse",
    "zugang",
    "sehbehinderung",
    "wc",
    "parkplatz",
  ],
  engagement: [
    "titel",
    "beschreibung",
    "vereinId",
    "vereinName",
    "art",
    "kontakt",
  ],
  veranstaltung: [
    "titel",
    "beschreibung",
    "datum",
    "uhrzeit",
    "ort",
    "vereinId",
    "vereinName",
    "kategorie",
    "kontakt",
  ],
  verein: [
    "name",
    "kurzbeschreibung",
    "beschreibung",
    "kategorie",
    "zielgruppe",
    "angebote",
    "ansprechpartner",
    "email",
    "telefon",
    "adresse",
  ],
} as const;

type DocumentType = keyof typeof documentRequirements;

const githubContentFolders: Record<DocumentType, string> = {
  barrierefreiheit: "src/content/barrierefreiheit",
  engagement: "src/content/engagement",
  veranstaltung: "src/content/veranstaltungen",
  verein: "src/content/vereine",
};

type ParsedDocument = {
  confidence?: number;
  document?: Record<string, unknown>;
  missingFields?: string[];
  notes?: string;
  type?: DocumentType | "unknown";
};

export async function handler(event: S3Event) {
  const tableName = requireEnv("INGESTED_DOCUMENTS_TABLE_NAME");

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const rawEmail = await loadEmail(bucket, key);
    const parsedEmail = await simpleParser(rawEmail);
    const extracted = await extractDocument({
      attachments: parsedEmail.attachments.map((attachment) => ({
        contentType: attachment.contentType,
        filename: attachment.filename,
        text: attachment.contentType.startsWith("text/")
          ? attachment.content.toString("utf8").slice(0, 12_000)
          : undefined,
      })),
      from: formatAddress(parsedEmail.from),
      html: parsedEmail.html
        ? String(parsedEmail.html).slice(0, 20_000)
        : undefined,
      subject: parsedEmail.subject,
      text: parsedEmail.text?.slice(0, 30_000),
      to: formatAddress(parsedEmail.to),
    });

    const type = normalizeType(extracted.type);
    const document = extracted.document ?? {};
    const missingFields = type
      ? findMissingFields(type, document, extracted.missingFields)
      : ["type"];
    const isComplete = Boolean(type && missingFields.length === 0);
    const id = createDocumentId(type, document, key);
    const now = new Date();
    const githubResult = isComplete
      ? await pushToGithub({ document, id, type })
      : { skipped: true };

    await dynamodb.send(
      new PutCommand({
        Item: {
          bedrockConfidence: extracted.confidence ?? null,
          bedrockModelId: "eu.amazon.nova-lite-v1:0",
          createdAt: now.toISOString(),
          document,
          email: {
            from: formatAddress(parsedEmail.from) ?? null,
            messageId: parsedEmail.messageId ?? null,
            subject: parsedEmail.subject ?? null,
            to: formatAddress(parsedEmail.to) ?? null,
          },
          expiresAt: Math.floor(now.getTime() / 1000) + 365 * 24 * 60 * 60,
          github: githubResult,
          id,
          isComplete,
          missingFields,
          notes: extracted.notes ?? null,
          source: {
            bucket,
            key,
          },
          status: isComplete ? "complete" : "needs_review",
          type: type ?? "unknown",
        },
        TableName: tableName,
      })
    );
  }
}

function formatAddress(
  address: AddressObject | AddressObject[] | undefined
): string | undefined {
  if (!address) {
    return undefined;
  }

  if (Array.isArray(address)) {
    return (
      address
        .map((item) => item.text)
        .filter(Boolean)
        .join(", ") || undefined
    );
  }

  return address.text;
}

async function loadEmail(bucket: string, key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.Body) {
    throw new Error(`Email object ${bucket}/${key} has no body`);
  }

  return streamToBuffer(response.Body as Readable);
}

async function extractDocument(email: unknown): Promise<ParsedDocument> {
  const response = await bedrock.send(
    new ConverseCommand({
      inferenceConfig: {
        maxTokens: 1800,
        temperature: 0,
      },
      messages: [
        {
          content: [
            {
              text: JSON.stringify(email),
            },
          ],
          role: "user",
        },
      ],
      modelId: process.env.BEDROCK_MODEL_ID ?? "eu.amazon.nova-lite-v1:0",
      system: [
        {
          text: [
            "Du extrahierst strukturierte Daten aus E-Mails fuer ein lokales Besigheimer Portal.",
            "Antworte ausschliesslich mit JSON, ohne Markdown.",
            "Klassifiziere genau einen Typ: verein, veranstaltung, engagement, barrierefreiheit oder unknown.",
            "Nutze diese Pflichtfelder:",
            JSON.stringify(documentRequirements),
            "Datumswerte muessen ISO-Format YYYY-MM-DD haben. Uhrzeiten muessen HH:mm sein.",
            "Falls Pflichtfelder fehlen, liste sie in missingFields. Erfinde keine Daten.",
            "Das Feld document enthaelt nur Daten des erkannten Typs.",
          ].join(" "),
        },
      ],
    })
  );

  const text =
    response.output?.message?.content
      ?.map((part) => ("text" in part ? part.text : ""))
      .join("") ?? "";
  return parseJsonObject(text);
}

function parseJsonObject(text: string): ParsedDocument {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as ParsedDocument;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as ParsedDocument;
    }
    throw new Error("Bedrock response did not contain JSON");
  }
}

function normalizeType(type: unknown): DocumentType | undefined {
  return type === "verein" ||
    type === "veranstaltung" ||
    type === "engagement" ||
    type === "barrierefreiheit"
    ? type
    : undefined;
}

function findMissingFields(
  type: DocumentType,
  document: Record<string, unknown>,
  modelMissingFields: string[] | undefined
): string[] {
  const required = documentRequirements[type];
  const missing = new Set<string>(
    Array.isArray(modelMissingFields) ? modelMissingFields : []
  );

  for (const field of required) {
    const value = document[field];

    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missing.add(field);
    }
  }

  return [...missing].sort();
}

async function pushToGithub(input: {
  document: Record<string, unknown>;
  id: string;
  type: DocumentType | undefined;
}) {
  const repo = process.env.GITHUB_REPO;
  const secretName = process.env.GITHUB_TOKEN_SECRET_NAME;

  if (!repo || !secretName || !input.type) {
    return { skipped: true };
  }

  const token = await loadGithubToken(secretName);
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const path = `${githubContentFolders[input.type]}/${input.id}.json`;
  const content = Buffer.from(
    JSON.stringify(input.document, null, 2) + "\n"
  ).toString("base64");
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      body: JSON.stringify({
        branch,
        committer: {
          email: "github-actions[bot]@users.noreply.github.com",
          name: "besigheim-connect mail ingest",
        },
        content,
        message: `Add ${input.type} submission ${input.id}`,
      }),
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "user-agent": "besigheim-connect-mail-ingest",
        "x-github-api-version": "2022-11-28",
      },
      method: "PUT",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub commit failed with ${response.status}: ${body.slice(0, 500)}`
    );
  }

  const result = (await response.json()) as {
    commit?: { sha?: string };
    content?: { html_url?: string; path?: string };
  };
  return {
    commitSha: result.commit?.sha ?? null,
    path: result.content?.path ?? path,
    skipped: false,
    url: result.content?.html_url ?? null,
  };
}

async function loadGithubToken(secretName: string): Promise<string> {
  const response = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );

  const secret = response.SecretString ?? "";

  try {
    const parsed = JSON.parse(secret) as { token?: unknown };
    if (typeof parsed.token === "string" && parsed.token.trim()) {
      return parsed.token.trim();
    }
  } catch {
    // Plain secret strings are supported too.
  }

  if (!secret.trim()) {
    throw new Error(`GitHub token secret ${secretName} is empty`);
  }

  return secret.trim();
}

function createDocumentId(
  type: DocumentType | undefined,
  document: Record<string, unknown>,
  sourceKey: string
): string {
  const label = String(document.titel ?? document.name ?? randomUUID());
  const slug = label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  const hash = createHash("sha256")
    .update(`${sourceKey}:${JSON.stringify(document)}`)
    .digest("hex")
    .slice(0, 10);
  return `${type ?? "unknown"}-${slug || "submission"}-${hash}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}
