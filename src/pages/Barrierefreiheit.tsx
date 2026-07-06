import { useMemo, useState } from "react";
import { Search, Accessibility, Eye, Toilet, ParkingSquare, Phone, MapPin, Check, Minus, X, HelpCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { einrichtungen, type Einrichtung, type Kategorie, type Status } from "@/data/barrierefreiheit";

const kategorien: Kategorie[] = [
  "Arztpraxis", "Zahnarzt", "Tierarzt", "Hebamme",
  "Apotheke", "Physiotherapie", "Logopädie", "Ergotherapie",
  "Polizei", "Post", "Recht & Notariat", "Verwaltung",
];

const statusFilterOptions: { value: Status | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "ja", label: "Barrierefrei" },
  { value: "teilweise", label: "Teilweise" },
  { value: "nein", label: "Nicht barrierefrei" },
];

const kriterien: {
  key: keyof Pick<Einrichtung, "zugang" | "sehbehinderung" | "wc" | "parkplatz">;
  label: string;
  short: string;
  icon: typeof Accessibility;
}[] = [
  { key: "zugang", label: "Zugang / für Rollstuhl geeignet", short: "Zugang", icon: Accessibility },
  { key: "sehbehinderung", label: "Hilfe für Sehbehinderung", short: "Sehen", icon: Eye },
  { key: "wc", label: "Behinderten-WC", short: "WC", icon: Toilet },
  { key: "parkplatz", label: "Behinderten-Parkplatz", short: "Parkplatz", icon: ParkingSquare },
];

function StatusDot({ status, label }: { status: Status; label: string }) {
  const map: Record<Status, { cls: string; text: string; Icon: typeof Check }> = {
    ja:         { cls: "bg-emerald-600 text-white",  text: "Barrierefrei",       Icon: Check },
    teilweise:  { cls: "bg-amber-400 text-foreground", text: "Teilweise",         Icon: Minus },
    nein:       { cls: "bg-primary text-primary-foreground", text: "Nicht barrierefrei", Icon: X },
    unbekannt:  { cls: "bg-muted text-muted-foreground border border-foreground/10", text: "Keine Info", Icon: HelpCircle },
    na:         { cls: "bg-transparent text-muted-foreground border border-dashed border-foreground/20", text: "–", Icon: Minus },
  };
  const s = map[status];
  const Icon = s.Icon;
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${s.cls}`}
      title={`${label}: ${s.text}`}
      aria-label={`${label}: ${s.text}`}
      role="img"
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
    </span>
  );
}

export default function Barrierefreiheit() {
  const [query, setQuery] = useState("");
  const [kat, setKat] = useState<Kategorie | "alle">("alle");
  const [zugangFilter, setZugangFilter] = useState<Status | "alle">("alle");

  const overallStatus = (e: Einrichtung): "ja" | "teilweise" | "nein" | "unbekannt" => {
    const vals = [e.zugang, e.sehbehinderung, e.wc, e.parkplatz].filter((v) => v !== "na");
    if (vals.some((v) => v === "nein")) return "nein";
    if (vals.some((v) => v === "teilweise")) return "teilweise";
    if (vals.length > 0 && vals.every((v) => v === "ja")) return "ja";
    return "unbekannt";
  };

  const nachSucheUndKat = useMemo(() => {
    const q = query.trim().toLowerCase();
    return einrichtungen.filter((e) => {
      if (kat !== "alle" && e.kategorie !== kat) return false;
      if (q && !`${e.name} ${e.facharzt ?? ""} ${e.strasse} ${e.kategorie}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, kat]);

  const gefiltert = useMemo(() => {
    if (zugangFilter === "alle") return nachSucheUndKat;
    return nachSucheUndKat.filter((e) => overallStatus(e) === zugangFilter);
  }, [nachSucheUndKat, zugangFilter]);

  const stats = useMemo(() => {
    const total = nachSucheUndKat.length;
    let ja = 0, teilweise = 0, nein = 0;
    for (const e of nachSucheUndKat) {
      const s = overallStatus(e);
      if (s === "ja") ja++;
      else if (s === "teilweise") teilweise++;
      else if (s === "nein") nein++;
    }
    return { total, ja, teilweise, nein };
  }, [nachSucheUndKat]);

  return (
    <Layout>
      {/* Header */}
      <section className="border-b border-foreground/10 bg-accent/40">
        <div className="container py-14 md:py-16">
          <span className="eyebrow text-primary">Barrierefreies Besigheim</span>
          <h1 className="font-serif-display text-4xl md:text-5xl font-bold leading-tight tracking-tight mt-3 max-w-3xl">
            Barrieresituation für Menschen mit <span className="italic text-primary">Einschränkungen</span>.
          </h1>
          <p className="mt-4 text-foreground/75 max-w-2xl leading-relaxed">
            Übersicht über Einrichtungen in Besigheim und ihre Zugänglichkeit. Die Angaben
            basieren auf einer Erhebung der <em>Alltagshilfe des Netzwerk Quartier Besigheim</em>.
          </p>

          {/* Ampel-Legende */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {[
              { s: "ja" as Status, label: "Barrierefrei" },
              { s: "teilweise" as Status, label: "Teilweise" },
              { s: "nein" as Status, label: "Nicht barrierefrei" },
              { s: "unbekannt" as Status, label: "Keine Info" },
            ].map((l) => (
              <div key={l.s} className="flex items-center gap-2.5 text-sm">
                <StatusDot status={l.s} label={l.label} />
                <span className="text-foreground/80">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Stats */}
      <section className="border-b border-foreground/10 bg-background sticky top-20 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="container py-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nach Name, Adresse oder Fachrichtung suchen…"
                className="pl-9 h-11 rounded-none border-foreground/20"
                aria-label="Einrichtung suchen"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map((o) => (
                <Button
                  key={o.value}
                  variant={zugangFilter === o.value ? "default" : "outline"}
                  className="rounded-none h-11"
                  onClick={() => setZugangFilter(o.value)}
                >
                  {o.value !== "alle" && (
                    <span className={`inline-block h-2.5 w-2.5 rounded-full mr-2 ${
                      o.value === "ja" ? "bg-emerald-600" :
                      o.value === "teilweise" ? "bg-amber-400" :
                      "bg-primary"
                    }`} aria-hidden="true" />
                  )}
                  {o.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={kat === "alle" ? "secondary" : "ghost"}
              className="rounded-none h-9 text-xs"
              onClick={() => setKat("alle")}
            >
              Alle Kategorien
            </Button>
            {kategorien.map((k) => (
              <Button
                key={k}
                variant={kat === k ? "secondary" : "ghost"}
                className="rounded-none h-9 text-xs"
                onClick={() => setKat(k)}
              >
                {k}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-foreground/10">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Einrichtungen erfasst" value={stats.total} />
          <StatCard label="Barrierefrei zugänglich" value={stats.ja} tone="good" />
          <StatCard label="Teilweise zugänglich" value={stats.teilweise} tone="warn" />
          <StatCard label="Nicht zugänglich" value={stats.nein} tone="bad" />
        </div>
      </section>

      {/* Liste */}
      <section className="container py-10">
        <div className="mb-4 text-sm text-muted-foreground">
          {gefiltert.length} Einrichtung{gefiltert.length === 1 ? "" : "en"} gefunden
        </div>

        {gefiltert.length === 0 ? (
          <div className="border border-dashed border-foreground/20 p-12 text-center text-muted-foreground">
            Keine Einrichtungen für die aktuellen Filter gefunden.
          </div>
        ) : (
          <ul className="divide-y divide-foreground/10 border-t border-b border-foreground/10">
            {gefiltert.map((e) => (
              <li key={e.id} className="py-5 grid gap-4 md:grid-cols-12 md:items-center">
                <div className="md:col-span-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="eyebrow text-primary">{e.kategorie}</span>
                    {e.facharzt && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-xs text-muted-foreground">{e.facharzt}</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-serif-display text-xl leading-tight">{e.name}</h3>
                </div>

                <div className="md:col-span-4 text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span>{e.strasse}</span>
                  </div>
                  {e.telefon && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                      <a href={`tel:${e.telefon.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">
                        {e.telefon}
                      </a>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 flex md:justify-end gap-4 md:gap-3">
                  {kriterien.map((k) => (
                    <div key={k.key} className="flex flex-col items-center gap-1.5">
                      <k.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" strokeWidth={1.75} />
                      <StatusDot status={e[k.key]} label={k.label} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.short}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-xs text-muted-foreground max-w-2xl">
          Quelle: Alltagshilfe des Netzwerk Quartier Besigheim. Angaben ohne Gewähr — Rückmeldungen
          zu fehlenden oder veralteten Daten sind willkommen.
        </p>
      </section>
    </Layout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" | "bad" }) {
  const bar =
    tone === "good" ? "bg-emerald-600" :
    tone === "warn" ? "bg-amber-400" :
    tone === "bad"  ? "bg-primary" :
    "bg-foreground";
  return (
    <div className="border-t-2 border-foreground/10 pt-3 relative">
      <div className={`absolute top-0 left-0 h-[2px] w-10 ${bar} -mt-[2px]`} aria-hidden="true" />
      <div className="font-serif-display text-3xl leading-none">{value}</div>
      <div className="eyebrow text-muted-foreground mt-2">{label}</div>
    </div>
  );
}
