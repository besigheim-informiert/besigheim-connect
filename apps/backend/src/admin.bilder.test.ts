import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bildBaseUrl, isImagePath, validateRecord } from "../../../src/shared/content-schema";
import { handleAdminRequest, type AdminDeps } from "./admin";
import type { AuthContext } from "./auth";
import { writeRecord } from "./github";
import { decodeBase64, detectImageType, imageKey, imageUrl, maxImageBytes, type ImageStore } from "./images";

let session: AuthContext;

vi.mock("./auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth")>();
  return { ...actual, verifySessionToken: vi.fn(async () => session) };
});

vi.mock("./github", () => ({
  deleteRecord: vi.fn(),
  listRecords: vi.fn(async () => []),
  readRecord: vi.fn(async () => undefined),
  writeRecord: vi.fn(),
}));

const put = vi.fn<ImageStore["put"]>(async () => {});

function deps(images: ImageStore | null = { put }): AdminDeps {
  return {
    auth: {},
    dynamodb: {},
    github: { branch: "main", repo: "owner/repo", tokenParameterName: "/token" },
    images: images ?? undefined,
    ingestedTableName: "ingested",
    siteAdminOrgSlug: "unser-besigheim",
  } as unknown as AdminDeps;
}

async function upload(body: unknown, adminDeps = deps()) {
  const result = await handleAdminRequest(
    {
      body: JSON.stringify(body),
      headers: { authorization: "Bearer token" },
      isBase64Encoded: false,
      rawPath: "/admin/bilder",
      requestContext: { http: { method: "POST" } },
    } as unknown as APIGatewayProxyEventV2,
    adminDeps,
  );
  return { body: JSON.parse(String(result.body)), status: result.statusCode };
}

const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(64)]);
const avif = Buffer.concat([Buffer.alloc(4), Buffer.from("ftypavif"), Buffer.alloc(64)]);

describe("image helpers", () => {
  it("detects formats from magic bytes", () => {
    expect(detectImageType(jpeg)?.extension).toBe("jpg");
    expect(detectImageType(png)?.extension).toBe("png");
    expect(detectImageType(webp)?.extension).toBe("webp");
    expect(detectImageType(avif)?.extension).toBe("avif");
    expect(detectImageType(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeUndefined();
    expect(detectImageType(Buffer.from("GIF89a"))).toBeUndefined();
  });

  it("builds unique keys whose URLs pass the schema", () => {
    const type = { extension: "jpg", mimeType: "image/jpeg" } as const;
    const first = imageKey("tsv-besigheim", "Sommerfest 2026 (Foto).JPG", type);
    const second = imageKey("tsv-besigheim", "Sommerfest 2026 (Foto).JPG", type);

    expect(first).toMatch(/^veranstaltungen\/tsv-besigheim-sommerfest-2026-foto-[0-9a-f]{8}\.jpg$/);
    expect(first).not.toBe(second);
    expect(isImagePath(imageUrl(first))).toBe(true);
    expect(imageKey("tsv-besigheim", "../../.env", type)).toMatch(/^veranstaltungen\/tsv-besigheim-[a-z0-9-]+\.jpg$/);
  });

  it("decodes base64 strictly", () => {
    expect(decodeBase64(jpeg.toString("base64"))?.equals(jpeg)).toBe(true);
    expect(decodeBase64(`data:image/jpeg;base64,${jpeg.toString("base64")}`)?.equals(jpeg)).toBe(true);
    expect(decodeBase64("not base64!")).toBeUndefined();
    expect(decodeBase64("")).toBeUndefined();
  });
});

describe("bild field validation", () => {
  it("accepts uploaded picture URLs and legacy paths, nothing else", () => {
    expect(isImagePath(`${bildBaseUrl}/veranstaltungen/tsv-fest-1a2b3c4d.jpg`)).toBe(true);
    expect(isImagePath("/veranstaltungen/netzwerktreffen.jpg")).toBe(true);

    expect(isImagePath("https://example.com/veranstaltungen/fest.jpg")).toBe(false);
    expect(isImagePath(`${bildBaseUrl}/../geheim.jpg`)).toBe(false);
    expect(isImagePath(`${bildBaseUrl}/veranstaltungen/fest.svg`)).toBe(false);
    expect(isImagePath(`${bildBaseUrl}/anderer-ordner/fest.jpg`)).toBe(false);
    expect(isImagePath(`${bildBaseUrl}.evil.test/veranstaltungen/fest.jpg`)).toBe(false);
  });

  it("lets an event be saved with an uploaded picture", () => {
    const result = validateRecord("veranstaltung", {
      beschreibung: "Fest",
      bild: `${bildBaseUrl}/veranstaltungen/tsv-fest-1a2b3c4d.jpg`,
      datum: "2026-12-01",
      kategorie: "Feste",
      ort: "Marktplatz",
      titel: "Sommerfest",
      uhrzeit: "18:00",
    });
    expect(result.ok).toBe(true);
  });
});

describe("admin API: image upload", () => {
  beforeEach(() => {
    put.mockClear();
    vi.mocked(writeRecord).mockClear();
    session = { orgRole: "admin", orgSlug: "tsv-besigheim", userId: "user_1" } as AuthContext;
  });

  it("stores the picture in S3 and returns its public URL, without a commit", async () => {
    const result = await upload({ daten: jpeg.toString("base64"), dateiname: "fest.jpg" });

    expect(result.status).toBe(201);
    expect(result.body.pfad).toMatch(/^https:\/\/bilder\.unser-besigheim\.de\/veranstaltungen\/tsv-besigheim-fest-[0-9a-f]{8}\.jpg$/);
    expect(isImagePath(result.body.pfad)).toBe(true);

    const stored = put.mock.calls[0][0];
    expect(`${bildBaseUrl}/${stored.key}`).toBe(result.body.pfad);
    expect(stored.body.equals(jpeg)).toBe(true);
    expect(stored.contentType).toBe("image/jpeg");
    expect(stored.metadata).toEqual({ "uploaded-by": "user_1", verein: "tsv-besigheim" });
    expect(writeRecord).not.toHaveBeenCalled();
  });

  it("uses the detected format, not the file name", async () => {
    const result = await upload({ daten: png.toString("base64"), dateiname: "foto.jpg" });

    expect(result.status).toBe(201);
    expect(result.body.pfad).toMatch(/\.png$/);
    expect(put.mock.calls[0][0].contentType).toBe("image/png");
  });

  it("rejects files that are not supported pictures", async () => {
    const svg = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>");

    expect((await upload({ daten: svg.toString("base64"), dateiname: "bild.jpg" })).status).toBe(415);
    expect((await upload({ daten: "kein base64", dateiname: "bild.jpg" })).status).toBe(400);
    expect((await upload({ dateiname: "bild.jpg" })).status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it("rejects pictures above the size limit", async () => {
    const gross = Buffer.concat([jpeg, Buffer.alloc(maxImageBytes)]);

    expect((await upload({ daten: gross.toString("base64"), dateiname: "gross.jpg" })).status).toBe(413);
    expect(put).not.toHaveBeenCalled();
  });

  it("only lets club admins upload", async () => {
    session = { ...session, orgRole: "member" };
    expect((await upload({ daten: jpeg.toString("base64"), dateiname: "a.jpg" })).status).toBe(403);

    session = { ...session, orgRole: "admin", orgSlug: "unser-besigheim" };
    expect((await upload({ daten: jpeg.toString("base64"), dateiname: "a.jpg" })).status).toBe(403);

    expect(put).not.toHaveBeenCalled();
  });

  it("answers 503 when no picture storage is configured", async () => {
    const result = await upload({ daten: jpeg.toString("base64"), dateiname: "a.jpg" }, deps(null));

    expect(result.status).toBe(503);
  });
});
