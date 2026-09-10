import type {
  BarriereKategorie,
  BarriereStatus,
  Einrichtung,
} from "@/shared/content-schema";

export type Status = BarriereStatus;
export type Kategorie = BarriereKategorie;
export type { Einrichtung };

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
