import { Link } from "react-router-dom";
import { Users, Calendar, Heart, Accessibility, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { vereine } from "@/data/vereine";
import { veranstaltungen } from "@/data/veranstaltungen";
import { einrichtungen } from "@/data/barrierefreiheit";
import heroBg from "@/assets/hero-besigheim.jpg";

const quickLinks = [
  { icon: Accessibility, label: "Barrierefreiheit", desc: "Zugänglichkeit von Einrichtungen in Besigheim.", path: "/barrierefrei" },
  { icon: Users, label: "Vereine", desc: "Alle Vereine der Stadt auf einen Blick.", path: "/vereine" },
  { icon: Calendar, label: "Veranstaltungen", desc: "Was in Besigheim in den nächsten Wochen passiert.", path: "/veranstaltungen" },
  { icon: Heart, label: "Mitmachen", desc: "Ehrenamt und Engagement-Möglichkeiten vor Ort.", path: "/mitmachen" },
];

export default function Index() {
  const featuredVereine = vereine.slice(0, 3);
  const upcomingEvents = veranstaltungen.slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative border-b border-foreground/10 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Panorama von Besigheim mit Fachwerkhäusern und Weinbergen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="container relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-2xl">
            <span className="eyebrow text-primary">Besigheim informiert</span>
            <h1 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1] tracking-tight mt-4">
              Alles Wichtige aus <span className="italic text-primary">Besigheim</span> auf einen Blick.
            </h1>
            <p className="mt-5 text-base md:text-lg text-foreground/80 max-w-xl leading-relaxed">
              Vereine, Veranstaltungen, Engagement und barrierefreie Einrichtungen — die zentrale
              Informationsplattform für alle Bürgerinnen und Bürger.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-none h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/barrierefrei">Barrierefreiheit entdecken</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-none h-11 px-6 border-foreground/30 bg-background/70 hover:bg-accent">
                <Link to="/vereine">Vereine durchsuchen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links — bordered grid */}
      <section className="border-b border-foreground/10">
        <div className="container py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-foreground/10">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-start gap-5 p-8 md:p-10 hover:bg-accent transition-colors"
              >
                <div className="flex-shrink-0 border border-foreground/20 p-3 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-serif-display text-xl group-hover:text-primary transition-colors">
                      {item.label}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility spotlight */}
      <section className="bg-accent/40 border-b border-foreground/10">
        <div className="container py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <span className="eyebrow text-primary">Barrierefreies Besigheim</span>
              <h2 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight mt-3">
                Besigheim soll für <span className="italic text-primary">alle</span> zugänglich sein.
              </h2>
              <p className="mt-4 text-base md:text-lg text-foreground/80 max-w-2xl leading-relaxed">
                Finde schnell, welche Einrichtungen in Besigheim barrierefrei zugänglich sind — mit
                klaren Angaben zu Zugang, WC, Parkplatz und Sehbehinderung.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-none h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/barrierefrei">Zur Barrierefreiheit-Übersicht</Link>
                </Button>
              </div>
            </div>
            <aside className="lg:col-span-4 lg:border-l lg:border-foreground/10 lg:pl-10">
              <div className="bg-background/70 backdrop-blur-sm border-t-2 border-foreground p-5 md:p-6">
                <span className="eyebrow">Übersicht Einrichtungen</span>
                <p className="font-serif-display text-2xl mt-2 leading-snug">
                  {einrichtungen.length} geprüfte Einrichtungen
                  <span className="text-primary italic"> — filterbar.</span>
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  Filtere nach Zugänglichkeit, WC, Parkplatz und weiteren Kriterien, um passende
                  Einrichtungen zu finden.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured Vereine + Events split */}
      <section className="container py-20">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Vereine — 2 cols */}
          <div className="lg:col-span-2">
            <div className="flex items-baseline justify-between border-b border-foreground pb-4 mb-10">
              <h2 className="font-serif-display text-3xl md:text-4xl">Vereine im Fokus</h2>
              <Link to="/vereine" className="eyebrow text-primary hover:underline underline-offset-4 flex items-center gap-1">
                Alle Vereine <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              {featuredVereine.map((v, i) => (
                <Link key={v.id} to={`/vereine/${v.id}`} className={`group ${i === 0 ? "md:col-span-2" : ""}`}>
                  <article className="h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="eyebrow text-primary">{v.kategorie}</span>
                      <span className="h-px flex-1 bg-foreground/15" />
                    </div>
                    <h3 className={`font-serif-display leading-tight group-hover:text-primary transition-colors ${
                      i === 0 ? "text-3xl md:text-4xl" : "text-2xl"
                    }`}>
                      {v.name}
                    </h3>
                    <p className="text-muted-foreground mt-3 leading-relaxed">{v.kurzbeschreibung}</p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      Zum Profil <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Events sidebar */}
          <aside className="lg:border-l lg:border-foreground/10 lg:pl-10">
            <div className="flex items-baseline justify-between border-b border-foreground pb-4 mb-8">
              <h2 className="font-serif-display text-2xl">Termine</h2>
              <Link to="/veranstaltungen" className="eyebrow text-primary hover:underline underline-offset-4">
                Kalender
              </Link>
            </div>
            <ul className="space-y-8">
              {upcomingEvents.map((e) => {
                const d = new Date(e.datum);
                return (
                  <li key={e.id} className="group flex gap-5">
                    <div className="flex-shrink-0 w-14 text-center border-t-2 border-highlight pt-2">
                      <div className="font-serif-display text-3xl leading-none text-highlight">{d.getDate()}</div>
                      <div className="eyebrow text-muted-foreground mt-1">
                        {d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "")}
                      </div>
                    </div>
                    <div className="flex-1 border-b border-foreground/10 pb-6">
                      <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {e.titel}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">
                        {e.uhrzeit} · {e.ort}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{e.beschreibung}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>

      {/* Engagement CTA band */}
      <section className="bg-background border-t border-foreground/10">
        <div className="container py-16 md:py-20 grid gap-8 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <span className="eyebrow text-primary">
              Ehrenamt & Quartier
            </span>
            <h2 className="font-serif-display text-3xl md:text-5xl leading-tight mt-4 text-foreground">
              Besigheim lebt vom <span className="italic text-primary">Mitmachen.</span>
            </h2>
            <p className="mt-4 text-foreground/75 max-w-xl leading-relaxed">
              Ob Fußballtraining für Kinder, Musikproben oder Nachbarschaftshilfe — hier findest du
              konkrete Möglichkeiten, dich einzubringen.
            </p>
          </div>
          <div className="md:justify-self-end">
            <Button asChild size="lg" className="rounded-none h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/netzwerk-quartier">Netzwerk Quartier</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
