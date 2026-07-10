import { Link } from "react-router-dom";
import { Accessibility, Users, Calendar, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { vereine } from "@/data/vereine";
import { veranstaltungen } from "@/data/veranstaltungen";
import heroBg from "@/assets/hero-besigheim.jpg";

const quickLinks = [
  { icon: Accessibility, label: "Barrierefreiheit", desc: "Zugänglichkeit von Einrichtungen in der Stadt.", path: "/barrierefrei" },
  { icon: Users, label: "Vereine", desc: "Alle Vereine der Stadt auf einen Blick.", path: "/vereine" },
  { icon: Calendar, label: "Veranstaltungen", desc: "Was in den nächsten Wochen passiert.", path: "/veranstaltungen" },
  { icon: Heart, label: "Mitmachen", desc: "Ehrenamt und Engagement vor Ort.", path: "/mitmachen" },
];

export default function Index() {
  const featuredVereine = vereine.slice(0, 4);
  const upcomingEvents = veranstaltungen.slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Panorama von Besigheim mit Fachwerkhäusern und Weinbergen"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/30" />
        </div>
        <div className="container relative py-16 md:py-24 lg:py-28">
          <div className="max-w-2xl">
            <span className="eyebrow text-highlight">Unser Besigheim</span>
            <h1 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-secondary-foreground mt-4 leading-[1.1]">
              Unser <span className="italic">Besigheim</span>
            </h1>
            <p className="mt-6 text-secondary-foreground/85 text-lg md:text-xl leading-relaxed font-light max-w-xl">
              Die zentrale Informationsplattform für Vereine, Veranstaltungen,
              Engagement und barrierefreie Einrichtungen in Besigheim.
            </p>
          </div>
        </div>
      </section>

      {/* Themen im Überblick */}
      <section className="border-b border-foreground/10">
        <div className="container py-14 md:py-20">
          <div className="max-w-2xl mb-10 md:mb-14">
            <span className="eyebrow text-signal">Themen im Überblick</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Was Besigheim ausmacht — kompakt zusammengefasst.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group border border-foreground/10 bg-background p-6 hover:bg-accent/40 transition-colors"
              >
                <item.icon className="h-6 w-6 text-signal mb-6" strokeWidth={1.5} />
                <h3 className="font-serif-display text-xl text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground group-hover:text-signal transition-colors">
                  Ansehen <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Barrierefreiheit im Fokus */}
      <section className="border-b border-foreground/10 bg-accent/30">
        <div className="container py-14 md:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-signal">Im Fokus</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Barrierefreiheit in Besigheim
            </h2>
            <p className="mt-5 text-foreground/80 leading-relaxed">
              Wir zeigen transparent, welche Einrichtungen in Besigheim barrierefrei zugänglich sind —
              mit klaren Angaben zu Zugang, WC, Parkplatz und Orientierung für Menschen mit
              Sehbehinderung.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Filtern Sie nach Kategorien oder suchen Sie gezielt nach einer Einrichtung. Alle
              Informationen sind übersichtlich in einer Ampel-Systematik dargestellt.
            </p>
            <Button
              asChild
              className="rounded-none h-11 px-6 mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/barrierefrei">
                <Accessibility className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Zur Übersicht
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-foreground/10 bg-background p-5">
              <div className="h-3 w-3 rounded-full bg-signal mb-4" />
              <p className="font-serif-display text-xl">Zugang</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed uppercase tracking-wider">Ebenerdig · Rampe · Stufen</p>
            </div>
            <div className="border border-foreground/10 bg-background p-5">
              <div className="h-3 w-3 rounded-full bg-primary mb-4" />
              <p className="font-serif-display text-xl">WC</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed uppercase tracking-wider">Barrierefrei · Nicht vorhanden</p>
            </div>
            <div className="border border-foreground/10 bg-background p-5">
              <div className="h-3 w-3 rounded-full bg-highlight mb-4" />
              <p className="font-serif-display text-xl">Parken</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed uppercase tracking-wider">Behindertenparkplatz</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vereine + Termine */}
      <section className="border-b border-foreground/10">
        <div className="container py-14 md:py-20 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          {/* Vereine */}
          <div>
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="eyebrow text-signal">Aus dem Vereinsleben</span>
                <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">Vereine im Fokus</h2>
              </div>
              <Link
                to="/vereine"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-signal transition-colors"
              >
                Alle Vereine <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
              {featuredVereine.map((v) => (
                <li key={v.id}>
                  <Link
                    to={`/vereine/${v.id}`}
                    className="group flex items-start gap-5 py-5 md:py-6 hover:bg-accent/40 transition-colors -mx-2 px-2"
                  >
                    <div className="w-11 h-11 border border-foreground/15 shrink-0 flex items-center justify-center mt-1">
                      <Users className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="eyebrow text-signal">{v.kategorie}</span>
                      <h4 className="font-serif-display text-lg md:text-xl text-foreground leading-tight mt-1 group-hover:text-signal transition-colors">
                        {v.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {v.kurzbeschreibung}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-3 group-hover:text-signal transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/vereine"
              className="sm:hidden inline-flex items-center gap-1 mt-6 text-sm font-medium text-foreground hover:text-signal"
            >
              Alle Vereine <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Termine */}
          <aside>
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="eyebrow text-signal">Kalender</span>
                <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">Termine</h2>
              </div>
            </div>
            <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
              {upcomingEvents.map((e) => {
                const d = new Date(e.datum);
                return (
                  <li key={e.id} className="py-5 md:py-6 flex gap-5">
                    <div className="text-center min-w-[54px] border-r border-foreground/10 pr-5">
                      <span className="block text-xs uppercase tracking-widest text-signal font-bold">
                        {d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="block text-3xl font-serif-display text-foreground leading-none mt-1">
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif-display text-lg text-foreground leading-tight">
                        {e.titel}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                        {e.uhrzeit} · {e.ort}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/veranstaltungen"
              className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-foreground hover:text-signal transition-colors"
            >
              Alle Termine <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </div>
      </section>

      {/* Engagement */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container py-14 md:py-20 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <span className="eyebrow text-highlight">Mitmachen</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Besigheim lebt vom Mitmachen.
            </h2>
            <p className="mt-5 text-secondary-foreground/85 leading-relaxed">
              Ob Fußballtraining für Kinder, Musikproben oder Nachbarschaftshilfe — hier finden Sie
              konkrete Möglichkeiten, sich einzubringen und Menschen zu treffen, die etwas bewegen
              wollen.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/netzwerk-quartier"
              className="group border border-secondary-foreground/20 p-6 md:p-8 hover:bg-secondary-foreground/5 transition-colors"
            >
              <span className="eyebrow text-highlight">Vernetzt vor Ort</span>
              <p className="font-serif-display text-xl md:text-2xl mt-3 leading-snug">
                Netzwerk Quartier
              </p>
              <p className="text-sm text-secondary-foreground/70 mt-3 leading-relaxed">
                Menschen, Ideen und Projekte, die Besigheim gestalten.
              </p>
              <span className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-secondary-foreground group-hover:text-highlight transition-colors">
                Mehr erfahren <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              to="/mitmachen"
              className="group border border-secondary-foreground/20 p-6 md:p-8 hover:bg-secondary-foreground/5 transition-colors"
            >
              <span className="eyebrow text-highlight">Ehrenamt</span>
              <p className="font-serif-display text-xl md:text-2xl mt-3 leading-snug">
                Konkret Mitmachen
              </p>
              <p className="text-sm text-secondary-foreground/70 mt-3 leading-relaxed">
                Aktuelle Angebote von Vereinen und Initiativen.
              </p>
              <span className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-secondary-foreground group-hover:text-highlight transition-colors">
                Angebote ansehen <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
