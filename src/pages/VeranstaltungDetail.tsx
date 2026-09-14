import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Repeat, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { veranstaltungen } from "@/data/veranstaltungen";
import { vereine } from "@/data/vereine";
import { datumLabel, istKommend } from "@/lib/veranstaltung";

/** mailto:/https: link for a contact field that holds either an address or a URL. */
function kontaktHref(kontakt: string): string | undefined {
  if (/^https?:\/\//i.test(kontakt)) return kontakt;
  if (kontakt.includes("@") && !kontakt.includes(" ")) return `mailto:${kontakt}`;
  return undefined;
}

export default function VeranstaltungDetail() {
  const { id } = useParams<{ id: string }>();
  const veranstaltung = veranstaltungen.find((e) => e.id === id);

  if (!veranstaltung) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Veranstaltung nicht gefunden</h1>
          <Button asChild variant="outline">
            <Link to="/veranstaltungen">Zurück zum Kalender</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const verein = vereine.find((v) => v.id === veranstaltung.vereinId);
  const href = veranstaltung.kontakt ? kontaktHref(veranstaltung.kontakt) : undefined;
  const vergangen = !istKommend(veranstaltung);

  return (
    <Layout>
      <section className="container py-12 max-w-3xl">
        <Link
          to="/veranstaltungen"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zum Kalender
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge>{veranstaltung.kategorie}</Badge>
          {vergangen && <Badge variant="outline">Bereits stattgefunden</Badge>}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-6">{veranstaltung.titel}</h1>

        <Card className="mb-8">
          <CardContent className="p-5 space-y-3 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {datumLabel(veranstaltung)}
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {veranstaltung.uhrzeit} Uhr
            </div>
            {veranstaltung.wiederholung && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Repeat className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {veranstaltung.wiederholung}
              </div>
            )}
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {veranstaltung.ort}
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              {verein ? (
                <Link to={`/vereine/${veranstaltung.vereinId}`} className="text-primary hover:underline">
                  {veranstaltung.vereinName}
                </Link>
              ) : (
                veranstaltung.vereinName
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-foreground/85 leading-relaxed break-words whitespace-pre-line">
          {veranstaltung.beschreibung}
        </p>

        {veranstaltung.kontakt && (
          <div className="mt-8 border-t border-foreground/10 pt-6">
            <h2 className="font-semibold text-foreground mb-2">Kontakt</h2>
            <p className="text-sm text-muted-foreground break-words">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  {veranstaltung.kontakt}
                </a>
              ) : (
                veranstaltung.kontakt
              )}
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
