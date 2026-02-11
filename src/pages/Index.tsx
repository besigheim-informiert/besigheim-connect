import { Link } from "react-router-dom";
import { Users, Calendar, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { vereine } from "@/data/vereine";
import { veranstaltungen } from "@/data/veranstaltungen";
import heroBg from "@/assets/hero-besigheim.jpg";

const quickLinks = [
  { icon: Users, label: "Vereine entdecken", desc: "Alle Vereine auf einen Blick", path: "/vereine" },
  { icon: Calendar, label: "Veranstaltungen", desc: "Was ist los in Besigheim?", path: "/veranstaltungen" },
  { icon: Heart, label: "Mitmachen", desc: "Engagement-Möglichkeiten finden", path: "/mitmachen" },
];

export default function Index() {
  const featuredVereine = vereine.slice(0, 3);
  const upcomingEvents = veranstaltungen.slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Panorama von Besigheim mit Fachwerkhäusern und Weinbergen" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container py-24 md:py-36 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
            Willkommen bei<br />Besigheim informiert
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Die zentrale Plattform für Vereine, Veranstaltungen und ehrenamtliches Engagement in unserer Stadt.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/vereine">Vereine entdecken</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
              <Link to="/mitmachen">Jetzt mitmachen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="h-full hover:shadow-lg transition-shadow border-border group cursor-pointer">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vereine */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Vereine in Besigheim</h2>
            <Link to="/vereine" className="text-sm text-primary hover:underline flex items-center gap-1">
              Alle anzeigen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredVereine.map((v) => (
              <Link key={v.id} to={`/vereine/${v.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md mb-3">
                      {v.kategorie}
                    </span>
                    <h3 className="font-semibold text-foreground mb-2">{v.name}</h3>
                    <p className="text-sm text-muted-foreground">{v.kurzbeschreibung}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Nächste Veranstaltungen</h2>
          <Link to="/veranstaltungen" className="text-sm text-primary hover:underline flex items-center gap-1">
            Alle anzeigen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingEvents.map((e) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0 text-center bg-primary/10 rounded-lg p-3 md:w-20">
                  <div className="text-2xl font-bold text-primary">{new Date(e.datum).getDate()}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.datum).toLocaleDateString("de-DE", { month: "short" })}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{e.titel}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{e.beschreibung}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {e.uhrzeit} Uhr · {e.ort} · {e.vereinName}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
