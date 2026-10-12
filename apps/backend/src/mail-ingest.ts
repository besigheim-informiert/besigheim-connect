import type { S3Event } from "aws-lambda";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { simpleParser, type AddressObject } from "mailparser";
import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
  type ContentType,
  ingestRequiredFields as documentRequirements,
} from "../../../src/shared/content-schema";

/**
 * Mail ingest: SES -> S3 -> here. The AI extraction is only a *proposal*:
 * every submission is stored as `needs_review` and published solely by a
 * Plattform-Admin through the admin API (`POST /admin/freigabe/:id/freigeben`).
 * Nothing on this path ever writes to the git repository.
 */
const bedrock = new BedrockRuntimeClient({});
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

type DocumentType = ContentType;

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
          id,
          isComplete,
          missingFields,
          notes: extracted.notes ?? null,
          source: {
            bucket,
            key,
          },
          status: "needs_review",
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
            "Bei veranstaltung ist datum der erste Tag. Geht die Veranstaltung ueber mehrere Tage, setze zusaetzlich das optionale Feld enddatum auf den letzten Tag; bei eintaegigen Veranstaltungen lass enddatum weg.",
            "Wiederholt sich eine veranstaltung regelmaessig, beschreibe den Rhythmus im optionalen Feld wiederholung (zum Beispiel 'Jeden Donnerstag ausserhalb der Ferien') und setze datum auf den naechsten Termin; bei einmaligen Veranstaltungen lass wiederholung weg.",
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
