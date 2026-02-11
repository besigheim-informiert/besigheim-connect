import Layout from "@/components/Layout";

export default function UeberUns() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Über das Projekt</h1>
        <div className="prose prose-neutral max-w-none space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">Besigheim informiert</strong> ist eine zentrale digitale Bürgerplattform für die Stadt Besigheim. 
            Unser Ziel ist es, Vereine, Initiativen und ehrenamtliches Engagement sichtbar zu machen und allen 
            Bürgerinnen und Bürgern eine strukturierte Anlaufstelle für Informationen zu bieten.
          </p>
          <p>
            Die Plattform ist kein soziales Netzwerk und kein Messenger-Ersatz – sondern eine nachhaltige, 
            übersichtliche Informationsbasis für unsere Gemeinschaft.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8">Unsere Ziele</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Vereine sichtbar machen</li>
            <li>Veranstaltungen auffindbar machen</li>
            <li>Ansprechpartner klar darstellen</li>
            <li>Einstieg ins Ehrenamt erleichtern</li>
            <li>Informationen langfristig strukturiert bereitstellen</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground mt-8">Für wen ist die Plattform?</h2>
          <p>
            Für alle – egal ob alteingesessene Besigheimer, Neuzugezogene, Jugendliche oder Senioren. 
            Vereine und Initiativen finden hier eine Bühne, Bürgerinnen und Bürger eine verlässliche Informationsquelle.
          </p>
        </div>
      </section>
    </Layout>
  );
}
