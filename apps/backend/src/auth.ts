/**
 * Clerk session-token verification for the admin API.
 *
 * Networkless apart from the JWKS document, which is fetched from the Clerk
 * Frontend API (derived from the publishable key - no secret needed) and cached
 * in the Lambda's memory. The SPA alone protects nothing; every admin request
 * passes through here and the organisation/role come from the verified token,
 * never from the request body.
 */
import { createPublicKey, verify as verifySignature, type JsonWebKey } from "node:crypto";

export type AuthContext = {
  userId: string;
  /** Clerk organisation id, when the session has an active organisation. */
  orgId?: string;
  /** Organisation slug - mapped 1:1 to the `Verein` id in the content. */
  orgSlug?: string;
  /** Role inside the active organisation, without the `org:` prefix. */
  orgRole?: string;
};

export type AuthConfig = {
  /** Clerk publishable key, `pk_test_...` or `pk_live_...`. */
  publishableKey: string;
  /** Origins allowed as the token's authorized party (`azp`). */
  authorizedParties: readonly string[];
  /** Override for tests. */
  fetchJwks?: (url: string) => Promise<Jwks>;
  now?: () => number;
};

export type Jwks = { keys: Array<JsonWebKey & { kid?: string; alg?: string; use?: string }> };

export class AuthError extends Error {
  readonly statusCode = 401;
}

const clockSkewSeconds = 5;
const jwksCacheTtlMs = 60 * 60 * 1000;
const jwksRefetchCooldownMs = 60 * 1000;

const jwksCache = new Map<string, { fetchedAt: number; jwks: Jwks }>();

/** Frontend API host encoded in the publishable key, e.g. `clerk.unser-besigheim.de`. */
export function frontendApiFromPublishableKey(publishableKey: string): string {
  const match = /^pk_(test|live)_(.+)$/.exec(publishableKey.trim());
  if (!match) {
    throw new Error("CLERK_PUBLISHABLE_KEY is not a Clerk publishable key");
  }
  const host = Buffer.from(match[2], "base64").toString("utf8").replace(/\$$/, "");
  if (!/^[a-z0-9.-]+$/i.test(host)) {
    throw new Error("CLERK_PUBLISHABLE_KEY does not contain a valid frontend API host");
  }
  return host;
}

export function bearerToken(headers: Record<string, string | undefined>): string | undefined {
  const value = headers.authorization ?? headers.Authorization;
  const match = value ? /^Bearer\s+(.+)$/i.exec(value.trim()) : null;
  return match?.[1];
}

export async function verifySessionToken(
  token: string,
  config: AuthConfig,
): Promise<AuthContext> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthError("Malformed token");
  }
  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJson(headerPart);
  const payload = decodeJson(payloadPart);

  if (header.alg !== "RS256" || typeof header.kid !== "string") {
    throw new AuthError("Unsupported token algorithm");
  }

  const host = frontendApiFromPublishableKey(config.publishableKey);
  const jwk = await findKey(`https://${host}/.well-known/jwks.json`, header.kid, config);
  if (!jwk) {
    throw new AuthError("Unknown signing key");
  }

  const publicKey = createPublicKey({ format: "jwk", key: jwk });
  const valid = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${headerPart}.${payloadPart}`),
    publicKey,
    Buffer.from(signaturePart, "base64url"),
  );
  if (!valid) {
    throw new AuthError("Invalid token signature");
  }

  const nowSeconds = Math.floor((config.now?.() ?? Date.now()) / 1000);
  if (typeof payload.exp !== "number" || payload.exp + clockSkewSeconds < nowSeconds) {
    throw new AuthError("Token expired");
  }
  if (typeof payload.nbf === "number" && payload.nbf - clockSkewSeconds > nowSeconds) {
    throw new AuthError("Token not yet valid");
  }
  if (payload.iss !== `https://${host}`) {
    throw new AuthError("Unexpected token issuer");
  }
  if (typeof payload.azp === "string" && !config.authorizedParties.includes(payload.azp)) {
    throw new AuthError("Unexpected authorized party");
  }
  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new AuthError("Token has no subject");
  }

  return { userId: payload.sub, ...organisationClaims(payload) };
}

/**
 * Clerk session tokens come in two shapes: v1 with flat `org_*` claims and v2
 * with a compact `o` object (`v: 2`). Both are accepted.
 */
function organisationClaims(payload: Record<string, unknown>): Omit<AuthContext, "userId"> {
  const compact = payload.o;
  if (compact && typeof compact === "object") {
    const o = compact as Record<string, unknown>;
    return {
      orgId: optionalString(o.id),
      orgRole: normaliseRole(o.rol),
      orgSlug: optionalString(o.slg),
    };
  }
  return {
    orgId: optionalString(payload.org_id),
    orgRole: normaliseRole(payload.org_role),
    orgSlug: optionalString(payload.org_slug),
  };
}

function normaliseRole(value: unknown): string | undefined {
  const role = optionalString(value);
  return role?.replace(/^org:/, "");
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function decodeJson(part: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new AuthError("Malformed token");
  }
}

async function findKey(url: string, kid: string, config: AuthConfig) {
  const now = config.now?.() ?? Date.now();
  const cached = jwksCache.get(url);
  let jwks = cached && now - cached.fetchedAt < jwksCacheTtlMs ? cached.jwks : undefined;

  const lookup = () => jwks?.keys.find((key) => key.kid === kid);

  if (!jwks || (!lookup() && now - (cached?.fetchedAt ?? 0) > jwksRefetchCooldownMs)) {
    jwks = await (config.fetchJwks ?? fetchJwks)(url);
    jwksCache.set(url, { fetchedAt: now, jwks });
  }

  const key = lookup();
  return key && (!key.use || key.use === "sig") ? key : undefined;
}

async function fetchJwks(url: string): Promise<Jwks> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`JWKS request failed with ${response.status}`);
  }
  const body = (await response.json()) as Jwks;
  if (!Array.isArray(body.keys)) {
    throw new Error("JWKS document has no keys");
  }
  return body;
}

/** Test helper - the cache is module state shared by all invocations. */
export function clearJwksCache() {
  jwksCache.clear();
}
