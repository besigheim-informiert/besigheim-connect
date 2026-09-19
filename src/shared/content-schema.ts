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
