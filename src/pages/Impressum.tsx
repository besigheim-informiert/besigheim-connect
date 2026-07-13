import Layout from "@/components/Layout";

export default function Impressum() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Impressum</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h2 className="font-semibold text-foreground">Angaben nach § 5 DDG</h2>
            <p>
              Betreiberin dieser Website:<br />
              Tanja Bayer<br />
              Meisenweg 14<br />
              74354 Besigheim
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Kontakt</h2>
            <p>
              Tanja Bayer<br />
              E-Mail: tanja.bayer@cubesoft.org
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Verantwortlich für den Inhalt</h2>
            <p>
              Tanja Bayer<br />
              Meisenweg 14<br />
              74354 Besigheim
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Hinweis zum Projekt</h2>
            <p>
              Unser Besigheim ist ein ehrenamtlich betriebenes, nicht kommerzielles Informationsangebot.
              Hinter der Website steht derzeit keine Gesellschaft oder Firma.
            </p>
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
