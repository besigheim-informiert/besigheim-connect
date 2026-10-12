import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFreigabeListe, useMe } from "@/lib/admin-api";

const typLabels: Record<string, string> = {
  barrierefreiheit: "Barrierefreiheit",
  engagement: "Engagement",
  unknown: "Unklar",
  veranstaltung: "Veranstaltung",
  verein: "Verein",
};

export default function AdminFreigabe() {
  return (
    <AdminShell title="Freigabe">
      <Liste />
    </AdminShell>
  );
}

function Liste() {
  const me = useMe();
  const liste = useFreigabeListe(Boolean(me.data?.istPlattformAdmin));

  if (me.data && !me.data.istPlattformAdmin) {
    return <p className="text-muted-foreground">Die Freigabe ist der Plattform-Administration vorbehalten.</p>;
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground max-w-prose">
        Per E-Mail eingegangene Inhalte werden automatisch ausgelesen, aber erst nach Ihrer Prüfung
        veröffentlicht. Bitte kontrollieren Sie jede Angabe, bevor Sie freigeben.
      </p>
      {liste.isLoading && <p className="text-muted-foreground">Wird geladen …</p>}
      {liste.isError && <p className="text-destructive">{liste.error.message}</p>}
      {liste.data?.length === 0 && <p className="text-muted-foreground">Keine offenen Einreichungen.</p>}
      <div className="space-y-3">
        {liste.data?.map((eintrag) => (
          <Card key={eintrag.id}>
            <Link to={`/admin/freigabe/${eintrag.id}`} className="block">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary">{typLabels[eintrag.type] ?? eintrag.type}</Badge>
                    <h3 className="font-medium text-foreground">{eintrag.titel || eintrag.betreff || "Ohne Titel"}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {eintrag.absender ?? "Unbekannter Absender"} ·{" "}
                    {new Date(eintrag.createdAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  {eintrag.fehlendeFelder.length > 0 && (
                    <p className="text-xs text-muted-foreground">Fehlend: {eintrag.fehlendeFelder.join(", ")}</p>
                  )}
                </div>
                <span className="text-sm text-primary">Prüfen</span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
