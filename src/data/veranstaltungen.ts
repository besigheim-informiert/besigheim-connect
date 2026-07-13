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

const veranstaltungModules = import.meta.glob(
  "../content/veranstaltungen/*.json",
  {
    eager: true,
    import: "default",
  }
) as Record<string, Veranstaltung>;

export const veranstaltungen: Veranstaltung[] = Object.values(
  veranstaltungModules
).sort((a, b) => {
  const dateCompare = a.datum.localeCompare(b.datum);
  return dateCompare || a.uhrzeit.localeCompare(b.uhrzeit);
});
