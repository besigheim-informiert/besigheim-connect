export type Status = "ja" | "teilweise" | "nein" | "unbekannt" | "na";

export type Kategorie =
  | "Arztpraxis"
  | "Zahnarzt"
  | "Tierarzt"
  | "Hebamme"
  | "Apotheke"
  | "Physiotherapie"
  | "Logopädie"
  | "Ergotherapie"
  | "Polizei"
  | "Post"
  | "Recht & Notariat"
  | "Verwaltung";

export interface Einrichtung {
  id: string;
  name: string;
  kategorie: Kategorie;
  facharzt?: string;
  strasse: string;
  telefon?: string;
  zugang: Status;
  sehbehinderung: Status;
  wc: Status;
  parkplatz: Status;
}

// Aus "Adressen und Zugänglichkeiten in Besigheim" (Netzwerk Quartier Besigheim)
export const einrichtungen: Einrichtung[] = [
  // Gesundheitswesen — Ärzte
  { id: "bubeck", name: "Bubeck-Praxen", kategorie: "Arztpraxis", facharzt: "Allgemeinmedizin", strasse: "Weinstr. 6", telefon: "07143 3001", zugang: "ja", sehbehinderung: "unbekannt", wc: "ja", parkplatz: "ja" },
  { id: "buderer", name: "Dr. med. Buderer", kategorie: "Arztpraxis", facharzt: "Allgemeinmedizin", strasse: "Bietigheimer Str. 29", telefon: "07143 3805", zugang: "ja", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "feinauer-bahnhof", name: "Dr. med. Feinauer", kategorie: "Arztpraxis", facharzt: "Allgemeinmedizin", strasse: "Bahnhofstr. 20", telefon: "07143 801210", zugang: "ja", sehbehinderung: "unbekannt", wc: "teilweise", parkplatz: "teilweise" },
  { id: "feinauer-buelzen", name: "Dr. med. Feinauer", kategorie: "Arztpraxis", facharzt: "Allgemeinmedizin", strasse: "Bülzenstr. 1", telefon: "07143 967750", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "rieth", name: "Dr. med. Rieth", kategorie: "Arztpraxis", facharzt: "Allgemeinmedizin", strasse: "Freudentaler Str. 3", telefon: "07143 8042-0", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "nein" },
  { id: "adam", name: "Orthopädiezentrum Adam", kategorie: "Arztpraxis", facharzt: "Orthopädie", strasse: "Riedstr. 1", telefon: "07143 35086", zugang: "ja", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "huber", name: "Dr. med. Huber", kategorie: "Arztpraxis", facharzt: "HNO", strasse: "Bahnhofstr. 8b", telefon: "07143 32789", zugang: "nein", sehbehinderung: "na", wc: "na", parkplatz: "na" },
  { id: "schade", name: "Bernd Schade", kategorie: "Arztpraxis", facharzt: "Augenheilkunde", strasse: "Bahnhofstr. 5", telefon: "07143 801060", zugang: "nein", sehbehinderung: "unbekannt", wc: "nein", parkplatz: "teilweise" },
  { id: "wimmershof", name: "Wimmershof-Rieth", kategorie: "Arztpraxis", facharzt: "Frauenheilkunde / Geburtshilfe", strasse: "Freudentaler Str. 3", telefon: "07143 804220", zugang: "nein", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "kaesehoch", name: "Kinderärzte 3 Käsehoch", kategorie: "Arztpraxis", facharzt: "Kinderarzt", strasse: "Bahnhofstr. 10", telefon: "07143 32720", zugang: "ja", sehbehinderung: "ja", wc: "teilweise", parkplatz: "ja" },
  // Zahnärzte / Tierarzt / Hebammen
  { id: "fierlbeck", name: "Dr. Fierlbeck", kategorie: "Zahnarzt", strasse: "Steinbachstr. 13", telefon: "07143 801666", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "frank", name: "Dr. E. und S. Frank", kategorie: "Zahnarzt", strasse: "Bahnhofstr. 16/2", telefon: "07143 803133", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "teilweise" },
  { id: "mann", name: "Dr. Mann", kategorie: "Zahnarzt", strasse: "Riedstr. 1", telefon: "07143 402613", zugang: "ja", sehbehinderung: "ja", wc: "unbekannt", parkplatz: "ja" },
  { id: "rueck", name: "Dr. Rueck", kategorie: "Zahnarzt", strasse: "Kirchstr. 38", telefon: "07143 33355", zugang: "nein", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "posthoff", name: "Dr. Posthoff", kategorie: "Tierarzt", strasse: "Finkenweg 1", telefon: "07143 801020", zugang: "nein", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "buerger", name: "Katja Bürger", kategorie: "Hebamme", strasse: "Bahnhofstr. 10", telefon: "07143 9099229", zugang: "ja", sehbehinderung: "ja", wc: "teilweise", parkplatz: "ja" },
  { id: "boehler", name: "Böhler, Bernike", kategorie: "Hebamme", strasse: "Kirchstr. 4", telefon: "07143 408448", zugang: "teilweise", sehbehinderung: "ja", wc: "teilweise", parkplatz: "ja" },
  // Apotheken
  { id: "bahnhofapo", name: "Bahnhofapotheke Besigheim", kategorie: "Apotheke", strasse: "Weinstraße 6", telefon: "07143 358849", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "ecenterapo", name: "Apotheke im E-Center", kategorie: "Apotheke", strasse: "Riedstraße 4", telefon: "07143 801853", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  // Physiotherapie
  { id: "gg-physio", name: "GG-Physiotherapie Praxis", kategorie: "Physiotherapie", strasse: "Riedstraße 3", telefon: "07143 9569541", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "motus", name: "Motus Besigheim GmbH", kategorie: "Physiotherapie", strasse: "Zeppelinstraße 8", telefon: "07143 405193", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "lorenz", name: "Physio Lorenz", kategorie: "Physiotherapie", strasse: "Kirchstraße 32", telefon: "07143 402479", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "physio49", name: "Physio 49", kategorie: "Physiotherapie", strasse: "Hauptstraße 49", telefon: "07143 34520", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "pro-physio", name: "Pro Physio Besigheim", kategorie: "Physiotherapie", strasse: "Bahnhofstraße 2", telefon: "07143 9688971", zugang: "nein", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "ja" },
  { id: "zar-physio", name: "ZAR Gesundheits- und Therapiezentrum", kategorie: "Physiotherapie", strasse: "Weinstraße 6", telefon: "07143 4029560", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  // Logopädie
  { id: "sprachlos", name: "sprach los — Logopädie am Bahnhof", kategorie: "Logopädie", strasse: "Weinstr. 6", telefon: "07143 9674400", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "riedinger", name: "Marco Riedinger", kategorie: "Logopädie", strasse: "Bahnhofstr. 5", telefon: "07143 407500", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  // Ergotherapie
  { id: "trinkner", name: "Anke Trinkner", kategorie: "Ergotherapie", strasse: "Weinstraße 4", telefon: "07143 967799", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "zar-ergo", name: "ZAR Gesundheits- und Therapiezentrum", kategorie: "Ergotherapie", strasse: "Weinstraße 6", telefon: "07143 2592000", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  // Polizei / Post
  { id: "polizei", name: "Polizeiposten Besigheim", kategorie: "Polizei", strasse: "Mattestraße 11", telefon: "07143 405080", zugang: "ja", sehbehinderung: "ja", wc: "unbekannt", parkplatz: "ja" },
  { id: "post-mantz", name: "Postfiliale Kleiderpflege Mantz", kategorie: "Post", strasse: "Bahnhofstraße 20", zugang: "ja", sehbehinderung: "nein", wc: "nein", parkplatz: "teilweise" },
  // Recht
  { id: "buerkle", name: "Notar Jochen Bürkle", kategorie: "Recht & Notariat", strasse: "Bühl 17", telefon: "07143 3309933", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "notariat", name: "Notariat Besigheim", kategorie: "Recht & Notariat", strasse: "Bühl 17", telefon: "07143 833410", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "schaeufele", name: "Anwaltskanzlei Schäufele Pohl Fritz", kategorie: "Recht & Notariat", strasse: "Bahnhofstraße 5", telefon: "07143 330930", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "renke", name: "Rechtsanwältin Gudrun Renke", kategorie: "Recht & Notariat", strasse: "Hauptstraße 75", telefon: "07143 3036", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "spahr", name: "Rechtsanwalt Rainer Spahr", kategorie: "Recht & Notariat", strasse: "Marktplatz 7", telefon: "07143 801525", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  // Verwaltung
  { id: "rathaus", name: "Stadtverwaltung Rathaus", kategorie: "Verwaltung", strasse: "Marktplatz 12", telefon: "07143 8078-0", zugang: "ja", sehbehinderung: "nein", wc: "teilweise", parkplatz: "ja" },
  { id: "rathaus-verw", name: "Rathaus Verwaltungsgebäude", kategorie: "Verwaltung", strasse: "Marktplatz 12", zugang: "nein", sehbehinderung: "nein", wc: "nein", parkplatz: "ja" },
  { id: "ottmarsheim", name: "Verwaltungsstelle Ottmarsheim", kategorie: "Verwaltung", strasse: "Ilsfelder Str. 7", telefon: "07143 8078-300", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "amtsgericht", name: "Amtsgericht Besigheim", kategorie: "Verwaltung", strasse: "Amtsgerichtsgasse 5", telefon: "07143 83330", zugang: "ja", sehbehinderung: "ja", wc: "ja", parkplatz: "ja" },
  { id: "kfz", name: "KFZ-Zulassung", kategorie: "Verwaltung", strasse: "Kronenstr. 1", telefon: "07141 442068", zugang: "ja", sehbehinderung: "ja", wc: "unbekannt", parkplatz: "unbekannt" },
  { id: "jobcenter", name: "Job Center", kategorie: "Verwaltung", strasse: "Kronenstr. 1", zugang: "ja", sehbehinderung: "ja", wc: "unbekannt", parkplatz: "teilweise" },
  { id: "strassenmeisterei", name: "Straßenmeisterei Besigheim", kategorie: "Verwaltung", strasse: "Rudolf-Diesel-Str. 17", telefon: "07141 442013", zugang: "unbekannt", sehbehinderung: "unbekannt", wc: "unbekannt", parkplatz: "unbekannt" },
];
