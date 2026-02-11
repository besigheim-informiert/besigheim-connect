import { Link } from "react-router-dom";
import { Heart, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { engagementAngebote } from "@/data/engagement";

const artLabels: Record<string, string> = {
  "regelmäßig": "Regelmäßig",
  "projektbezogen": "Projektbezogen",
  "einmalig": "Einmalig",
};

export default function Mitmachen() {
  return (
    <Layout>
      <section className="container py-12">
        <div className="max-w-2xl mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mitmachen & Engagement</h1>
          <p className="text-muted-foreground">
            Besigheim lebt vom Ehrenamt. Hier finden Sie aktuelle Möglichkeiten, sich einzubringen – ob regelmäßig, projektbezogen oder einmalig.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {engagementAngebote.map((a) => (
            <Card key={a.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">{artLabels[a.art]}</Badge>
                </div>
                <h2 className="font-semibold text-lg text-foreground mb-2">{a.titel}</h2>
                <p className="text-sm text-muted-foreground mb-3">{a.beschreibung}</p>
                <div className="text-sm space-y-1">
                  <Link to={`/vereine/${a.vereinId}`} className="text-primary hover:underline block">{a.vereinName}</Link>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {a.kontakt}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
