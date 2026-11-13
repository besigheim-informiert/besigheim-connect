import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentType } from "../../../src/shared/content-schema";
import { handleAdminRequest, type AdminDeps } from "./admin";
import type { AuthContext } from "./auth";
import type { ContentFile } from "./github";

/** In-memory repository content: `<type>/<id>` -> record. */
const files = new Map<string, Record<string, unknown>>();
let session: AuthContext;

vi.mock("./auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth")>();
  return { ...actual, verifySessionToken: vi.fn(async () => session) };
});

vi.mock("./github", () => {
  const file = (type: ContentType, id: string): ContentFile | undefined => {
    const record = files.get(`${type}/${id}`);
    return record ? { path: `${type}/${id}.json`, record, sha: `sha-${id}` } : undefined;
  };
  return {
    deleteRecord: vi.fn(async (_config, input: { type: ContentType; id: string }) => {
      files.delete(`${input.type}/${input.id}`);
    }),
    listRecords: vi.fn(async (_config, type: ContentType) =>
      [...files.keys()]
        .filter((key) => key.startsWith(`${type}/`))
        .map((key) => file(type, key.slice(type.length + 1)) as ContentFile),
    ),
    readRecord: vi.fn(async (_config, type: ContentType, id: string) => file(type, id)),
    writeRecord: vi.fn(async (_config, input: { type: ContentType; id: string; record: Record<string, unknown> }) => {
      files.set(`${input.type}/${input.id}`, input.record);
      return { commitSha: "commit-1", path: `${input.type}/${input.id}.json` };
    }),
  };
});

const deps = {
  auth: {},
  dynamodb: {},
  github: { branch: "main", repo: "owner/repo", tokenParameterName: "/token" },
  ingestedTableName: "ingested",
  siteAdminOrgSlug: "unser-besigheim",
} as unknown as AdminDeps;

function request(method: string, path: string, body?: unknown): APIGatewayProxyEventV2 {
  return {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { authorization: "Bearer token" },
    isBase64Encoded: false,
    rawPath: path,
    requestContext: { http: { method } },
  } as unknown as APIGatewayProxyEventV2;
}

async function call(method: string, path: string, body?: unknown) {
  const result = await handleAdminRequest(request(method, path, body), deps);
  return { body: JSON.parse(String(result.body)), status: result.statusCode };
}

const angebot = {
  art: "regelmäßig",
  beschreibung: "Wir suchen Unterstützung beim Training.",
  kontakt: "trainer@example.de",
  titel: "Trainer gesucht",
};

describe("admin API: engagement offers", () => {
  beforeEach(() => {
    files.clear();
    files.set("verein/tsv-besigheim", { id: "tsv-besigheim", name: "TSV Besigheim" });
    files.set("verein/spvgg-besigheim", { id: "spvgg-besigheim", name: "SpVgg Besigheim" });
    files.set("engagement/fremdes-angebot", {
      ...angebot,
      id: "fremdes-angebot",
      vereinId: "spvgg-besigheim",
      vereinName: "SpVgg Besigheim",
    });
    session = { orgRole: "admin", orgSlug: "tsv-besigheim", userId: "user_1" } as AuthContext;
  });

  it("creates an offer for the caller's club, ignoring a club sent in the body", async () => {
    const created = await call("POST", "/admin/engagement", {
      ...angebot,
      vereinId: "spvgg-besigheim",
      vereinName: "Falscher Verein",
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      id: "trainer-gesucht",
      vereinId: "tsv-besigheim",
      vereinName: "TSV Besigheim",
    });
    expect(files.get("engagement/trainer-gesucht")).toMatchObject({ vereinId: "tsv-besigheim" });
  });

  it("lists only the caller's own offers", async () => {
    await call("POST", "/admin/engagement", angebot);

    const list = await call("GET", "/admin/engagement");

    expect(list.status).toBe(200);
    expect(list.body.map((a: { id: string }) => a.id)).toEqual(["trainer-gesucht"]);
  });

  it("answers 404 for another club's offer on read, update and delete", async () => {
    expect((await call("GET", "/admin/engagement/fremdes-angebot")).status).toBe(404);
    expect((await call("PUT", "/admin/engagement/fremdes-angebot", angebot)).status).toBe(404);
    expect((await call("DELETE", "/admin/engagement/fremdes-angebot")).status).toBe(404);
    expect(files.has("engagement/fremdes-angebot")).toBe(true);
  });

  it("updates and deletes the caller's own offer", async () => {
    await call("POST", "/admin/engagement", angebot);

    const updated = await call("PUT", "/admin/engagement/trainer-gesucht", { ...angebot, art: "einmalig" });
    expect(updated.status).toBe(200);
    expect(files.get("engagement/trainer-gesucht")).toMatchObject({ art: "einmalig", id: "trainer-gesucht" });

    const deleted = await call("DELETE", "/admin/engagement/trainer-gesucht");
    expect(deleted.status).toBe(200);
    expect(files.has("engagement/trainer-gesucht")).toBe(false);
  });

  it("returns field errors for invalid input", async () => {
    const result = await call("POST", "/admin/engagement", { ...angebot, art: "manchmal", kontakt: "" });

    expect(result.status).toBe(400);
    expect(Object.keys(result.body.details).sort()).toEqual(["art", "kontakt"]);
  });

  it("lets members read but not write", async () => {
    session = { ...session, orgRole: "member" };

    expect((await call("GET", "/admin/engagement")).status).toBe(200);
    expect((await call("POST", "/admin/engagement", angebot)).status).toBe(403);
  });

  it("closes the endpoints to the platform organisation", async () => {
    session = { ...session, orgSlug: "unser-besigheim" };

    expect((await call("GET", "/admin/engagement")).status).toBe(403);
    expect((await call("POST", "/admin/engagement", angebot)).status).toBe(403);
  });

  it("keeps the event endpoints working", async () => {
    const created = await call("POST", "/admin/veranstaltungen", {
      beschreibung: "Training für alle",
      datum: "2026-12-01",
      kategorie: "Sport",
      ort: "Halle",
      titel: "Probetraining",
      uhrzeit: "18:00",
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ id: "2026-12-01-18-00-probetraining", vereinId: "tsv-besigheim" });
  });
});
