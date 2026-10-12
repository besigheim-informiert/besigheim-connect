/**
 * Admin API - `/admin/*`.
 *
 * Two audiences:
 *  - Vereinsadmins (Clerk organisation role `admin`) manage their own club and
 *    its events. Their organisation slug *is* the club id; every write is
 *    scoped to it and published straight to git.
 *  - Plattform-Admins (admins of the organisation named in
 *    `SITE_ADMIN_ORG_SLUG`) review what the mail ingest extracted with AI:
 *    those records are never published without a human approving them. That
 *    organisation is the platform itself, not a club - it has no club page and
 *    no events of its own, so the club endpoints are closed to it.
 */
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  GetCommand,
  QueryCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  buildRecordId,
  isContentType,
  isSlug,
  validateRecord,
  type ContentType,
} from "../../../src/shared/content-schema";
import {
  AuthError,
  bearerToken,
  verifySessionToken,
  type AuthConfig,
  type AuthContext,
} from "./auth";
import {
  deleteRecord,
  listRecords,
  readRecord,
  writeRecord,
  type ContentFile,
  type GithubConfig,
} from "./github";
import { json, parseJsonBody, type HttpResult } from "./http";

export type AdminDeps = {
  auth: AuthConfig;
  dynamodb: DynamoDBDocumentClient;
  github: GithubConfig;
  ingestedTableName: string;
  siteAdminOrgSlug: string;
};

class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

type Principal = AuthContext & {
  vereinId?: string;
  kannBearbeiten: boolean;
  /** The active organisation is the platform organisation (any role). */
  istPlattformOrg: boolean;
  istPlattformAdmin: boolean;
};

export async function handleAdminRequest(
  event: APIGatewayProxyEventV2,
  deps: AdminDeps,
): Promise<HttpResult> {
  try {
    const principal = await authenticate(event, deps);
    return await route(event, principal, deps);
  } catch (error) {
    if (error instanceof AuthError) {
      return json(401, { message: "Bitte melden Sie sich an." });
    }
    if (error instanceof HttpError) {
      return json(error.statusCode, { details: error.details, message: error.message });
    }
    console.error("Admin request failed", error);
    return json(500, { message: "Die Anfrage konnte nicht verarbeitet werden." });
  }
}

async function authenticate(event: APIGatewayProxyEventV2, deps: AdminDeps): Promise<Principal> {
  const token = bearerToken(event.headers);
  if (!token) {
    throw new AuthError("Missing bearer token");
  }
  const ctx = await verifySessionToken(token, deps.auth);
  const kannBearbeiten = ctx.orgRole === "admin";
  const istPlattformOrg = ctx.orgSlug === deps.siteAdminOrgSlug;
  return {
    ...ctx,
    istPlattformAdmin: kannBearbeiten && istPlattformOrg,
    istPlattformOrg,
    kannBearbeiten,
    // The platform organisation's slug must never be used as a club id.
    vereinId: istPlattformOrg ? undefined : ctx.orgSlug,
  };
}

async function route(
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const method = event.requestContext.http.method;
  const segments = event.rawPath.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const [resource, id, action] = segments;

  if (method === "GET" && resource === "me" && segments.length === 1) {
    return json(200, {
      istPlattformAdmin: principal.istPlattformAdmin,
      istPlattformOrg: principal.istPlattformOrg,
      kannBearbeiten: principal.kannBearbeiten,
      rolle: principal.orgRole ?? null,
      userId: principal.userId,
      vereinId: principal.vereinId ?? null,
    });
  }

  if (resource === "verein" && segments.length === 1) {
    if (method === "GET") return getVerein(principal, deps);
    if (method === "PUT") return putVerein(event, principal, deps);
  }

  if (resource === "veranstaltungen") {
    if (segments.length === 1) {
      if (method === "GET") return listVeranstaltungen(principal, deps);
      if (method === "POST") return createVeranstaltung(event, principal, deps);
    }
    if (segments.length === 2 && isSlug(id)) {
      if (method === "GET") return getVeranstaltung(id, principal, deps);
      if (method === "PUT") return updateVeranstaltung(id, event, principal, deps);
      if (method === "DELETE") return deleteVeranstaltung(id, principal, deps);
    }
  }

  if (resource === "freigabe") {
    requireSiteAdmin(principal);
    if (segments.length === 1 && method === "GET") return listReviewQueue(deps);
    if (segments.length === 2 && id) {
      if (method === "GET") return getReviewItem(id, deps);
      if (method === "PUT") return updateReviewItem(id, event, principal, deps);
    }
    if (segments.length === 3 && id && method === "POST") {
      if (action === "freigeben") return approveReviewItem(id, event, principal, deps);
      if (action === "ablehnen") return rejectReviewItem(id, event, principal, deps);
    }
  }

  return json(404, { message: "Not found" });
}

// ---------------------------------------------------------------------------
// Verein
// ---------------------------------------------------------------------------

async function getVerein(principal: Principal, deps: AdminDeps): Promise<HttpResult> {
  const vereinId = requireVerein(principal);
  const file = await readRecord(deps.github, "verein", vereinId);
  if (!file) {
    throw new HttpError(404, "Für diesen Verein gibt es noch keine veröffentlichten Daten.");
  }
  return json(200, file.record);
}

async function putVerein(
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const vereinId = requireVerein(principal);
  requireEditor(principal);
  const record = validateBody("verein", event);
  record.id = vereinId;

  const existing = await readRecord(deps.github, "verein", vereinId);
  const result = await writeRecord(deps.github, {
    id: vereinId,
    message: commitMessage("verein", existing ? "aktualisiert" : "angelegt", vereinId, principal),
    record: orderKeys(record, "verein"),
    sha: existing?.sha,
    type: "verein",
  });
  return json(200, { ...record, _commit: result.commitSha });
}

// ---------------------------------------------------------------------------
// Veranstaltungen
// ---------------------------------------------------------------------------

async function listVeranstaltungen(principal: Principal, deps: AdminDeps): Promise<HttpResult> {
  const vereinId = requireVerein(principal);
  const files = await listRecords(deps.github, "veranstaltung");
  const records = files
    .map((file) => file.record)
    .filter((record) => record.vereinId === vereinId)
    .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)));
  return json(200, records);
}

async function getVeranstaltung(
  id: string,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const file = await ownedVeranstaltung(id, principal, deps);
  return json(200, file.record);
}

async function createVeranstaltung(
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const vereinId = requireVerein(principal);
  requireEditor(principal);
  const record = validateBody("veranstaltung", event);
  const verein = await requireVereinRecord(vereinId, deps);
  record.vereinId = vereinId;
  record.vereinName = verein.name;
  delete record.id;

  const id = await uniqueId("veranstaltung", record, deps);
  record.id = id;
  const result = await writeRecord(deps.github, {
    id,
    message: commitMessage("veranstaltung", "angelegt", id, principal),
    record: orderKeys(record, "veranstaltung"),
    type: "veranstaltung",
  });
  return json(201, { ...record, _commit: result.commitSha });
}

async function updateVeranstaltung(
  id: string,
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  requireEditor(principal);
  const existing = await ownedVeranstaltung(id, principal, deps);
  const record = validateBody("veranstaltung", event);
  const verein = await readRecord(deps.github, "verein", principal.vereinId as string);
  record.id = id;
  record.vereinId = existing.record.vereinId;
  record.vereinName = verein ? verein.record.name : existing.record.vereinName;

  const result = await writeRecord(deps.github, {
    id,
    message: commitMessage("veranstaltung", "aktualisiert", id, principal),
    record: orderKeys(record, "veranstaltung"),
    sha: existing.sha,
    type: "veranstaltung",
  });
  return json(200, { ...record, _commit: result.commitSha });
}

async function deleteVeranstaltung(
  id: string,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  requireEditor(principal);
  const existing = await ownedVeranstaltung(id, principal, deps);
  await deleteRecord(deps.github, {
    id,
    message: commitMessage("veranstaltung", "gelöscht", id, principal),
    sha: existing.sha,
    type: "veranstaltung",
  });
  return json(200, { id });
}

/** The event file, provided it belongs to the caller's club - otherwise 404 (never leak other clubs' ids). */
async function ownedVeranstaltung(
  id: string,
  principal: Principal,
  deps: AdminDeps,
): Promise<ContentFile> {
  const vereinId = requireVerein(principal);
  const file = await readRecord(deps.github, "veranstaltung", id);
  if (!file || file.record.vereinId !== vereinId) {
    throw new HttpError(404, "Veranstaltung nicht gefunden.");
  }
  return file;
}

// ---------------------------------------------------------------------------
// Freigabe (review queue for AI-extracted mail submissions)
// ---------------------------------------------------------------------------

type ReviewItem = {
  id: string;
  status: string;
  type: string;
  document: Record<string, unknown>;
  createdAt: string;
  email?: { from?: string | null; subject?: string | null };
  missingFields?: string[];
  notes?: string | null;
  bedrockConfidence?: number | null;
};

async function listReviewQueue(deps: AdminDeps): Promise<HttpResult> {
  const result = await deps.dynamodb.send(
    new QueryCommand({
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "needs_review" },
      IndexName: "status-index",
      KeyConditionExpression: "#status = :status",
      Limit: 100,
      ScanIndexForward: false,
      TableName: deps.ingestedTableName,
    }),
  );
  const items = (result.Items ?? []) as ReviewItem[];
  return json(
    200,
    items.map((item) => ({
      absender: item.email?.from ?? null,
      betreff: item.email?.subject ?? null,
      createdAt: item.createdAt,
      fehlendeFelder: item.missingFields ?? [],
      id: item.id,
      titel: String(item.document?.titel ?? item.document?.name ?? ""),
      type: item.type,
    })),
  );
}

async function getReviewItem(id: string, deps: AdminDeps): Promise<HttpResult> {
  const item = await loadReviewItem(id, deps);
  return json(200, {
    absender: item.email?.from ?? null,
    betreff: item.email?.subject ?? null,
    createdAt: item.createdAt,
    document: item.document ?? {},
    fehlendeFelder: item.missingFields ?? [],
    hinweise: item.notes ?? null,
    id: item.id,
    konfidenz: item.bedrockConfidence ?? null,
    status: item.status,
    type: item.type,
  });
}

/** Save edits to a queued item without publishing; the type may be corrected too. */
async function updateReviewItem(
  id: string,
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const item = await loadReviewItem(id, deps);
  requireNeedsReview(item);
  const { document, type } = reviewBody(event, item);

  await deps.dynamodb.send(
    new UpdateCommand({
      ConditionExpression: "#status = :needsReview",
      ExpressionAttributeNames: { "#document": "document", "#status": "status", "#type": "type" },
      ExpressionAttributeValues: {
        ":by": principal.userId,
        ":document": document,
        ":needsReview": "needs_review",
        ":now": new Date().toISOString(),
        ":type": type,
      },
      Key: { id },
      TableName: deps.ingestedTableName,
      UpdateExpression: "SET #document = :document, #type = :type, updatedAt = :now, updatedBy = :by",
    }),
  );
  return json(200, { document, id, type });
}

async function approveReviewItem(
  id: string,
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const item = await loadReviewItem(id, deps);
  requireNeedsReview(item);
  const { document, type } = reviewBody(event, item);

  const validation = validateRecord(type, document);
  if (validation.ok === false) {
    throw new HttpError(400, "Bitte prüfen Sie die markierten Felder.", validation.errors);
  }
  const record = validation.record;
  delete record.id;

  if (type === "veranstaltung" || type === "engagement") {
    const vereinId = document.vereinId;
    if (!isSlug(vereinId)) {
      throw new HttpError(400, "Bitte prüfen Sie die markierten Felder.", {
        vereinId: "Bitte einen Verein auswählen.",
      });
    }
    const verein = await readRecord(deps.github, "verein", vereinId);
    if (!verein) {
      throw new HttpError(400, "Bitte prüfen Sie die markierten Felder.", {
        vereinId: "Diesen Verein gibt es nicht.",
      });
    }
    record.vereinId = vereinId;
    record.vereinName = verein.record.name;
  }

  const recordId = await uniqueId(type, record, deps);
  record.id = recordId;
  const result = await writeRecord(deps.github, {
    id: recordId,
    message: `content(${type}): ${recordId} aus E-Mail-Einreichung ${id} freigegeben (${principal.userId})`,
    record: orderKeys(record, type),
    type,
  });

  await deps.dynamodb.send(
    new UpdateCommand({
      ConditionExpression: "#status = :needsReview",
      ExpressionAttributeNames: { "#document": "document", "#status": "status", "#type": "type" },
      ExpressionAttributeValues: {
        ":by": principal.userId,
        ":document": record,
        ":needsReview": "needs_review",
        ":now": new Date().toISOString(),
        ":path": result.path,
        ":published": "published",
        ":type": type,
      },
      Key: { id },
      TableName: deps.ingestedTableName,
      UpdateExpression:
        "SET #status = :published, #document = :document, #type = :type, publishedAt = :now, publishedBy = :by, publishedPath = :path",
    }),
  );
  return json(200, { id, record, type });
}

async function rejectReviewItem(
  id: string,
  event: APIGatewayProxyEventV2,
  principal: Principal,
  deps: AdminDeps,
): Promise<HttpResult> {
  const item = await loadReviewItem(id, deps);
  requireNeedsReview(item);
  const body = parseJsonBody(event) ?? {};
  const grund = typeof body.grund === "string" ? body.grund.trim().slice(0, 500) : "";

  await deps.dynamodb.send(
    new UpdateCommand({
      ConditionExpression: "#status = :needsReview",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":by": principal.userId,
        ":needsReview": "needs_review",
        ":now": new Date().toISOString(),
        ":reason": grund,
        ":rejected": "rejected",
      },
      Key: { id },
      TableName: deps.ingestedTableName,
      UpdateExpression: "SET #status = :rejected, rejectedAt = :now, rejectedBy = :by, rejectionReason = :reason",
    }),
  );
  return json(200, { id, status: "rejected" });
}

async function loadReviewItem(id: string, deps: AdminDeps): Promise<ReviewItem> {
  const result = await deps.dynamodb.send(
    new GetCommand({ Key: { id }, TableName: deps.ingestedTableName }),
  );
  if (!result.Item) {
    throw new HttpError(404, "Einreichung nicht gefunden.");
  }
  return result.Item as ReviewItem;
}

function requireNeedsReview(item: ReviewItem) {
  if (item.status !== "needs_review") {
    throw new HttpError(409, "Diese Einreichung wurde bereits bearbeitet.");
  }
}

/** Type and document for a review action: the body overrides what is stored. */
function reviewBody(
  event: APIGatewayProxyEventV2,
  item: ReviewItem,
): { type: ContentType; document: Record<string, unknown> } {
  const body = parseJsonBody(event) ?? {};
  const type = body.type ?? item.type;
  if (!isContentType(type)) {
    throw new HttpError(400, "Bitte prüfen Sie die markierten Felder.", {
      type: "Bitte einen Inhaltstyp auswählen.",
    });
  }
  const document =
    typeof body.document === "object" && body.document !== null && !Array.isArray(body.document)
      ? (body.document as Record<string, unknown>)
      : (item.document ?? {});
  return { document, type };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireVerein(principal: Principal): string {
  if (principal.istPlattformOrg) {
    throw new HttpError(
      403,
      "Die Plattform-Organisation hat keine Vereinsseite. Wechseln Sie zu einem Verein, um dessen Daten zu bearbeiten.",
    );
  }
  if (!principal.vereinId) {
    throw new HttpError(403, "Bitte wählen Sie zuerst einen Verein aus.");
  }
  return principal.vereinId;
}

function requireEditor(principal: Principal) {
  if (!principal.kannBearbeiten) {
    throw new HttpError(403, "Nur Vereinsadministratoren dürfen Inhalte bearbeiten.");
  }
}

function requireSiteAdmin(principal: Principal) {
  if (!principal.istPlattformAdmin) {
    throw new HttpError(403, "Die Freigabe ist der Plattform-Administration vorbehalten.");
  }
}

async function requireVereinRecord(vereinId: string, deps: AdminDeps) {
  const verein = await readRecord(deps.github, "verein", vereinId);
  if (!verein) {
    throw new HttpError(409, "Bitte legen Sie zuerst die Vereinsdaten an.");
  }
  return verein.record as { name?: string };
}

function validateBody(type: ContentType, event: APIGatewayProxyEventV2): Record<string, unknown> {
  const body = parseJsonBody(event);
  if (!body) {
    throw new HttpError(400, "Ungültige Anfrage.");
  }
  const validation = validateRecord(type, body);
  if (validation.ok === false) {
    throw new HttpError(400, "Bitte prüfen Sie die markierten Felder.", validation.errors);
  }
  return validation.record;
}

/** First free id for a new record: the natural id, then `-2`, `-3`, ... */
async function uniqueId(
  type: ContentType,
  record: Record<string, unknown>,
  deps: AdminDeps,
): Promise<string> {
  const base = buildRecordId(type, record);
  if (!isSlug(base)) {
    throw new HttpError(400, "Aus diesen Angaben lässt sich keine Adresse bilden.");
  }
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    if (!(await readRecord(deps.github, type, candidate))) {
      return candidate;
    }
  }
  throw new HttpError(409, "Es gibt bereits zu viele Einträge mit diesem Namen.");
}

const keyOrder: Record<ContentType, readonly string[]> = {
  barrierefreiheit: ["id", "name", "kategorie", "facharzt", "strasse", "telefon", "zugang", "sehbehinderung", "wc", "parkplatz"],
  engagement: ["id", "titel", "beschreibung", "vereinId", "vereinName", "art", "kontakt"],
  veranstaltung: ["id", "titel", "beschreibung", "datum", "enddatum", "uhrzeit", "wiederholung", "ort", "vereinId", "vereinName", "kategorie", "kontakt", "bild", "bildAlt"],
  verein: ["id", "name", "kurzbeschreibung", "beschreibung", "kategorie", "zielgruppe", "angebote", "ansprechpartner", "email", "telefon", "website", "adresse"],
};

/** Stable key order so the committed JSON matches the hand-written files and diffs stay small. */
function orderKeys(record: Record<string, unknown>, type: ContentType): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  for (const key of keyOrder[type]) {
    if (record[key] !== undefined) ordered[key] = record[key];
  }
  for (const key of Object.keys(record)) {
    if (!(key in ordered)) ordered[key] = record[key];
  }
  return ordered;
}

function eventSortKey(record: Record<string, unknown>): string {
  return `${record.datum ?? ""} ${record.uhrzeit ?? ""}`;
}

function commitMessage(type: ContentType, verb: string, id: string, principal: Principal): string {
  return `content(${type}): ${id} ${verb} (Verein ${principal.vereinId}, ${principal.userId})`;
}
