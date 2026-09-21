import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import ContentForm, { toFormValues, type FormValues } from "@/components/admin/ContentForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { veranstaltungen as veroeffentlichte } from "@/data/veranstaltungen";
import { ApiError, useMe, useSaveVeranstaltung, useVeranstaltung } from "@/lib/admin-api";
import { contentFields, derivedFields, validateRecord } from "@/shared/content-schema";

const fields = contentFields.veranstaltung;
const hidden = derivedFields.veranstaltung;

export default function AdminVeranstaltungFormular() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={id ? "Veranstaltung bearbeiten" : "Neue Veranstaltung"}>
      <Formular id={id} />
    </AdminShell>
  );
}

function Formular({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const me = useMe();
  const bestehende = useVeranstaltung(id);
  const speichern = useSaveVeranstaltung(id);
  const [values, setValues] = useState<FormValues>(() => toFormValues(undefined, fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const kategorien = useMemo(
    () => [...new Set(veroeffentlichte.map((e) => e.kategorie))].sort((a, b) => a.localeCompare(b, "de")),
    [],
  );

  useEffect(() => {
    if (bestehende.data) setValues(toFormValues(bestehende.data, fields));
  }, [bestehende.data]);

  const readOnly = me.data ? !me.data.kannBearbeiten : true;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRecord("veranstaltung", values);
    if (validation.ok === false) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    try {
      await speichern.mutateAsync(values);
      toast({
        description: "Die Änderung ist in wenigen Minuten auf der Website sichtbar.",
        title: id ? "Veranstaltung gespeichert" : "Veranstaltung angelegt",
      });
      navigate("/admin/veranstaltungen");
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Speichern fehlgeschlagen",
        variant: "destructive",
      });
    }
  }

  if (id && bestehende.isLoading) return <p className="text-muted-foreground">Wird geladen …</p>;
  if (id && bestehende.isError) return <p className="text-destructive">{bestehende.error.message}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 max-w-2xl">
      <Link
        to="/admin/veranstaltungen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
      </Link>
      <ContentForm
        fields={fields}
        hidden={hidden}
        values={values}
        errors={errors}
        disabled={readOnly || speichern.isPending}
        suggestions={{ kategorie: kategorien }}
        onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      />
      {!readOnly && (
        <div className="flex gap-2">
          <Button type="submit" disabled={speichern.isPending}>
            {speichern.isPending ? "Wird gespeichert …" : "Speichern und veröffentlichen"}
          </Button>
          <Button asChild variant="outline" type="button">
            <Link to="/admin/veranstaltungen">Abbrechen</Link>
          </Button>
        </div>
      )}
    </form>
  );
}
