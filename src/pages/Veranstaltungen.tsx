import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Repeat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import VeranstaltungsKalender from "@/components/VeranstaltungsKalender";
import { veranstaltungen } from "@/data/veranstaltungen";
import { kategorien } from "@/data/vereine";
import { datumLabel, laeuftAm, monatLang, tagLabel } from "@/lib/veranstaltung";

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
              <div className="space-y-4">
                {filtered.map((e) => (
                  <Card key={e.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-shrink-0 text-center bg-primary/10 rounded-lg p-3 md:w-20">
                        <div className="text-2xl font-bold text-primary">{tagLabel(e)}</div>
                        <div className="text-xs text-muted-foreground">{monatLang(e)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-semibold text-foreground text-lg">
                            <Link to={`/veranstaltungen/${e.id}`} className="hover:text-primary">
                              {e.titel}
                            </Link>
                          </h2>
                          <Badge variant="secondary">{e.kategorie}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground break-words line-clamp-3">
                          {e.beschreibung}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3">
                          <span>{e.uhrzeit} Uhr</span>
                          {e.wiederholung && (
                            <span className="inline-flex items-center gap-1">
                              <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
                              {e.wiederholung}
                            </span>
                          )}
                          <span>{e.ort}</span>
                          <Link
                            to={`/vereine/${e.vereinId}`}
                            className="text-primary hover:underline"
                          >
                            {e.vereinName}
                          </Link>
                        </div>
                      </div>
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
