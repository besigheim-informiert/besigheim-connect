import { Link } from "react-router-dom";
import { Mail, ArrowRight, Users, Lightbulb, HandHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import flohmarkt from "@/assets/nwq-flohmarkt.jpg";
import workshop from "@/assets/nwq-workshop.jpg";
import altstadt from "@/assets/nwq-altstadt.jpg";
import treffen from "@/assets/nwq-treffen.jpg";
import gespraech from "@/assets/nwq-gespraech.jpg";
import thesen from "@/assets/nwq-thesen.jpg";
import austausch from "@/assets/nwq-austausch.jpg";

import sharepic from "@/assets/netzwerk-quartier.jpg";

const kurzKnapp = [
  "Wir bringen Menschen an einen Tisch, die in ihrer Stadt was bewegen wollen.",
  "Mehr Workshop als Sitzung: Unsere Netzwerktreffen sind interaktiv und kurzweilig.",
  "Hier erfahren Sie, was es in den Vereinen und Initiativen Neues gibt.",
  "Finden Sie Mitstreiter für Ihre Idee und lassen Sie sich für wirksames Ehrenamt begeistern.",
  "Gegenseitig unterstützen wir uns mit Rat und Tat – von einem starken Netzwerk profitieren alle.",
];

const prinzipien = [
  {
    icon: Lightbulb,
    title: "Projektbasiert",
    text: "Projekte haben ein klares Ziel, dessen Umsetzung realistisch ist. Nach einem Jahr wird evaluiert – eine Gelingens-Garantie gibt es nicht.",
  },
  {
    icon: Users,
    title: "Menschen verbinden",
    text: "In der Arbeit kommen Menschen zusammen, die ansonsten eher nicht am selben Tisch sitzen würden.",
  },
  {
    icon: Sparkles,
    title: "Frische Ideen",
    text: "Ideen greifen reale Bedürfnisse auf und begeistern zum Mitmachen – nah an dem, was Besigheim bewegt.",
  },
  {
    icon: HandHeart,
    title: "Rückhalt & Wirksamkeit",
    text: "Durch die Unterstützung der Quartiersarbeit können Ehrenamtliche über sich hinauswachsen.",
  },
];

export default function NetzwerkQuartier() {
  return (
    <Layout>
      {/* Hero */}
      <section className="container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="eyebrow text-primary">Vernetzt vor Ort</span>
            <h1 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-3">
              Netzwerk <span className="italic text-primary">Quartier</span> Besigheim
            </h1>
            <p className="mt-5 text-base md:text-lg text-foreground/80 leading-relaxed">
              Ein lebendiger Zusammenschluss von engagierten Bürgerinnen und Bürgern, Vereinen,
              Initiativen und Unternehmen. Wir wollen, dass man sich in Besigheim kennt,
              wertschätzt, austauscht und mitmacht.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Aus dem Netzwerk sind bereits zahlreiche Projektgruppen hervorgegangen, die Angebote
              für alle Generationen möglich machen. Als Netzwerk sind wir offen für alle
              interessierten Bürger - eine feste Mitgliedschaft gibt es nicht.
            </p>
          </div>
          <div className="relative">
            <img
              src={sharepic}
              alt="Sharepic Netzwerktreffen: Du willst hier was bewegen? Dann komm zum Netzwerktreffen."
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Treffpunkt */}
      <section className="border-t border-foreground/10 bg-accent/30">
        <div className="container py-14 md:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-3">
            <img src={treffen} alt="Netzwerktreffen im Gewölbekeller" className="w-full h-56 md:h-72 object-cover" loading="lazy" />
            <img src={workshop} alt="Interaktive Feedback-Runde beim Netzwerktreffen" className="w-full h-56 md:h-72 object-cover" loading="lazy" />
            <img src={gespraech} alt="Gespräch zwischen Engagierten" className="w-full h-56 md:h-72 object-cover col-span-2" loading="lazy" />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow text-primary">Der Treffpunkt</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Für alle Engagierten in Besigheim
            </h2>
            <p className="mt-5 text-foreground/80 leading-relaxed">
              Wer in Besigheim ehrenamtlich aktiv ist oder einen Weg sucht, sich einzubringen, ist
              beim Netzwerktreffen genau richtig. Es ist jeder willkommen, der anpacken will.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Das Netzwerktreffen ist kein Format zum Rumsitzen. Im Rahmen der interaktiven
              Veranstaltung stellen wir Ihre Ideen in den Mittelpunkt. Finden Sie Mitstreiter,
              begeistern Sie für das Ehrenamt und tauschen Sie sich über aktuelle Planungen der
              Stadt aus.
            </p>
            <ul className="mt-6 space-y-3">
              {kurzKnapp.map((t) => (
                <li key={t} className="flex gap-3 text-sm md:text-base text-foreground/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Prinzipien */}
      <section className="container py-14 md:py-20">
        <div className="max-w-2xl">
          <span className="eyebrow text-primary">Wirksames Ehrenamt</span>
          <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
            Für ein besseres Miteinander
          </h2>
          <p className="mt-5 text-foreground/80 leading-relaxed">
            Wir reagieren auf Erkenntnisse der Sozialforschung: Die Menschen sind nicht weniger
            engagiert – die Bedingungen müssen nur zum Leben passen. Wir ermöglichen
            projektbasiertes, kurzfristiges und wirksames Engagement.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-10">
          {prinzipien.map(({ icon: Icon, title, text }) => (
            <div key={title} className="border border-foreground/10 p-6 bg-background">
              <div className="border border-foreground/20 p-3 inline-flex mb-4">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif-display text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engagement verändert sich */}
      <section className="border-t border-foreground/10">
        <div className="container py-14 md:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-primary">Engagement verändert sich</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Neue Wege für das Ehrenamt
            </h2>
            <p className="mt-5 text-foreground/80 leading-relaxed">
              Der Generationenwechsel in den klassischen Strukturen des Ehrenamts ist
              herausfordernd. Im projektbasierten Ansatz sehen wir eine Chance, auch in Zukunft
              Partizipation zu ermöglichen – etwa in der Nachbarschaftshilfe, der Inklusion oder
              im Naturschutz.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Mit unserer neuen Struktur verzichten wir auf schwer zu besetzende Posten. Das
              Arbeiten an Projekten ermöglicht echte Wirksamkeitserlebnisse. Innerhalb des
              Netzwerks entstehen Kooperationen, die die Umsetzung von Ideen erst möglich machen.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={flohmarkt} alt="Ehrenamtliche des Stadtflohmarkts in der Altstadt" className="w-full h-56 md:h-72 object-cover col-span-2" loading="lazy" />
            <img src={thesen} alt="Abstimmung mit Klebepunkten zu Thesen" className="w-full h-56 md:h-72 object-cover" loading="lazy" />
            <img src={austausch} alt="Austausch am Stehtisch beim Netzwerktreffen" className="w-full h-56 md:h-72 object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Gemeinsam mehr erreichen */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container py-14 md:py-20 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <img src={altstadt} alt="Belebte Altstadt Besigheim" className="w-full h-64 md:h-96 object-cover" loading="lazy" />
          <div>
            <span className="eyebrow text-highlight">Gemeinsam mehr erreichen</span>
            <h2 className="font-serif-display text-2xl md:text-4xl leading-tight mt-3">
              Nichtmitgliedschaftlich. Offen. Wirksam.
            </h2>
            <p className="mt-5 text-secondary-foreground/85 leading-relaxed">
              Innerhalb des Netzwerks arbeiten Vereine, Unternehmen, lokal engagierte Initiativen
              und aktive Bürgerinnen und Bürger miteinander zusammen. Das Kernteam der
              Quartiersarbeit moderiert, berät und koordiniert – zentraler Ideengeber sind die
              Engagierten selbst.
            </p>
            <p className="mt-4 text-secondary-foreground/75 leading-relaxed">
              So bleiben Projekte nah an den Bedürfnissen der Bürgerschaft. Zugleich orientiert
              sich die Arbeit an den Zielen der Landesstrategie Quartier 2030.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center border-t border-foreground/10 pt-12">
          <div>
            <h2 className="font-serif-display text-2xl md:text-3xl leading-tight">
              Sie möchten mitmachen oder eine Idee einbringen?
            </h2>
            <p className="mt-4 text-foreground/80 leading-relaxed">
              Vorbeikommen, Ideen einbringen, sich anschließen – Engagement, das Spaß macht und
              zum Leben passt. Schreiben Sie uns, wir freuen uns auf Sie.
            </p>
            <Button asChild className="rounded-none h-11 px-6 mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/kontakt">
                <Mail className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Kontakt aufnehmen
              </Link>
            </Button>
          </div>
          <div className="bg-accent/40 p-6 md:p-8 border border-foreground/10">
            <span className="eyebrow text-primary">Weitere Möglichkeiten</span>
            <p className="font-serif-display text-xl mt-2 leading-snug">
              Konkrete Ehrenamt-Angebote entdecken
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Sie suchen ein konkretes Engagement bei einem Verein oder einer Initiative in
              Besigheim? Auf der Mitmachen-Seite finden Sie aktuelle Angebote.
            </p>
            <Link
              to="/mitmachen"
              className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Angebote ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
