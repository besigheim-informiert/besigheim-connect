import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  AuthError,
  bearerToken,
  clearJwksCache,
  frontendApiFromPublishableKey,
  verifySessionToken,
  type Jwks,
} from "./auth";

const host = "clerk.example.test";
const publishableKey = `pk_test_${Buffer.from(`${host}$`).toString("base64")}`;
const origin = "https://unser-besigheim.de";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });

const jwks: Jwks = { keys: [{ ...publicKey.export({ format: "jwk" }), kid: "key-1", use: "sig" }] };

function token(claims: Record<string, unknown>, key: KeyObject = privateKey, header = { alg: "RS256", kid: "key-1" }) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode(header)}.${encode(claims)}`;
  const signature = sign("RSA-SHA256", Buffer.from(body), key).toString("base64url");
  return `${body}.${signature}`;
}

const now = 1_800_000_000_000;
const validClaims = {
  azp: origin,
  exp: now / 1000 + 60,
  iat: now / 1000,
  iss: `https://${host}`,
  nbf: now / 1000 - 5,
  sub: "user_1",
};

const config = {
  authorizedParties: [origin],
  fetchJwks: async () => jwks,
  now: () => now,
  publishableKey,
};

describe("frontendApiFromPublishableKey", () => {
  it("decodes the frontend API host", () => {
    expect(frontendApiFromPublishableKey(publishableKey)).toBe(host);
  });

  it("rejects keys that are not Clerk publishable keys", () => {
    expect(() => frontendApiFromPublishableKey("sk_test_abc")).toThrow();
  });
});

describe("bearerToken", () => {
  it("extracts the token from the authorization header", () => {
    expect(bearerToken({ authorization: "Bearer abc.def.ghi" })).toBe("abc.def.ghi");
    expect(bearerToken({})).toBeUndefined();
    expect(bearerToken({ authorization: "Basic xyz" })).toBeUndefined();
  });
});

describe("verifySessionToken", () => {
  beforeEach(() => clearJwksCache());

  it("accepts a valid v1 token with organisation claims", async () => {
    const ctx = await verifySessionToken(
      token({ ...validClaims, org_id: "org_1", org_role: "org:admin", org_slug: "spvgg-besigheim" }),
      config,
    );
    expect(ctx).toEqual({ orgId: "org_1", orgRole: "admin", orgSlug: "spvgg-besigheim", userId: "user_1" });
  });

  it("accepts a valid v2 token with the compact organisation claim", async () => {
    const ctx = await verifySessionToken(
      token({ ...validClaims, o: { id: "org_1", rol: "admin", slg: "spvgg-besigheim" }, v: 2 }),
      config,
    );
    expect(ctx.orgSlug).toBe("spvgg-besigheim");
    expect(ctx.orgRole).toBe("admin");
  });

  it("leaves the organisation empty for personal sessions", async () => {
    const ctx = await verifySessionToken(token(validClaims), config);
    expect(ctx).toEqual({ orgId: undefined, orgRole: undefined, orgSlug: undefined, userId: "user_1" });
  });

  it("rejects a token signed with another key", async () => {
    await expect(verifySessionToken(token(validClaims, otherPrivateKey), config)).rejects.toBeInstanceOf(AuthError);
  });

  it("rejects an expired token", async () => {
    await expect(
      verifySessionToken(token({ ...validClaims, exp: now / 1000 - 60 }), config),
    ).rejects.toThrow("Token expired");
  });

  it("rejects a token from another issuer", async () => {
    await expect(
      verifySessionToken(token({ ...validClaims, iss: "https://evil.example" }), config),
    ).rejects.toThrow("Unexpected token issuer");
  });

  it("rejects a token issued to another origin", async () => {
    await expect(
      verifySessionToken(token({ ...validClaims, azp: "https://evil.example" }), config),
    ).rejects.toThrow("Unexpected authorized party");
  });

  it("rejects unsigned tokens", async () => {
    await expect(
      verifySessionToken(token(validClaims, privateKey, { alg: "none", kid: "key-1" }), config),
    ).rejects.toThrow("Unsupported token algorithm");
  });

  it("rejects unknown signing keys", async () => {
    await expect(
      verifySessionToken(token(validClaims, privateKey, { alg: "RS256", kid: "other" }), config),
    ).rejects.toThrow("Unknown signing key");
  });
});
