import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { vereine, kategorien } from "@/data/vereine";

export default function Vereine() {
  const [search, setSearch] = useState("");
  const [activeKategorie, setActiveKategorie] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return vereine.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.kurzbeschreibung.toLowerCase().includes(search.toLowerCase());
      const matchesKat = !activeKategorie || v.kategorie === activeKategorie;
      return matchesSearch && matchesKat;
    });
  }, [search, activeKategorie]);

  return (
    <Layout>
      <section className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Vereinsübersicht</h1>
        <p className="text-muted-foreground mb-8">Entdecken Sie die vielfältige Vereinslandschaft in Besigheim.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Verein suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Verein suchen"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeKategorie === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveKategorie(null)}
            >
              Alle
            </Badge>
            {kategorien.map((k) => (
              <Badge
                key={k}
                variant={activeKategorie === k ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveKategorie(k)}
              >
                {k}
              </Badge>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">Keine Vereine gefunden.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <Link key={v.id} to={`/vereine/${v.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">{v.kategorie}</Badge>
                    <h2 className="font-semibold text-lg text-foreground mb-2">{v.name}</h2>
                    <p className="text-sm text-muted-foreground">{v.kurzbeschreibung}</p>
                    <p className="text-xs text-primary mt-3 font-medium">Mehr erfahren →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
