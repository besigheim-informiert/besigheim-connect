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

const einrichtungModules = import.meta.glob(
  "../content/barrierefreiheit/*.json",
  {
    eager: true,
    import: "default",
  }
) as Record<string, Einrichtung>;

export const einrichtungen: Einrichtung[] = Object.values(
  einrichtungModules
).sort((a, b) => {
  const categoryCompare = a.kategorie.localeCompare(b.kategorie, "de");
  return categoryCompare || a.name.localeCompare(b.name, "de");
});
