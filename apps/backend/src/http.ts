import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export type HttpResult = APIGatewayProxyStructuredResultV2;

export function json(
  statusCode: number,
  body: unknown,
  headers?: Record<string, string>,
): HttpResult {
  return {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
    statusCode,
  };
}

/** Parsed JSON object body, or null when the body is missing or not an object. */
export function parseJsonBody(event: APIGatewayProxyEventV2): Record<string, unknown> | null {
  if (!event.body) {
    return null;
  }

  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    const parsed = JSON.parse(body);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
