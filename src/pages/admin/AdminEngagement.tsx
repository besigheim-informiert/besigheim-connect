import { useState } from "react";
import { Link } from "react-router-dom";
import { HandHeart, Pencil, Trash2 } from "lucide-react";
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
import { useDeleteEngagementAngebot, useEngagementAngebote, useMe } from "@/lib/admin-api";
import type { EngagementAngebot } from "@/shared/content-schema";

export default function AdminEngagement() {
  return (
    <AdminShell title="Engagement">
      <Liste />
    </AdminShell>
  );
}

function Liste() {
  const me = useMe();
  const angebote = useEngagementAngebote();
  const loeschen = useDeleteEngagementAngebot();
  const [zuLoeschen, setZuLoeschen] = useState<EngagementAngebot | null>(null);
  const kannBearbeiten = Boolean(me.data?.kannBearbeiten);

  async function bestaetigen() {
    if (!zuLoeschen) return;
    try {
      await loeschen.mutateAsync(zuLoeschen.id);
      toast({
        description: "Das Angebot verschwindet in wenigen Minuten von der Website.",
        title: "Engagement-Angebot gelöscht",
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
      <p className="text-sm text-muted-foreground max-w-prose">
        Engagement-Angebote erscheinen auf der Seite{" "}
        <Link to="/mitmachen" className="text-primary underline-offset-4 hover:underline">
          Mitmachen
        </Link>{" "}
        und zeigen, wo Ihr Verein Unterstützung sucht.
      </p>

      {kannBearbeiten && (
        <div>
          <Button asChild>
            <Link to="/admin/engagement/neu">
              <HandHeart className="h-4 w-4" /> Neues Angebot
            </Link>
          </Button>
        </div>
      )}

      {angebote.isLoading && <p className="text-muted-foreground">Wird geladen …</p>}
      {angebote.isError && <p className="text-destructive">{angebote.error.message}</p>}
      {angebote.data?.length === 0 && (
        <p className="text-muted-foreground">Für diesen Verein sind noch keine Engagement-Angebote eingetragen.</p>
      )}

      <div className="space-y-3">
        {angebote.data?.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{a.titel}</h3>
                  <Badge variant="secondary">{a.art}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Kontakt: {a.kontakt}</p>
              </div>
              {kannBearbeiten && (
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/engagement/${a.id}`} aria-label={`${a.titel} bearbeiten`}>
                      <Pencil className="h-4 w-4" /> Bearbeiten
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`${a.titel} löschen`}
                    onClick={() => setZuLoeschen(a)}
                  >
                    <Trash2 className="h-4 w-4" /> Löschen
                  </Button>
                </div>
              )}
              {!kannBearbeiten && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/engagement/${a.id}`}>Ansehen</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={zuLoeschen !== null} onOpenChange={(open) => !open && setZuLoeschen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Engagement-Angebot löschen?</AlertDialogTitle>
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
