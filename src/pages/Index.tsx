import { Link } from "react-router-dom";
import { Accessibility, Users, Calendar, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { vereine } from "@/data/vereine";
import { veranstaltungen } from "@/data/veranstaltungen";
import heroBg from "@/assets/hero-besigheim.jpg";

const quickLinks = [
  { icon: Accessibility, label: "Barrierefreiheit", desc: "Zugänglichkeit von Einrichtungen.", path: "/barrierefrei" },
  { icon: Users, label: "Vereine", desc: "Alle Vereine der Stadt auf einen Blick.", path: "/vereine" },
  { icon: Calendar, label: "Veranstaltungen", desc: "Was in den nächsten Wochen passiert.", path: "/veranstaltungen" },
  { icon: Heart, label: "Mitmachen", desc: "Ehrenamt und Engagement vor Ort.", path: "/mitmachen" },
];

export default function Index() {
  const featuredVereine = vereine.slice(0, 4);
  const upcomingEvents = veranstaltungen.slice(0, 3);

  return (
    <Layout>
      <div className="container py-8 md:py-12 space-y-10 md:space-y-12">
        {/* Hero */}
        <section className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl bg-secondary">
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt="Panorama von Besigheim mit Fachwerkhäusern und Weinbergen"
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent flex items-center">
            <div className="container relative z-10 px-6 md:px-12">
              <div className="max-w-2xl">
                <h1 className="font-serif-display text-4xl md:text-5xl text-white mb-4 md:mb-6 leading-tight">
                  Besigheim informiert
                </h1>
                <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed font-light">
                  Die zentrale Informationsplattform für Vereine, Veranstaltungen,
                  Engagement und barrierefreie Einrichtungen in Besigheim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {quickLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group bg-card p-6 md:p-8 rounded-xl shadow-sm border-b-4 border-primary transition-transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-secondary" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif-display font-bold text-lg text-foreground">{item.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Accessibility Spotlight */}
        <section className="bg-secondary text-secondary-foreground p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="bg-white/10 p-4 rounded-full shrink-0">
            <Accessibility className="h-8 w-8 md:h-10 md:w-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-serif-display text-2xl mb-2">Barrierefreiheit im Fokus</h2>
            <p className="text-secondary-foreground/80 font-light leading-relaxed">
              Finde schnell, welche Einrichtungen in Besigheim barrierefrei zugänglich sind — mit
              klaren Angaben zu Zugang, WC, Parkplatz und Sehbehinderung.
            </p>
          </div>
          <Button
            asChild
            className="rounded-lg h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Link to="/barrierefrei">Mehr erfahren</Link>
          </Button>
        </section>

        {/* Clubs and Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
          {/* Featured Clubs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-baseline justify-between border-b-2 border-foreground pb-3 relative">
              <span aria-hidden className="absolute -top-[2px] left-0 w-16 h-[3px] bg-signal" />
              <h2 className="font-serif-display text-2xl md:text-3xl text-foreground">Vereine im Fokus</h2>
              <Link
                to="/vereine"
                className="eyebrow text-signal hover:underline underline-offset-4 flex items-center gap-1"
              >
                Alle Vereine <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredVereine.map((v) => (
                <Link
                  key={v.id}
                  to={`/vereine/${v.id}`}
                  className="group flex items-start gap-4 bg-card p-4 rounded-lg shadow-sm border border-border hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-muted rounded-full shrink-0 flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="eyebrow text-primary">{v.kategorie}</span>
                    <h4 className="font-semibold text-foreground leading-tight mt-1 group-hover:text-primary transition-colors truncate">
                      {v.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{v.kurzbeschreibung}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Events */}
          <aside className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
            <div className="flex items-baseline justify-between border-b-2 border-primary pb-3 mb-6 md:mb-8">
              <h2 className="font-serif-display text-2xl text-foreground">Termine</h2>
              <Link to="/veranstaltungen" className="eyebrow text-primary hover:underline underline-offset-4">
                Kalender
              </Link>
            </div>
            <ul className="space-y-6 md:space-y-8">
              {upcomingEvents.map((e) => {
                const d = new Date(e.datum);
                return (
                  <li key={e.id} className="group flex gap-4">
                    <div className="text-center min-w-[50px]">
                      <span className="block text-xs uppercase tracking-wider text-primary font-bold">
                        {d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="block text-2xl font-serif-display text-foreground">{d.getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {e.titel}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                        {e.uhrzeit} · {e.ort}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Button
              asChild
              variant="outline"
              className="w-full mt-8 h-11 border-2 border-secondary text-secondary font-semibold rounded-lg hover:bg-secondary hover:text-secondary-foreground"
            >
              <Link to="/veranstaltungen">Alle Termine</Link>
            </Button>
          </aside>
        </div>

        {/* Engagement CTA */}
        <section className="bg-secondary rounded-2xl p-8 md:p-12 text-center text-secondary-foreground relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-serif-display text-2xl md:text-3xl mb-4">Besigheim lebt vom Mitmachen.</h2>
            <p className="text-secondary-foreground/80 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              Ob Fußballtraining für Kinder, Musikproben oder Nachbarschaftshilfe — hier findest du
              konkrete Möglichkeiten, dich einzubringen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-lg h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/netzwerk-quartier">Netzwerk Quartier</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-lg h-12 px-8 border-2 border-secondary-foreground/30 bg-transparent text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary"
              >
                <Link to="/mitmachen">Mitmachen</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
