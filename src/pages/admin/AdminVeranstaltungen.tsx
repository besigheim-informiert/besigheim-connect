import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useDeleteVeranstaltung, useMe, useVeranstaltungen } from "@/lib/admin-api";
import { datumLabel, istKommend } from "@/lib/veranstaltung";
import type { Veranstaltung } from "@/shared/content-schema";

export default function AdminVeranstaltungen() {
  return (
    <AdminShell title="Veranstaltungen">
      <Liste />
    </AdminShell>
  );
}

function Liste() {
  const me = useMe();
  const veranstaltungen = useVeranstaltungen();
  const loeschen = useDeleteVeranstaltung();
  const [zuLoeschen, setZuLoeschen] = useState<Veranstaltung | null>(null);
  const kannBearbeiten = Boolean(me.data?.kannBearbeiten);

  async function bestaetigen() {
    if (!zuLoeschen) return;
    try {
      await loeschen.mutateAsync(zuLoeschen.id);
      toast({
        description: "Die Veranstaltung verschwindet in wenigen Minuten von der Website.",
        title: "Veranstaltung gelöscht",
      });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Löschen fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setZuLoeschen(null);
    }
  }

  return (
    <div className="grid gap-6">
      {kannBearbeiten && (
        <div>
          <Button asChild>
            <Link to="/admin/veranstaltungen/neu">
              <CalendarPlus className="h-4 w-4" /> Neue Veranstaltung
            </Link>
          </Button>
        </div>
      )}

      {veranstaltungen.isLoading && <p className="text-muted-foreground">Wird geladen …</p>}
      {veranstaltungen.isError && <p className="text-destructive">{veranstaltungen.error.message}</p>}
      {veranstaltungen.data?.length === 0 && (
        <p className="text-muted-foreground">Für diesen Verein sind noch keine Veranstaltungen eingetragen.</p>
      )}

      <div className="space-y-3">
        {veranstaltungen.data?.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{e.titel}</h3>
                  {!istKommend(e) && <Badge variant="outline">Vergangen</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {datumLabel(e)} · {e.uhrzeit} Uhr · {e.ort}
                </p>
                {e.wiederholung && <p className="text-xs text-muted-foreground">{e.wiederholung}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/veranstaltungen/${e.id}`} target="_blank" rel="noopener noreferrer">
                    Ansehen
                  </Link>
                </Button>
                {kannBearbeiten && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/veranstaltungen/${e.id}`} aria-label={`${e.titel} bearbeiten`}>
                        <Pencil className="h-4 w-4" /> Bearbeiten
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`${e.titel} löschen`}
                      onClick={() => setZuLoeschen(e)}
                    >
                      <Trash2 className="h-4 w-4" /> Löschen
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={zuLoeschen !== null} onOpenChange={(open) => !open && setZuLoeschen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Veranstaltung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{zuLoeschen?.titel}“ wird dauerhaft von der Website entfernt. Das lässt sich nicht
              rückgängig machen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={bestaetigen} disabled={loeschen.isPending}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
