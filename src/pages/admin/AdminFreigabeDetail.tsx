import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import ContentForm, { toFormValues, type FormValues } from "@/components/admin/ContentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { vereine } from "@/data/vereine";
import { ApiError, useFreigabeAktion, useFreigabeEintrag } from "@/lib/admin-api";
import {
  contentFields,
  contentTypes,
  derivedFields,
  isContentType,
  validateRecord,
  type ContentType,
} from "@/shared/content-schema";

const typLabels: Record<ContentType, string> = {
  barrierefreiheit: "Barrierefreiheit",
  engagement: "Engagement",
  veranstaltung: "Veranstaltung",
  verein: "Verein",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminFreigabeDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title="Einreichung prüfen">
      {id ? <Detail id={id} /> : null}
    </AdminShell>
  );
}

function Detail({ id }: { id: string }) {
  const navigate = useNavigate();
  const eintrag = useFreigabeEintrag(id);
  const aktion = useFreigabeAktion(id);
  const [type, setType] = useState<ContentType>("veranstaltung");
  const [values, setValues] = useState<FormValues>({});
  const [vereinId, setVereinId] = useState("");
  const [grund, setGrund] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!eintrag.data) return;
    const typ = isContentType(eintrag.data.type) ? eintrag.data.type : "veranstaltung";
    setType(typ);
    setValues(toFormValues(eintrag.data.document, contentFields[typ]));
    setVereinId(typeof eintrag.data.document.vereinId === "string" ? eintrag.data.document.vereinId : "");
  }, [eintrag.data]);

  const fields = contentFields[type];
  const brauchtVerein = type === "veranstaltung" || type === "engagement";

  function document(): Record<string, unknown> {
    return brauchtVerein ? { ...values, vereinId } : { ...values };
  }

  function wechsleTyp(neu: string) {
    if (!isContentType(neu)) return;
    setType(neu);
    setValues((current) => toFormValues(current, contentFields[neu]));
    setErrors({});
  }

  async function freigeben(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRecord(type, values);
    const fehler = validation.ok === false ? { ...validation.errors } : {};
    if (brauchtVerein && !vereinId) fehler.vereinId = "Bitte einen Verein auswählen.";
    if (Object.keys(fehler).length > 0) {
      setErrors(fehler);
      return;
    }
    setErrors({});
    await ausfuehren("freigeben", "Freigegeben", "Der Eintrag ist in wenigen Minuten auf der Website sichtbar.");
  }

  async function ausfuehren(
    name: "speichern" | "freigeben" | "ablehnen",
    titel: string,
    beschreibung: string,
  ) {
    try {
      await aktion.mutateAsync({ aktion: name, document: document(), grund, type });
      toast({ description: beschreibung, title: titel });
      if (name !== "speichern") navigate("/admin/freigabe");
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Aktion fehlgeschlagen",
        variant: "destructive",
      });
    }
  }

  if (eintrag.isLoading) return <p className="text-muted-foreground">Wird geladen …</p>;
  if (eintrag.isError) return <p className="text-destructive">{eintrag.error.message}</p>;
  if (!eintrag.data) return null;

  const erledigt = eintrag.data.status !== "needs_review";

  return (
    <form onSubmit={freigeben} noValidate className="grid gap-6 max-w-2xl">
      <Link to="/admin/freigabe" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
      </Link>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Absender:</span> {eintrag.data.absender ?? "unbekannt"}
          </p>
          <p>
            <span className="font-medium text-foreground">Betreff:</span> {eintrag.data.betreff ?? "–"}
          </p>
          {eintrag.data.hinweise && (
            <p>
              <span className="font-medium text-foreground">Hinweise der Auswertung:</span> {eintrag.data.hinweise}
            </p>
          )}
          {erledigt && <p className="text-foreground">Diese Einreichung wurde bereits bearbeitet ({eintrag.data.status}).</p>}
        </CardContent>
      </Card>

      <div className="grid gap-1.5">
        <Label htmlFor="feld-typ">Inhaltstyp</Label>
        <select id="feld-typ" className={selectClass} value={type} disabled={erledigt} onChange={(e) => wechsleTyp(e.target.value)}>
          {contentTypes.map((t) => (
            <option key={t} value={t}>
              {typLabels[t]}
            </option>
          ))}
        </select>
      </div>

      {brauchtVerein && (
        <div className="grid gap-1.5">
          <Label htmlFor="feld-vereinId">
            Verein <span className="text-destructive">*</span>
          </Label>
          <select
            id="feld-vereinId"
            className={selectClass}
            value={vereinId}
            disabled={erledigt}
            aria-invalid={errors.vereinId ? true : undefined}
            onChange={(e) => setVereinId(e.target.value)}
          >
            <option value="">Bitte wählen</option>
            {vereine.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {errors.vereinId && <p className="text-sm text-destructive">{errors.vereinId}</p>}
        </div>
      )}

      <ContentForm
        fields={fields}
        hidden={derivedFields[type]}
        values={values}
        errors={errors}
        disabled={erledigt || aktion.isPending}
        onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      />

      {!erledigt && (
        <>
          <div className="grid gap-1.5">
            <Label htmlFor="feld-grund">Grund bei Ablehnung (optional)</Label>
            <Textarea id="feld-grund" rows={2} value={grund} onChange={(e) => setGrund(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={aktion.isPending}>
              Freigeben und veröffentlichen
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={aktion.isPending}
              onClick={() => ausfuehren("speichern", "Zwischenstand gespeichert", "Die Einreichung bleibt in der Warteschlange.")}
            >
              Zwischenspeichern
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={aktion.isPending}
              onClick={() => ausfuehren("ablehnen", "Abgelehnt", "Die Einreichung wird nicht veröffentlicht.")}
            >
              Ablehnen
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
