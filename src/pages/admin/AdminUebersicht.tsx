import { Link } from "react-router-dom";
import { CalendarPlus, ClipboardCheck, Pencil } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFreigabeListe, useMe, useVeranstaltungen, useVerein } from "@/lib/admin-api";
import { istKommend } from "@/lib/veranstaltung";

export default function AdminUebersicht() {
  return (
    <AdminShell title="Übersicht">
      <Inhalt />
    </AdminShell>
  );
}

function Inhalt() {
  const me = useMe();
  const verein = useVerein();
  const veranstaltungen = useVeranstaltungen();
  const freigabe = useFreigabeListe(Boolean(me.data?.istPlattformAdmin));
  const kommende = (veranstaltungen.data ?? []).filter((e) => istKommend(e));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Vereinsdaten</h2>
          {verein.isLoading && <p className="text-sm text-muted-foreground">Wird geladen …</p>}
          {verein.isError && <p className="text-sm text-destructive">{verein.error.message}</p>}
          {verein.data === null && (
            <p className="text-sm text-muted-foreground">
              Für diesen Verein sind noch keine Daten veröffentlicht.
            </p>
          )}
          {verein.data && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{verein.data.name}</p>
              <p>{verein.data.kurzbeschreibung}</p>
            </div>
          )}
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/verein">
              <Pencil className="h-4 w-4" /> {verein.data ? "Bearbeiten" : "Anlegen"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Veranstaltungen</h2>
          {veranstaltungen.isLoading && <p className="text-sm text-muted-foreground">Wird geladen …</p>}
          {veranstaltungen.isError && (
            <p className="text-sm text-destructive">{veranstaltungen.error.message}</p>
          )}
          {veranstaltungen.data && (
            <p className="text-sm text-muted-foreground">
              {kommende.length} kommende, {veranstaltungen.data.length - kommende.length} vergangene.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/admin/veranstaltungen/neu">
                <CalendarPlus className="h-4 w-4" /> Neue Veranstaltung
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/veranstaltungen">Alle anzeigen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {me.data?.istPlattformAdmin && (
        <Card className="md:col-span-2">
          <CardContent className="p-5 space-y-3">
            <h2 className="font-semibold text-foreground">Freigabe von E-Mail-Einreichungen</h2>
            <p className="text-sm text-muted-foreground">
              {freigabe.data
                ? `${freigabe.data.length} Einreichung${freigabe.data.length === 1 ? "" : "en"} warten auf Prüfung.`
                : "Wird geladen …"}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/freigabe">
                <ClipboardCheck className="h-4 w-4" /> Zur Freigabe
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
