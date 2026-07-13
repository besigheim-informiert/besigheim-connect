import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { isBackendConfigured, submitContactMessage } from "@/lib/backend";
import { Mail, MapPin, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Kontakt() {
  const backendConfigured = isBackendConfigured();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    message: "",
    name: "",
    organization: "",
    website: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!backendConfigured) {
      toast({
        description: "Setzen Sie VITE_API_BASE_URL auf die API-URL aus dem CDK-Deployment.",
        title: "Backend nicht verbunden",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage(form);
      setForm({
        email: "",
        message: "",
        name: "",
        organization: "",
        website: "",
      });
      toast({
        description: "Wir melden uns so bald wie möglich zurück.",
        title: "Nachricht gesendet",
      });
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Bitte versuchen Sie es später erneut.",
        title: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Kontakt</h1>
        <p className="text-muted-foreground mb-8">
          Haben Sie Fragen, Anregungen oder möchten Sie Ihren Verein eintragen lassen? Kontaktieren Sie uns gerne.
        </p>

        <Card className="mb-8">
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  disabled={isSubmitting}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  value={form.name}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                  type="email"
                  value={form.email}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="organization">Verein oder Organisation</Label>
                <Input
                  id="organization"
                  autoComplete="organization"
                  disabled={isSubmitting}
                  onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))}
                  value={form.organization}
                />
              </div>

              <div className="hidden">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  autoComplete="off"
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                  tabIndex={-1}
                  value={form.website}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  disabled={isSubmitting}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  required
                  rows={6}
                  value={form.message}
                />
              </div>

              {!backendConfigured && (
                <p className="text-sm text-muted-foreground">
                  Das Formular wird aktiv, sobald die API-URL in der Umgebung gesetzt ist.
                </p>
              )}

              <Button className="w-full sm:w-auto" disabled={isSubmitting || !backendConfigured} type="submit">
                <Send className="h-4 w-4" />
                {isSubmitting ? "Wird gesendet..." : "Nachricht senden"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            <span>kontakt@unser-besigheim.de</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Marktplatz 1, 74354 Besigheim</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
