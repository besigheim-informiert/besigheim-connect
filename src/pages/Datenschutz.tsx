import Layout from "@/components/Layout";

export default function Datenschutz() {
  return (
    <Layout>
      <section className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-4">Datenschutzerklärung</h1>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Nachfolgend informieren wir Sie darüber,
            welche Daten beim Besuch dieser Website und bei der Nutzung des Kontaktformulars verarbeitet werden.
          </p>
          <div>
            <h2 className="font-semibold text-foreground">Verantwortlicher</h2>
            <p>
              Tanja Bayer<br />
              Meisenweg 14<br />
              74354 Besigheim<br />
              E-Mail: tanja.bayer@cubesoft.org
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Hosting und technische Bereitstellung</h2>
            <p>
              Die Website wird über GitHub Pages bereitgestellt. Beim Aufruf der Website werden technisch
              notwendige Zugriffsdaten verarbeitet, zum Beispiel IP-Adresse, Datum und Uhrzeit des Abrufs,
              aufgerufene Dateien, übertragene Datenmenge, Browser- und Betriebssysteminformationen sowie
              Referrer-Informationen. Diese Verarbeitung ist erforderlich, um die Website auszuliefern und
              die Stabilität und Sicherheit des Angebots zu gewährleisten.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Kontaktformular</h2>
            <p>
              Wenn Sie das Kontaktformular nutzen, verarbeiten wir die von Ihnen eingegebenen Daten: Name,
              E-Mail-Adresse, Nachricht und optional Verein oder Organisation. Zusätzlich kann aus technischen
              Sicherheitsgründen der User-Agent Ihres Browsers gespeichert werden. Die Verarbeitung erfolgt,
              um Ihre Anfrage zu beantworten und Missbrauch des Formulars zu verhindern.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">E-Mail-Eingang und Datenübernahme</h2>
            <p>
              Eingehende E-Mails an die für das Projekt eingerichteten Adressen können automatisiert verarbeitet
              werden, um Informationen zu Vereinen, Veranstaltungen oder Engagement-Angeboten zu strukturieren.
              Dabei können Inhalte der E-Mail, Absender, Empfänger, Betreff und Anhänge verarbeitet werden. Sind
              alle erforderlichen Angaben vorhanden, können die strukturierten Informationen in das GitHub-Repository
              des Projekts übernommen werden.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Eingesetzte Dienste</h2>
            <p>
              Für den Betrieb werden GitHub Pages, Amazon Web Services in der Region EU, insbesondere API Gateway,
              AWS Lambda, Amazon DynamoDB, Amazon S3, Amazon SES, AWS Secrets Manager und Amazon Bedrock, sowie
              GitHub für die technische Veröffentlichung strukturierter Inhalte eingesetzt.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Rechtsgrundlage</h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse
              liegt im ehrenamtlichen Betrieb einer lokalen Informationsplattform, der Beantwortung von Anfragen,
              der technischen Sicherheit und der Pflege der veröffentlichten Inhalte. Soweit Sie uns freiwillig
              Informationen übermitteln, erfolgt die Verarbeitung außerdem zur Bearbeitung Ihrer Anfrage.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Speicherdauer</h2>
            <p>
              Kontaktformular-Nachrichten werden derzeit bis zu 180 Tage gespeichert. Automatisiert eingehende
              E-Mail-Daten und daraus extrahierte strukturierte Informationen werden derzeit bis zu 365 Tage
              gespeichert, soweit sie nicht vorher geprüft, veröffentlicht oder gelöscht werden. Gesetzliche
              Aufbewahrungspflichten bleiben unberührt.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Cookies und Tracking</h2>
            <p>
              Diese Website setzt derzeit keine eigenen Cookies und verwendet keine Analyse- oder Werbe-Tracking-Tools.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Ihre Rechte</h2>
            <p>
              Sie haben nach Maßgabe der DSGVO das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
              der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung. Sie haben außerdem
              das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für Baden-Württemberg ist dies
              der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
