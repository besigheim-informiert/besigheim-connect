import type { Veranstaltung } from "@/shared/content-schema";

export type { Veranstaltung };

const veranstaltungModules = import.meta.glob(
  "../content/veranstaltungen/*.json",
  {
    eager: true,
    import: "default",
  }
) as Record<string, Veranstaltung>;

export const veranstaltungen: Veranstaltung[] = Object.values(
  veranstaltungModules
).sort((a, b) => {
  const dateCompare = a.datum.localeCompare(b.datum);
  return dateCompare || a.uhrzeit.localeCompare(b.uhrzeit);
});

/**
 * Preferred order of the category filter. Categories not listed here are
 * appended alphabetically, so a new one in the content shows up without a
 * code change - it just sorts to the back.
 */
const kategorieOrder = [
  "Begegnung",
  "Kultur",
  "Fest",
  "Gesundheit",
  "Nachhaltigkeit",
  "Ehrenamt",
  "Sonstiges",
];

/**
 * Categories that actually occur in the published events - the filter chips on
 * the calendar page. Derived from the events themselves rather than from the
 * Verein categories, so every event stays reachable through the filter.
 */
export const kategorien = [
  ...kategorieOrder.filter((kategorie) =>
    veranstaltungen.some((e) => e.kategorie === kategorie)
  ),
  ...[...new Set(veranstaltungen.map((e) => e.kategorie))]
    .filter((kategorie) => !kategorieOrder.includes(kategorie))
    .sort((a, b) => a.localeCompare(b, "de")),
];

/** Verein id the Quartiersarbeit publishes its own events under. */
export const quartierVereinId = "quartier-besigheim";

/**
 * Netzwerktreffen of the Quartiersarbeit - the calendar on the
 * "Netzwerk Quartier" page. Matched by organiser plus title keyword, so a new
 * Netzwerktreffen shows up there simply by being published.
 */
export function istNetzwerktreffen(e: Veranstaltung): boolean {
  return e.vereinId === quartierVereinId && /netzwerktreffen/i.test(e.titel);
}

export const netzwerktreffen: Veranstaltung[] =
  veranstaltungen.filter(istNetzwerktreffen);
