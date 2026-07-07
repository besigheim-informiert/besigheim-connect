import { Link } from "react-router-dom";
import { Network, Mail, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function NetzwerkQuartier() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <span className="eyebrow text-primary">Vernetzt vor Ort</span>
          <h1 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-3">
            Netzwerk <span className="italic text-primary">Quartier</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-foreground/80 leading-relaxed">
            Das Netzwerk Quartier verbindet Menschen, Initiativen und Vereine in den
            Besigheimer Stadtteilen. Ziel ist ein lebendiges, nachbarschaftliches Miteinander,
            bei dem sich alle Bürgerinnen und Bürger einbringen können.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          <div className="border border-foreground/10 p-6 md:p-8 bg-accent/30">
            <div className="border border-foreground/20 p-3 inline-flex mb-4">
              <Users className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif-display text-xl mb-2">Nachbarschaftshilfe</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unterstützung im Alltag – von Einkaufshilfen bis zu gemeinsamen Aktionen für
              Menschen, die Hilfe brauchen.
            </p>
          </div>
          <div className="border border-foreground/10 p-6 md:p-8 bg-accent/30">
            <div className="border border-foreground/20 p-3 inline-flex mb-4">
              <MapPin className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif-display text-xl mb-2">Quartierstreffpunkte</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Informationen zu Orten im Stadtteil, an denen sich Nachbarinnen und Nachbarn
              begegnen und austauschen können.
            </p>
          </div>
          <div className="border border-foreground/10 p-6 md:p-8 bg-accent/30">
            <div className="border border-foreground/20 p-3 inline-flex mb-4">
              <Network className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif-display text-xl mb-2">Vernetzung</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zusammenarbeit mit Vereinen, Institutionen und der Stadtverwaltung für ein
              starkes Gemeinwesen.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-foreground/10 pt-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-serif-display text-2xl md:text-3xl leading-tight">
                Sie engagieren sich in einem Quartier?
              </h2>
              <p className="mt-4 text-foreground/80 leading-relaxed">
                Wir ergänzen gerne Informationen zu Ihrer Initiative, Ihrem Treffpunkt oder
                Ihrem Angebot. Schreiben Sie uns – gemeinsam machen wir das Netzwerk sichtbar.
              </p>
              <Button asChild className="rounded-none h-11 px-6 mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/kontakt">
                  <Mail className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Kontakt aufnehmen
                </Link>
              </Button>
            </div>
            <div className="bg-secondary text-secondary-foreground p-6 md:p-8">
              <span className="eyebrow text-highlight">Weitere Möglichkeiten</span>
              <p className="font-serif-display text-xl mt-2 leading-snug">
                Engagement in Besigheim
              </p>
              <p className="text-sm text-secondary-foreground/75 mt-3 leading-relaxed">
                Entdecken Sie konkrete Ehrenamt-Angebote und Unterstützungsmöglichkeiten.
              </p>
              <Link
                to="/mitmachen"
                className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-secondary-foreground hover:text-highlight transition-colors"
              >
                Angebote ansehen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
