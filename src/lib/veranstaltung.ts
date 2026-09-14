import type { Veranstaltung } from "@/shared/content-schema";

type DateRange = Pick<Veranstaltung, "datum" | "enddatum">;

/**
 * Parse an ISO day into a *local* Date. `new Date("2026-10-22")` is UTC
 * midnight, which renders as the previous day west of Greenwich.
 */
export function alsDatum(iso: string): Date {
  const [jahr, monat, tag] = iso.split("-").map(Number);
  return new Date(jahr, monat - 1, tag);
}

/** A Date as an ISO day string, using the local calendar rather than UTC. */
export function isoTag(datum: Date): string {
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");
  return `${datum.getFullYear()}-${monat}-${tag}`;
}

/** True if the event has a valid end date after its start date. */
export function istMehrtaegig(e: DateRange): boolean {
  // ISO YYYY-MM-DD strings compare lexicographically in date order.
  return Boolean(e.enddatum && e.enddatum > e.datum);
}

/** Last day the event runs - its end date, or the start day for single-day events. */
export function letzterTag(e: DateRange): string {
  return istMehrtaegig(e) ? (e.enddatum as string) : e.datum;
}

/**
 * True while the event has not finished yet. Multi-day events stay upcoming
 * until their last day is over.
 */
export function istKommend(e: DateRange, heute: Date = new Date()): boolean {
  return letzterTag(e) >= isoTag(heute);
}

/** True if the event runs on the given ISO day - multi-day events cover the whole range. */
export function laeuftAm(e: DateRange, tag: string): boolean {
  return e.datum <= tag && tag <= letzterTag(e);
}

/** Every calendar day covered by the given events, for marking them in a month grid. */
export function terminTage(events: DateRange[]): Date[] {
  const tage: Date[] = [];

  for (const e of events) {
    const ende = alsDatum(letzterTag(e));
    for (const tag = alsDatum(e.datum); tag <= ende; tag.setDate(tag.getDate() + 1)) {
      tage.push(new Date(tag));
    }
  }

  return tage;
}

/**
 * Day-number label for the compact date box, e.g. "18" or "18–20".
 * The month/year is rendered separately by the caller; for multi-day events
 * that span two months this shows only the day numbers.
 */
export function tagLabel(e: DateRange): string {
  const start = alsDatum(e.datum).getDate();
  if (!istMehrtaegig(e)) return String(start);
  const end = alsDatum(e.enddatum as string).getDate();
  return `${start}–${end}`;
}

/** Short month of the start day for the compact date box, e.g. "Okt.". */
export function monatKurz(e: DateRange): string {
  return alsDatum(e.datum).toLocaleDateString("de-DE", { month: "short" });
}

/** Month and year of the start day, e.g. "Oktober 2026". */
export function monatLang(e: DateRange): string {
  return alsDatum(e.datum).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Full date label for detail views, e.g. "Donnerstag, 22. Oktober 2026" or
 * "Freitag, 18. September 2026 bis Sonntag, 20. September 2026".
 */
export function datumLabel(e: DateRange): string {
  const format: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const start = alsDatum(e.datum).toLocaleDateString("de-DE", format);
  if (!istMehrtaegig(e)) return start;
  const end = alsDatum(e.enddatum as string).toLocaleDateString("de-DE", format);
  return `${start} bis ${end}`;
}
