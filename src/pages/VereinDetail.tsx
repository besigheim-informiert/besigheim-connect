import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { vereine } from "@/data/vereine";
import { veranstaltungen } from "@/data/veranstaltungen";

export default function VereinDetail() {
  const { id } = useParams<{ id: string }>();
  const verein = vereine.find((v) => v.id === id);
  const vereinEvents = veranstaltungen.filter((e) => e.vereinId === id);

  if (!verein) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Verein nicht gefunden</h1>
          <Button asChild variant="outline"><Link to="/vereine">Zurück zur Übersicht</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-12 max-w-3xl">
        <Link to="/vereine" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </Link>

        <Badge className="mb-4">{verein.kategorie}</Badge>
        <h1 className="text-3xl font-bold text-foreground mb-2">{verein.name}</h1>
        <p className="text-muted-foreground mb-8">{verein.beschreibung}</p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Kontakt</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" /> {verein.ansprechpartner}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" /> {verein.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" /> {verein.telefon}
                </div>
                {verein.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4 text-primary" /> <a href={verein.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{verein.website}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> {verein.adresse}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Angebote</h3>
              <div className="flex flex-wrap gap-2">
                {verein.angebote.map((a) => (
                  <Badge key={a} variant="secondary">{a}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="font-medium">Zielgruppe:</span> {verein.zielgruppe}
              </p>
            </CardContent>
          </Card>
        </div>

        {vereinEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Kommende Veranstaltungen</h2>
            <div className="space-y-3">
              {vereinEvents.map((e) => (
                <Card key={e.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-center bg-primary/10 rounded-lg p-2 w-16 flex-shrink-0">
                      <div className="text-lg font-bold text-primary">{new Date(e.datum).getDate()}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.datum).toLocaleDateString("de-DE", { month: "short" })}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{e.titel}</h3>
                      <p className="text-xs text-muted-foreground">{e.uhrzeit} Uhr · {e.ort}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
