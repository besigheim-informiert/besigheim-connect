import type { Veranstaltung } from "@/shared/content-schema";

type DateRange = Pick<Veranstaltung, "datum" | "enddatum">;

/** True if the event has a valid end date after its start date. */
export function istMehrtaegig(e: DateRange): boolean {
  // ISO YYYY-MM-DD strings compare lexicographically in date order.
  return Boolean(e.enddatum && e.enddatum > e.datum);
}

/**
 * Day-number label for the compact date box, e.g. "18" or "18–20".
 * The month/year is rendered separately by the caller; for multi-day events
 * that span two months this shows only the day numbers.
 */
export function tagLabel(e: DateRange): string {
  const start = new Date(e.datum).getDate();
  if (!istMehrtaegig(e)) return String(start);
  const end = new Date(e.enddatum as string).getDate();
  return `${start}–${end}`;
}
