export interface Verein {
  id: string;
  name: string;
  kurzbeschreibung: string;
  beschreibung: string;
  kategorie: string;
  zielgruppe: string;
  angebote: string[];
  ansprechpartner: string;
  email: string;
  telefon: string;
  website?: string;
  adresse: string;
}

export const kategorien = [
  "Sport",
  "Kultur",
  "Musik",
  "Soziales",
  "Jugend",
  "Natur & Umwelt",
  "Sonstiges",
];

export const vereine: Verein[] = [
  {
    id: "tv-besigheim",
    name: "Turnverein Besigheim 1848 e.V.",
    kurzbeschreibung:
      "Einer der ältesten Sportvereine der Region mit breitem Angebot für alle Altersgruppen.",
    beschreibung:
      "Der Turnverein Besigheim bietet seit über 175 Jahren ein vielfältiges Sportprogramm. Von Turnen über Leichtathletik bis hin zu Fitness - hier ist für jeden etwas dabei. Besonders beliebt sind unsere Kinder- und Jugendgruppen.",
    kategorie: "Sport",
    zielgruppe: "Alle Altersgruppen",
    angebote: [
      "Turnen",
      "Leichtathletik",
      "Fitness",
      "Kinderturnen",
      "Seniorensport",
    ],
    ansprechpartner: "Thomas Müller",
    email: "info@tv-besigheim.de",
    telefon: "07143 12345",
    website: "https://tv-besigheim.de",
    adresse: "Sportstraße 5, 74354 Besigheim",
  },
  {
    id: "musikverein",
    name: "Musikverein Besigheim e.V.",
    kurzbeschreibung:
      "Blasmusik und Orchesterarbeit mit Jugendausbildung und regelmäßigen Konzerten.",
    beschreibung:
      "Der Musikverein pflegt die Tradition der Blasmusik und bietet eine fundierte musikalische Ausbildung für Kinder und Jugendliche. Regelmäßige Konzerte und Auftritte bei Stadtfesten gehören zum festen Programm.",
    kategorie: "Musik",
    zielgruppe: "Kinder, Jugendliche, Erwachsene",
    angebote: [
      "Blasorchester",
      "Jugendorchester",
      "Instrumentalunterricht",
      "Konzerte",
    ],
    ansprechpartner: "Maria Schmidt",
    email: "info@musikverein-besigheim.de",
    telefon: "07143 23456",
    adresse: "Kirchstraße 12, 74354 Besigheim",
  },
  {
    id: "kulturkreis",
    name: "Kulturkreis Besigheim",
    kurzbeschreibung:
      "Kulturelle Veranstaltungen, Lesungen und Ausstellungen im historischen Stadtkern.",
    beschreibung:
      "Der Kulturkreis organisiert vielfältige kulturelle Veranstaltungen in Besigheim. Von Lesungen über Kunstausstellungen bis hin zu Theateraufführungen - wir bringen Kultur in die Stadt.",
    kategorie: "Kultur",
    zielgruppe: "Alle Interessierten",
    angebote: [
      "Lesungen",
      "Ausstellungen",
      "Theateraufführungen",
      "Kulturabende",
    ],
    ansprechpartner: "Dr. Petra Weber",
    email: "info@kulturkreis-besigheim.de",
    telefon: "07143 34567",
    adresse: "Marktplatz 3, 74354 Besigheim",
  },
  {
    id: "nabu-besigheim",
    name: "NABU Ortsgruppe Besigheim",
    kurzbeschreibung: "Naturschutz und Umweltbildung direkt vor der Haustür.",
    beschreibung:
      "Die NABU Ortsgruppe setzt sich für den Schutz der heimischen Natur ein. Wir organisieren Naturführungen, pflegen Biotope und bieten Umweltbildung für Kinder und Erwachsene.",
    kategorie: "Natur & Umwelt",
    zielgruppe: "Naturinteressierte aller Altersgruppen",
    angebote: [
      "Naturführungen",
      "Biotoppflege",
      "Vogelbeobachtung",
      "Umweltbildung",
    ],
    ansprechpartner: "Klaus Vogel",
    email: "besigheim@nabu.de",
    telefon: "07143 45678",
    adresse: "Enzweg 8, 74354 Besigheim",
  },
  {
    id: "jugendhaus",
    name: "Jugendforum Besigheim",
    kurzbeschreibung:
      "Offene Jugendarbeit mit Freizeitangeboten und Projekten für junge Menschen.",
    beschreibung:
      "Das Jugendforum bietet einen Treffpunkt für junge Menschen in Besigheim. Mit offenen Angeboten, Workshops und Projekten fördern wir die Eigeninitiative und das Miteinander.",
    kategorie: "Jugend",
    zielgruppe: "Jugendliche 12-21 Jahre",
    angebote: ["Offener Treff", "Workshops", "Ferienprogramm", "Projektarbeit"],
    ansprechpartner: "Sarah Klein",
    email: "jugendforum@besigheim.de",
    telefon: "07143 56789",
    adresse: "Bahnhofstraße 15, 74354 Besigheim",
  },
  {
    id: "sozialverein",
    name: "Bürgerhilfe Besigheim e.V.",
    kurzbeschreibung:
      "Nachbarschaftshilfe und soziale Unterstützung für alle Bürgerinnen und Bürger.",
    beschreibung:
      "Die Bürgerhilfe organisiert praktische Hilfe im Alltag - von Einkaufshilfe über Begleitung bei Arztbesuchen bis hin zu Besuchsdiensten. Wir stärken den Zusammenhalt in unserer Gemeinde.",
    kategorie: "Soziales",
    zielgruppe: "Hilfesuchende und Ehrenamtliche",
    angebote: ["Einkaufshilfe", "Begleitdienste", "Besuchsdienste", "Beratung"],
    ansprechpartner: "Ingrid Braun",
    email: "info@buergerhilfe-besigheim.de",
    telefon: "07143 67890",
    adresse: "Hauptstraße 22, 74354 Besigheim",
  },
];
