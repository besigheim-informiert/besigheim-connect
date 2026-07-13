import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const retentionDays = 180;

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

  if (!tableName) {
    console.error("Missing SUBMISSIONS_TABLE_NAME environment variable");
    return json(500, { message: "The contact endpoint is not configured." });
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

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    statusCode,
  };
}
