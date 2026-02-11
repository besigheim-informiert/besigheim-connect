import Layout from "@/components/Layout";
import { Mail, MapPin } from "lucide-react";

export default function Kontakt() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Kontakt</h1>
        <p className="text-muted-foreground mb-8">
          Haben Sie Fragen, Anregungen oder möchten Sie Ihren Verein eintragen lassen? Kontaktieren Sie uns gerne.
        </p>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            <span>kontakt@besigheim-informiert.de</span>
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
