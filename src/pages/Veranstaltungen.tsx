import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import VeranstaltungsKalender from "@/components/VeranstaltungsKalender";
import VeranstaltungsBild, { bildFormat } from "@/components/VeranstaltungsBild";
import { kategorien, veranstaltungen } from "@/data/veranstaltungen";
import { datumLabel, laeuftAm, monatLang, tagLabel } from "@/lib/veranstaltung";
import { cn } from "@/lib/utils";

export default function Veranstaltungen() {
  const [activeKat, setActiveKat] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const sortiert = useMemo(
    () => [...veranstaltungen].sort((a, b) => a.datum.localeCompare(b.datum)),
    []
  );

  // The calendar marks whatever the category filter left over, so grid and list agree.
  const nachKategorie = useMemo(
    () => (activeKat ? sortiert.filter((e) => e.kategorie === activeKat) : sortiert),
    [sortiert, activeKat]
  );

  const filtered = useMemo(
    () => (activeTag ? nachKategorie.filter((e) => laeuftAm(e, activeTag)) : nachKategorie),
    [nachKategorie, activeTag]
  );

  return (
    <Layout>
      <section className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Veranstaltungskalender</h1>
        <p className="text-muted-foreground mb-8">
          Alle kommenden Veranstaltungen in Besigheim auf einen Blick. Über den Kalender lässt
          sich ein einzelner Tag auswählen.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={activeKat === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveKat(null)}
          >
            Alle
          </Badge>
          {kategorien.map((k) => (
            <Badge
              key={k}
              variant={activeKat === k ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveKat(k)}
            >
              {k}
            </Badge>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <VeranstaltungsKalender
              veranstaltungen={nachKategorie}
              ausgewaehlterTag={activeTag}
              onTagWaehlen={setActiveTag}
            />
          </div>

          <div>
            {activeTag && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-foreground/10">
                <h2 className="font-semibold text-foreground">
                  Termine am {datumLabel({ datum: activeTag })}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTag(null)}>
                  Alle Termine zeigen
                </Button>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                Keine Veranstaltungen gefunden.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((e) => (
                  <Card
                    key={e.id}
                    className="group relative flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {e.bild ? (
                      <VeranstaltungsBild veranstaltung={e} />
                    ) : (
                      // Events without a picture keep a tile of the same shape, so
                      // the cards in a row stay aligned.
                      <div
                        className={cn(
                          bildFormat,
                          "flex flex-col items-center justify-center bg-primary/10"
                        )}
                        aria-hidden="true"
                      >
                        <span className="text-4xl font-bold text-primary leading-none">
                          {tagLabel(e)}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">{monatLang(e)}</span>
                      </div>
                    )}

                    <CardContent className="flex flex-1 flex-col p-5">
                      <Badge variant="secondary" className="self-start mb-2">
                        {e.kategorie}
                      </Badge>
                      <h2 className="font-semibold text-foreground text-lg leading-tight">
                        {/* Stretched link: the whole card is clickable, while the
                            accessible name stays the event title. */}
                        <Link
                          to={`/veranstaltungen/${e.id}`}
                          className="hover:text-primary after:absolute after:inset-0"
                        >
                          {e.titel}
                        </Link>
                      </h2>
                      <p className="text-xs text-muted-foreground break-words line-clamp-2 mt-2">
                        {e.beschreibung}
                      </p>
                      <div className="text-xs text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1">
                        <span>
                          {datumLabel(e)}, {e.uhrzeit} Uhr
                        </span>
                        {e.wiederholung && (
                          <span className="inline-flex items-center gap-1">
                            <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
                            {e.wiederholung}
                          </span>
                        )}
                        <span>{e.ort}</span>
                      </div>
                      <Link
                        to={`/vereine/${e.vereinId}`}
                        className="relative z-10 self-start text-xs text-primary hover:underline mt-2"
                      >
                        {e.vereinName}
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
