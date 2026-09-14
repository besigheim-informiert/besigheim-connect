import { useMemo, useState } from "react";
import { de } from "date-fns/locale";
import type { Veranstaltung } from "@/shared/content-schema";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { alsDatum, isoTag, istKommend, terminTage } from "@/lib/veranstaltung";

interface Props {
  /** Events the calendar marks - already filtered by category, so the grid matches the list. */
  veranstaltungen: Veranstaltung[];
  /** Currently filtered day as an ISO string, or null for "all dates". */
  ausgewaehlterTag: string | null;
  onTagWaehlen: (tag: string | null) => void;
}

export default function VeranstaltungsKalender({
  veranstaltungen,
  ausgewaehlterTag,
  onTagWaehlen,
}: Props) {
  // Open on the month of the next upcoming event so the grid is not empty.
  const [monat, setMonat] = useState<Date>(() => {
    const naechste = veranstaltungen.find((e) => istKommend(e));
    return alsDatum(naechste?.datum ?? isoTag(new Date()));
  });

  const markierteTage = useMemo(() => terminTage(veranstaltungen), [veranstaltungen]);

  return (
    <div className="border border-foreground/10 p-4">
      <Calendar
        mode="single"
        locale={de}
        month={monat}
        onMonthChange={setMonat}
        selected={ausgewaehlterTag ? alsDatum(ausgewaehlterTag) : undefined}
        onSelect={(datum) => onTagWaehlen(datum ? isoTag(datum) : null)}
        modifiers={{ termin: markierteTage }}
        modifiersClassNames={{
          termin:
            "relative font-semibold after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-current",
        }}
        className="p-0"
      />

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Tag mit Veranstaltung
        </span>
        {ausgewaehlterTag && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onTagWaehlen(null)}>
            Tag zurücksetzen
          </Button>
        )}
      </div>
    </div>
  );
}
