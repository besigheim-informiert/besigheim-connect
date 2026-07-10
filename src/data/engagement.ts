export interface EngagementAngebot {
  id: string;
  titel: string;
  beschreibung: string;
  vereinId: string;
  vereinName: string;
  art: "regelmäßig" | "projektbezogen" | "einmalig";
  kontakt: string;
}

export const engagementAngebote: EngagementAngebot[] = [
  {
    id: "1",
    titel: "Übungsleiter/in für Kinderturnen",
    beschreibung:
      "Wir suchen engagierte Menschen, die Freude an der Arbeit mit Kindern haben und unser Kinderturnen mitgestalten möchten.",
    vereinId: "tv-besigheim",
    vereinName: "Turnverein Besigheim 1848 e.V.",
    art: "regelmäßig",
    kontakt: "info@tv-besigheim.de",
  },
  {
    id: "2",
    titel: "Helfer/innen für Frühjahrskonzert",
    beschreibung:
      "Für unser Konzert im März suchen wir Unterstützung beim Auf- und Abbau sowie an der Kasse.",
    vereinId: "musikverein",
    vereinName: "Musikverein Besigheim e.V.",
    art: "einmalig",
    kontakt: "info@musikverein-besigheim.de",
  },
  {
    id: "3",
    titel: "Biotoppflege-Team",
    beschreibung:
      "Regelmäßige Pflegeeinsätze in den Naturschutzgebieten rund um Besigheim. Keine Vorkenntnisse nötig.",
    vereinId: "nabu-besigheim",
    vereinName: "NABU Ortsgruppe Besigheim",
    art: "regelmäßig",
    kontakt: "besigheim@nabu.de",
  },
  {
    id: "4",
    titel: "Einkaufspaten gesucht",
    beschreibung:
      "Helfen Sie älteren Mitbürgern beim wöchentlichen Einkauf. Zeitaufwand ca. 2 Stunden pro Woche.",
    vereinId: "sozialverein",
    vereinName: "Bürgerhilfe Besigheim e.V.",
    art: "regelmäßig",
    kontakt: "info@buergerhilfe-besigheim.de",
  },
  {
    id: "5",
    titel: "Workshop-Leitung im Jugendforum",
    beschreibung:
      "Bringen Sie Ihre Fähigkeiten ein und leiten Sie einen Workshop für Jugendliche - ob Kochen, Coding oder Kunst.",
    vereinId: "jugendhaus",
    vereinName: "Jugendforum Besigheim",
    art: "projektbezogen",
    kontakt: "jugendforum@besigheim.de",
  },
];
