import Layout from "@/components/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Datenschutzerklärung</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Nachfolgend informieren wir Sie über die 
            Erhebung und Verwendung personenbezogener Daten auf dieser Website.
          </p>
          <div>
            <h2 className="font-semibold text-foreground">Verantwortlicher</h2>
            <p>Unser Besigheim, Marktplatz 1, 74354 Besigheim<br />E-Mail: kontakt@unser-besigheim.de</p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Erhebung und Verarbeitung</h2>
            <p>
              Diese Website erhebt derzeit keine personenbezogenen Daten. Es werden keine Cookies gesetzt 
              und keine Tracking-Tools eingesetzt.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Ihre Rechte</h2>
            <p>
              Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung 
              Ihrer personenbezogenen Daten gemäß der DSGVO.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
