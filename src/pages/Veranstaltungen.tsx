import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { veranstaltungen } from "@/data/veranstaltungen";
import { kategorien } from "@/data/vereine";

export default function Veranstaltungen() {
  const [activeKat, setActiveKat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const sorted = [...veranstaltungen].sort((a, b) => a.datum.localeCompare(b.datum));
    if (!activeKat) return sorted;
    return sorted.filter((e) => e.kategorie === activeKat);
  }, [activeKat]);

  return (
    <Layout>
      <section className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Veranstaltungskalender</h1>
        <p className="text-muted-foreground mb-8">Alle kommenden Veranstaltungen in Besigheim auf einen Blick.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant={activeKat === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveKat(null)}>
            Alle
          </Badge>
          {kategorien.map((k) => (
            <Badge key={k} variant={activeKat === k ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveKat(k)}>
              {k}
            </Badge>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Keine Veranstaltungen gefunden.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((e) => (
              <Card key={e.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0 text-center bg-primary/10 rounded-lg p-3 md:w-20">
                    <div className="text-2xl font-bold text-primary">{new Date(e.datum).getDate()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.datum).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-semibold text-foreground text-lg">{e.titel}</h2>
                      <Badge variant="secondary">{e.kategorie}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{e.beschreibung}</p>
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3">
                      <span>{e.uhrzeit} Uhr</span>
                      <span>{e.ort}</span>
                      <Link to={`/vereine/${e.vereinId}`} className="text-primary hover:underline">{e.vereinName}</Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
