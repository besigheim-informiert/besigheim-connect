import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const retentionDays = 180;
const contactRateLimits = [
  {
    limit: 5,
    retryAfterSeconds: 60,
    ttlSeconds: 5 * 60,
    window: "minute",
  },
  {
    limit: 30,
    retryAfterSeconds: 60 * 60,
    ttlSeconds: 2 * 24 * 60 * 60,
    window: "day",
  },
] as const;

type ContactPayload = {
  email?: unknown;
  message?: unknown;
  name?: unknown;
  organization?: unknown;
  website?: unknown;
};

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  if (method === "GET" && path === "/health") {
    return json(200, {
      ok: true,
      service: "besigheim-connect-backend",
      time: new Date().toISOString(),
    });
  }

  if (method === "POST" && path === "/contact") {
    return createContactSubmission(event);
  }

  return json(404, { message: "Not found" });
}

async function createContactSubmission(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const tableName = process.env.SUBMISSIONS_TABLE_NAME;
  const rateLimitTableName = process.env.RATE_LIMIT_TABLE_NAME;

  if (!tableName || !rateLimitTableName) {
    console.error("Missing contact endpoint environment variables");
    return json(500, { message: "The contact endpoint is not configured." });
  }

  let rateLimitResult: Awaited<ReturnType<typeof checkRateLimit>>;

  try {
    rateLimitResult = await checkRateLimit(
      rateLimitTableName,
      getClientIp(event),
    );
  } catch {
    return json(500, { message: "Could not process the contact request." });
  }

  if (rateLimitResult.allowed === false) {
    return json(
      429,
      {
        message:
          "Zu viele Kontaktanfragen. Bitte warten Sie kurz und versuchen Sie es später erneut.",
      },
      {
        "retry-after": String(rateLimitResult.retryAfterSeconds),
      },
    );
  }

  const payload = parsePayload(event);

  if (!payload) {
    return json(400, { message: "Invalid JSON body." });
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return json(201, { id: randomUUID() });
  }

  const name = cleanText(payload.name, 120);
  const email = cleanText(payload.email, 254);
  const organization = cleanText(payload.organization, 160);
  const message = cleanText(payload.message, 5000);

  if (!name || !email || !message) {
    return json(400, { message: "Name, email and message are required." });
  }

  if (!emailPattern.test(email)) {
    return json(400, { message: "Email address is invalid." });
  }

  const now = new Date();
  const id = randomUUID();
  const expiresAt = Math.floor(now.getTime() / 1000) + retentionDays * 24 * 60 * 60;

  try {
    await dynamodb.send(
      new PutCommand({
        ConditionExpression: "attribute_not_exists(id)",
        Item: {
          createdAt: now.toISOString(),
          email,
          expiresAt,
          id,
          message,
          name,
          organization,
          status: "new",
          userAgent: event.headers["user-agent"] ?? null,
        },
        TableName: tableName,
      }),
    );
  } catch (error) {
    console.error("Failed to store contact submission", error);
    return json(500, { message: "Could not save the contact request." });
  }

  return json(201, { id });
}

async function checkRateLimit(
  tableName: string,
  clientIp: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  const now = new Date();

  for (const config of contactRateLimits) {
    const key = createRateLimitKey(clientIp, now, config.window);
    const expiresAt =
      Math.floor(now.getTime() / 1000) + config.ttlSeconds;

    try {
      await dynamodb.send(
        new UpdateCommand({
          ConditionExpression:
            "attribute_not_exists(#count) OR #count < :limit",
          ExpressionAttributeNames: {
            "#count": "count",
          },
          ExpressionAttributeValues: {
            ":expiresAt": expiresAt,
            ":limit": config.limit,
            ":one": 1,
            ":zero": 0,
          },
          Key: {
            key,
          },
          TableName: tableName,
          UpdateExpression:
            "SET #count = if_not_exists(#count, :zero) + :one, expiresAt = :expiresAt",
        }),
      );
    } catch (error) {
      if (isConditionalCheckFailed(error)) {
        return {
          allowed: false,
          retryAfterSeconds: config.retryAfterSeconds,
        };
      }

      console.error("Failed to check contact rate limit", error);
      throw error;
    }
  }

  return { allowed: true };
}

function createRateLimitKey(
  clientIp: string,
  now: Date,
  window: "minute" | "day",
): string {
  const iso = now.toISOString();
  const bucket = window === "minute" ? iso.slice(0, 16) : iso.slice(0, 10);
  return `contact:${window}:${clientIp}:${bucket}`;
}

function getClientIp(event: APIGatewayProxyEventV2): string {
  return event.requestContext.http.sourceIp || "unknown";
}

function isConditionalCheckFailed(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConditionalCheckFailedException"
  );
}

function parsePayload(event: APIGatewayProxyEventV2): ContactPayload | null {
  if (!event.body) {
    return null;
  }

  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    const parsed = JSON.parse(body);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function json(
  statusCode: number,
  body: unknown,
  headers?: Record<string, string>,
): APIGatewayProxyStructuredResultV2 {
  return {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
    statusCode,
  };
}
