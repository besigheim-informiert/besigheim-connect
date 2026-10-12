/**
 * Single source of truth for the four content types of the Besigheim portal.
 *
 * Consumed by:
 *  - Frontend data loaders (`src/data/*`) - re-export the record types.
 *  - Backend mail-ingest / CRUD (`apps/backend/src/*`) - required-field policy
 *    and the git target folders.
 *  - (Phase 3) auto-generated admin forms - the `contentFields` metadata.
 *
 * Keep this file framework-free (no React, no `import.meta`, no Node APIs) so the
 * Lambda bundle and the browser build can both import it, and so it type-checks
 * cleanly under the backend's `strict: true`.
 */

export const contentTypes = [
  "verein",
  "veranstaltung",
  "engagement",
  "barrierefreiheit",
] as const;

export type ContentType = (typeof contentTypes)[number];

export function isContentType(value: unknown): value is ContentType {
  return (
    typeof value === "string" &&
    (contentTypes as readonly string[]).includes(value)
  );
}

/**
 * Repo folder (relative to the repository root) that holds the *published* JSON
 * for each type. This is the git projection the static frontend builds from.
 */
export const publishedContentDir: Record<ContentType, string> = {
  verein: "src/content/vereine",
  veranstaltung: "src/content/veranstaltungen",
  engagement: "src/content/engagement",
  barrierefreiheit: "src/content/barrierefreiheit",
};

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export const barriereStatusValues = [
  "ja",
  "teilweise",
  "nein",
  "unbekannt",
  "na",
] as const;
export type BarriereStatus = (typeof barriereStatusValues)[number];

export const barriereKategorieValues = [
  "Arztpraxis",
  "Zahnarzt",
  "Tierarzt",
  "Hebamme",
  "Apotheke",
  "Physiotherapie",
  "Logopädie",
  "Ergotherapie",
  "Polizei",
  "Post",
  "Recht & Notariat",
  "Verwaltung",
] as const;
export type BarriereKategorie = (typeof barriereKategorieValues)[number];

export const engagementArtValues = [
  "regelmäßig",
  "projektbezogen",
  "einmalig",
] as const;
export type EngagementArt = (typeof engagementArtValues)[number];

// ---------------------------------------------------------------------------
// Record types (shape of a stored/published entry). `id` is system-generated.
// ---------------------------------------------------------------------------

export interface Verein {
  id: string;
  name: string;
  kurzbeschreibung: string;
  beschreibung: string;
  kategorie: string;
  zielgruppe: string;
  angebote: string[];
  ansprechpartner?: string;
  email?: string;
  telefon?: string;
  website?: string;
  adresse?: string;
}

export interface Veranstaltung {
  id: string;
  titel: string;
  beschreibung: string;
  datum: string; // ISO YYYY-MM-DD - start (or only) day
  enddatum?: string; // ISO YYYY-MM-DD - last day for multi-day events; omit for single-day
  uhrzeit: string; // HH:mm
  /**
   * Free-text recurrence rhythm for series events, e.g. "Jeden Donnerstag
   * außerhalb der Ferien". `datum` then holds the next occurrence. Omit for
   * one-off events.
   */
  wiederholung?: string;
  ort: string;
  vereinId: string;
  vereinName: string;
  kategorie: string;
  kontakt?: string;
  /**
   * Optional event picture, as a path below `public/` served from the site
   * root, e.g. "/veranstaltungen/netzwerktreffen.jpg". Kept out of `src/assets`
   * so the mail ingest can drop an attachment in without touching the build.
   */
  bild?: string;
  /** Alt text for `bild`. Falls back to the event title when not set. */
  bildAlt?: string;
}

export interface EngagementAngebot {
  id: string;
  titel: string;
  beschreibung: string;
  vereinId: string;
  vereinName: string;
  art: EngagementArt;
  kontakt: string;
}

export interface Einrichtung {
  id: string;
  name: string;
  kategorie: BarriereKategorie;
  facharzt?: string;
  strasse: string;
  telefon?: string;
  zugang: BarriereStatus;
  sehbehinderung: BarriereStatus;
  wc: BarriereStatus;
  parkplatz: BarriereStatus;
}

export interface ContentRecordMap {
  verein: Verein;
  veranstaltung: Veranstaltung;
  engagement: EngagementAngebot;
  barrierefreiheit: Einrichtung;
}

export type ContentRecord = ContentRecordMap[ContentType];

// ---------------------------------------------------------------------------
// Form metadata - drives auto-generated admin forms (Phase 3) and validation.
// `required` here means "required for a valid record" (matches the record types
// above). This is intentionally distinct from `ingestRequiredFields` below,
// which is the completeness policy the mail-extraction AI is held to.
// ---------------------------------------------------------------------------

export type FieldKind =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "date" // ISO YYYY-MM-DD
  | "time" // HH:mm
  | "select"
  | "list" // string[]
  | "image"; // path below public/, e.g. "/veranstaltungen/foo.jpg"

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  options?: readonly string[];
}

export const contentFields: Record<ContentType, readonly FieldDef[]> = {
  verein: [
    { name: "name", label: "Name", kind: "text", required: true },
    {
      name: "kurzbeschreibung",
      label: "Kurzbeschreibung",
      kind: "textarea",
      required: true,
    },
    {
      name: "beschreibung",
      label: "Beschreibung",
      kind: "textarea",
      required: true,
    },
    { name: "kategorie", label: "Kategorie", kind: "text", required: true },
    { name: "zielgruppe", label: "Zielgruppe", kind: "text", required: true },
    { name: "angebote", label: "Angebote", kind: "list", required: true },
    { name: "adresse", label: "Adresse", kind: "text", required: false },
    {
      name: "ansprechpartner",
      label: "Ansprechpartner",
      kind: "text",
      required: false,
    },
    { name: "email", label: "E-Mail", kind: "email", required: false },
    { name: "telefon", label: "Telefon", kind: "tel", required: false },
    { name: "website", label: "Website", kind: "url", required: false },
  ],
  veranstaltung: [
    { name: "titel", label: "Titel", kind: "text", required: true },
    {
      name: "beschreibung",
      label: "Beschreibung",
      kind: "textarea",
      required: true,
    },
    { name: "datum", label: "Datum", kind: "date", required: true },
    { name: "enddatum", label: "Enddatum", kind: "date", required: false },
    { name: "uhrzeit", label: "Uhrzeit", kind: "time", required: true },
    {
      name: "wiederholung",
      label: "Wiederholung",
      kind: "text",
      required: false,
    },
    { name: "ort", label: "Ort", kind: "text", required: true },
    { name: "kategorie", label: "Kategorie", kind: "text", required: true },
    { name: "kontakt", label: "Kontakt", kind: "text", required: false },
    { name: "bild", label: "Bild", kind: "image", required: false },
    { name: "bildAlt", label: "Bildbeschreibung", kind: "text", required: false },
    { name: "vereinId", label: "Verein-ID", kind: "text", required: true },
    { name: "vereinName", label: "Vereinsname", kind: "text", required: true },
  ],
  engagement: [
    { name: "titel", label: "Titel", kind: "text", required: true },
    {
      name: "beschreibung",
      label: "Beschreibung",
      kind: "textarea",
      required: true,
    },
    {
      name: "art",
      label: "Art",
      kind: "select",
      required: true,
      options: engagementArtValues,
    },
    { name: "kontakt", label: "Kontakt", kind: "text", required: true },
    { name: "vereinId", label: "Verein-ID", kind: "text", required: true },
    { name: "vereinName", label: "Vereinsname", kind: "text", required: true },
  ],
  barrierefreiheit: [
    { name: "name", label: "Name", kind: "text", required: true },
    {
      name: "kategorie",
      label: "Kategorie",
      kind: "select",
      required: true,
      options: barriereKategorieValues,
    },
    { name: "strasse", label: "Straße", kind: "text", required: true },
    { name: "facharzt", label: "Fachrichtung", kind: "text", required: false },
    { name: "telefon", label: "Telefon", kind: "tel", required: false },
    {
      name: "zugang",
      label: "Zugang",
      kind: "select",
      required: true,
      options: barriereStatusValues,
    },
    {
      name: "sehbehinderung",
      label: "Sehbehinderung",
      kind: "select",
      required: true,
      options: barriereStatusValues,
    },
    {
      name: "wc",
      label: "WC",
      kind: "select",
      required: true,
      options: barriereStatusValues,
    },
    {
      name: "parkplatz",
      label: "Parkplatz",
      kind: "select",
      required: true,
      options: barriereStatusValues,
    },
  ],
};

/**
 * Completeness policy for the mail-extraction AI: the fields a submission must
 * contain before it is considered "complete" (mirrors the previous
 * `documentRequirements` in mail-ingest.ts to keep ingest behaviour unchanged).
 */
export const ingestRequiredFields: Record<ContentType, readonly string[]> = {
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
};

// ---------------------------------------------------------------------------
// Ids, validation and normalisation - shared by the admin API (server-side
// enforcement) and the admin forms (immediate feedback). Framework-free.
// ---------------------------------------------------------------------------

/**
 * Fields the server derives from the caller's organisation and never accepts
 * from a form. They are hidden in the admin forms and overwritten on save.
 */
export const derivedFields: Record<ContentType, readonly string[]> = {
  verein: [],
  veranstaltung: ["vereinId", "vereinName"],
  engagement: ["vereinId", "vereinName"],
  barrierefreiheit: [],
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Site-root path below `public/`, e.g. "/veranstaltungen/netzwerktreffen.jpg". */
const imagePathPattern = /^\/[A-Za-z0-9/_.-]+\.(?:jpe?g|png|webp|avif|gif)$/i;

/** URL-safe slug: lower-case ASCII letters, digits and single hyphens. */
export function slugify(value: string, maxLength = 80): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && slugPattern.test(value);
}

/** True for a real calendar day in ISO form (rejects 2026-02-30). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !isoDatePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * File/URL id of a published record. Events encode day, time and title (as
 * the existing content files do) so the folder sorts chronologically; the
 * other types use their name. Ids are assigned once and kept on edit.
 */
export function buildRecordId(
  type: ContentType,
  record: Record<string, unknown>,
): string {
  if (type === "veranstaltung") {
    const datum = String(record.datum ?? "");
    const uhrzeit = String(record.uhrzeit ?? "").replace(":", "-");
    return `${datum}-${uhrzeit}-${slugify(String(record.titel ?? ""))}`;
  }
  const label = String(record.titel ?? record.name ?? "");
  return slugify(label);
}

export type ValidationResult =
  | { ok: true; record: Record<string, unknown> }
  | { ok: false; errors: Record<string, string> };

/**
 * Validate and normalise form input for a content type.
 *
 * Returns a cleaned record containing only known fields: strings are trimmed,
 * empty optional fields are dropped, lists are deduplicated. `derivedFields`
 * are ignored here - the caller sets them. `id` is passed through untouched
 * when present. Messages are German because they are shown to editors as-is.
 */
export function validateRecord(
  type: ContentType,
  input: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};
  const record: Record<string, unknown> = {};
  const derived = derivedFields[type];

  for (const field of contentFields[type]) {
    if (derived.includes(field.name)) continue;
    const raw = input[field.name];

    if (field.kind === "list") {
      const items = listItems(raw);
      if (items.length === 0) {
        if (field.required) errors[field.name] = `${field.label} muss mindestens einen Eintrag enthalten.`;
        continue;
      }
      record[field.name] = items;
      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : raw == null ? "" : String(raw).trim();

    if (!value) {
      if (field.required) errors[field.name] = `${field.label} ist ein Pflichtfeld.`;
      continue;
    }

    const problem = checkValue(field, value);
    if (problem) {
      errors[field.name] = problem;
      continue;
    }

    record[field.name] = field.kind === "textarea" ? value.replace(/\r\n/g, "\n") : value;
  }

  if (
    type === "veranstaltung" &&
    typeof record.enddatum === "string" &&
    typeof record.datum === "string" &&
    record.enddatum < record.datum
  ) {
    errors.enddatum = "Das Enddatum darf nicht vor dem Datum liegen.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, ok: false };
  }

  if (typeof input.id === "string" && input.id) {
    record.id = input.id;
  }

  return { ok: true, record };
}

function checkValue(field: FieldDef, value: string): string | undefined {
  switch (field.kind) {
    case "date":
      return isIsoDate(value) ? undefined : `${field.label} muss ein gültiges Datum (JJJJ-MM-TT) sein.`;
    case "time":
      return timePattern.test(value) ? undefined : `${field.label} muss im Format HH:MM sein.`;
    case "email":
      return emailPattern.test(value) ? undefined : `${field.label} ist keine gültige E-Mail-Adresse.`;
    case "url":
      return /^https?:\/\/\S+$/i.test(value)
        ? undefined
        : `${field.label} muss mit http:// oder https:// beginnen.`;
    case "image":
      return imagePathPattern.test(value) && !value.includes("..")
        ? undefined
        : `${field.label} muss ein Pfad zu einer Bilddatei sein, zum Beispiel /veranstaltungen/bild.jpg.`;
    case "select":
      return field.options?.includes(value)
        ? undefined
        : `${field.label} muss einer der vorgegebenen Werte sein.`;
    default:
      return value.length > 5000 ? `${field.label} ist zu lang.` : undefined;
  }
}

/** Accepts an array of strings or a newline/comma separated string. */
function listItems(raw: unknown): string[] {
  const parts = Array.isArray(raw)
    ? raw.map((item) => (typeof item === "string" ? item : String(item ?? "")))
    : typeof raw === "string"
      ? raw.split(/\r?\n|,/)
      : [];
  return [...new Set(parts.map((item) => item.trim()).filter(Boolean))];
}
