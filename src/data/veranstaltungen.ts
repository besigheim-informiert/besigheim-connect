export interface Veranstaltung {
  id: string;
  titel: string;
  beschreibung: string;
  datum: string;
  uhrzeit: string;
  ort: string;
  vereinId: string;
  vereinName: string;
  kategorie: string;
  kontakt: string;
}

export const veranstaltungen: Veranstaltung[] = [
  {
    id: "1",
    titel: "Frühjahrskonzert",
    beschreibung:
      "Genießen Sie einen musikalischen Abend mit dem Blasorchester. Werke von Mozart bis Filmmusik.",
    datum: "2026-03-15",
    uhrzeit: "19:30",
    ort: "Stadthalle Besigheim",
    vereinId: "musikverein",
    vereinName: "Musikverein Besigheim e.V.",
    kategorie: "Musik",
    kontakt: "info@musikverein-besigheim.de",
  },
  {
    id: "2",
    titel: "Familiensportfest",
    beschreibung:
      "Ein Tag voller Bewegung und Spaß für die ganze Familie. Mit Mitmach-Stationen und Wettkämpfen.",
    datum: "2026-03-22",
    uhrzeit: "10:00",
    ort: "Sportgelände Turnverein",
    vereinId: "tv-besigheim",
    vereinName: "Turnverein Besigheim 1848 e.V.",
    kategorie: "Sport",
    kontakt: "info@tv-besigheim.de",
  },
  {
    id: "3",
    titel: "Vogelstimmenwanderung",
    beschreibung:
      "Frühmorgendliche Wanderung durch die Weinberge mit Vogelbestimmung für Einsteiger.",
    datum: "2026-04-05",
    uhrzeit: "06:30",
    ort: "Treffpunkt: Rathaus Besigheim",
    vereinId: "nabu-besigheim",
    vereinName: "NABU Ortsgruppe Besigheim",
    kategorie: "Natur & Umwelt",
    kontakt: "besigheim@nabu.de",
  },
  {
    id: "4",
    titel: "Lesung: Besigheimer Geschichten",
    beschreibung:
      "Lokale Autoren lesen aus ihren Werken über die Geschichte und Geschichten unserer Stadt.",
    datum: "2026-04-12",
    uhrzeit: "19:00",
    ort: "Stadtbibliothek Besigheim",
    vereinId: "kulturkreis",
    vereinName: "Kulturkreis Besigheim",
    kategorie: "Kultur",
    kontakt: "info@kulturkreis-besigheim.de",
  },
  {
    id: "5",
    titel: "Jugend-Workshop: Fotografie",
    beschreibung:
      "Lerne die Grundlagen der Fotografie mit dem Smartphone. Für Anfänger geeignet.",
    datum: "2026-04-19",
    uhrzeit: "14:00",
    ort: "Jugendforum Besigheim",
    vereinId: "jugendhaus",
    vereinName: "Jugendforum Besigheim",
    kategorie: "Jugend",
    kontakt: "jugendforum@besigheim.de",
  },
  {
    id: "6",
    titel: "Tag der offenen Tür - Bürgerhilfe",
    beschreibung:
      "Lernen Sie unsere Arbeit kennen und erfahren Sie, wie Sie sich engagieren können.",
    datum: "2026-05-03",
    uhrzeit: "11:00",
    ort: "Bürgerhilfe, Hauptstraße 22",
    vereinId: "sozialverein",
    vereinName: "Bürgerhilfe Besigheim e.V.",
    kategorie: "Soziales",
    kontakt: "info@buergerhilfe-besigheim.de",
  },
];
