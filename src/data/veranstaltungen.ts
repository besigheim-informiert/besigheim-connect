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
