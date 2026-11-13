import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import ContentForm, { toFormValues, type FormValues } from "@/components/admin/ContentForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ApiError, useEngagementAngebot, useMe, useSaveEngagementAngebot } from "@/lib/admin-api";
import { contentFields, derivedFields, validateRecord } from "@/shared/content-schema";

const fields = contentFields.engagement;
const hidden = derivedFields.engagement;

export default function AdminEngagementFormular() {
  const { id } = useParams<{ id: string }>();
  return (
    <AdminShell title={id ? "Engagement-Angebot bearbeiten" : "Neues Engagement-Angebot"}>
      <Formular id={id} />
    </AdminShell>
  );
}

function Formular({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const me = useMe();
  const bestehendes = useEngagementAngebot(id);
  const speichern = useSaveEngagementAngebot(id);
  const [values, setValues] = useState<FormValues>(() => toFormValues(undefined, fields));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bestehendes.data) setValues(toFormValues(bestehendes.data, fields));
  }, [bestehendes.data]);

  const readOnly = me.data ? !me.data.kannBearbeiten : true;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRecord("engagement", values);
    if (validation.ok === false) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    try {
      await speichern.mutateAsync(values);
      toast({
        description: "Die Änderung ist in wenigen Minuten auf der Website sichtbar.",
        title: id ? "Engagement-Angebot gespeichert" : "Engagement-Angebot angelegt",
      });
      navigate("/admin/engagement");
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Speichern fehlgeschlagen",
        variant: "destructive",
      });
    }
  }

  if (id && bestehendes.isLoading) return <p className="text-muted-foreground">Wird geladen …</p>;
  if (id && bestehendes.isError) return <p className="text-destructive">{bestehendes.error.message}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 max-w-2xl">
      <Link
        to="/admin/engagement"
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
        onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      />
      {!readOnly && (
        <div className="flex gap-2">
          <Button type="submit" disabled={speichern.isPending}>
            {speichern.isPending ? "Wird gespeichert …" : "Speichern und veröffentlichen"}
          </Button>
          <Button asChild variant="outline" type="button">
            <Link to="/admin/engagement">Abbrechen</Link>
          </Button>
        </div>
      )}
    </form>
  );
}
