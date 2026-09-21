import { FormEvent, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ContentForm, { toFormValues, type FormValues } from "@/components/admin/ContentForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { kategorien } from "@/data/vereine";
import { ApiError, useMe, useSaveVerein, useVerein } from "@/lib/admin-api";
import { contentFields, validateRecord } from "@/shared/content-schema";

const fields = contentFields.verein;

export default function AdminVerein() {
  return (
    <AdminShell title="Vereinsdaten">
      <Formular />
    </AdminShell>
  );
}

function Formular() {
  const me = useMe();
  const verein = useVerein();
  const speichern = useSaveVerein();
  const [values, setValues] = useState<FormValues>(() => toFormValues(undefined, fields));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (verein.data) setValues(toFormValues(verein.data, fields));
  }, [verein.data]);

  const readOnly = me.data ? !me.data.kannBearbeiten : true;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRecord("verein", values);
    if (validation.ok === false) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    try {
      await speichern.mutateAsync(values);
      toast({
        description: "Die Änderung ist in wenigen Minuten auf der Website sichtbar.",
        title: "Vereinsdaten gespeichert",
      });
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Speichern fehlgeschlagen",
        variant: "destructive",
      });
    }
  }

  if (verein.isLoading) return <p className="text-muted-foreground">Wird geladen …</p>;
  if (verein.isError) return <p className="text-destructive">{verein.error.message}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 max-w-2xl">
      {verein.data === null && (
        <p className="text-sm text-muted-foreground">
          Für diesen Verein gibt es noch keine veröffentlichten Daten. Mit dem Speichern wird die
          Vereinsseite angelegt.
        </p>
      )}
      <ContentForm
        fields={fields}
        values={values}
        errors={errors}
        disabled={readOnly || speichern.isPending}
        suggestions={{ kategorie: kategorien }}
        onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      />
      {!readOnly && (
        <div>
          <Button type="submit" disabled={speichern.isPending}>
            {speichern.isPending ? "Wird gespeichert …" : "Speichern und veröffentlichen"}
          </Button>
        </div>
      )}
    </form>
  );
}
