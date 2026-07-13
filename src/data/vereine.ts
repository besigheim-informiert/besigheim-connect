export interface Verein {
  id: string;
  name: string;
  kurzbeschreibung: string;
  beschreibung: string;
  kategorie: string;
  zielgruppe: string;
  angebote: string[];
  ansprechpartner?: string;
  email?: string;
  telefon?: string;
  website?: string;
  adresse: string;
}

const vereinModules = import.meta.glob("../content/vereine/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Verein>;

const kategorieOrder = [
  "Sport",
  "Kultur",
  "Musik",
  "Soziales",
  "Jugend",
  "Natur & Umwelt",
  "Sonstiges",
];

export const vereine: Verein[] = Object.values(vereinModules).sort((a, b) =>
  a.name.localeCompare(b.name, "de")
);

export const kategorien = [
  ...kategorieOrder.filter((kategorie) =>
    vereine.some((verein) => verein.kategorie === kategorie)
  ),
  ...[...new Set(vereine.map((verein) => verein.kategorie))]
    .filter((kategorie) => !kategorieOrder.includes(kategorie))
    .sort((a, b) => a.localeCompare(b, "de")),
];
