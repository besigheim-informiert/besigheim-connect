import Layout from "@/components/Layout";

export default function Impressum() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Impressum</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h2 className="font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
            <p>Unser Besigheim<br />Marktplatz 1<br />74354 Besigheim</p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Kontakt</h2>
            <p>E-Mail: kontakt@unser-besigheim.de</p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Haftungshinweis</h2>
            <p>
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. 
              Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
