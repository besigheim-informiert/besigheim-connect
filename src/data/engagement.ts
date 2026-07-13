export interface EngagementAngebot {
  id: string;
  titel: string;
  beschreibung: string;
  vereinId: string;
  vereinName: string;
  art: "regelmäßig" | "projektbezogen" | "einmalig";
  kontakt: string;
}

const engagementModules = import.meta.glob("../content/engagement/*.json", {
  eager: true,
  import: "default",
}) as Record<string, EngagementAngebot>;

export const engagementAngebote: EngagementAngebot[] = Object.values(
  engagementModules
).sort((a, b) =>
  a.id.localeCompare(b.id, "de", {
    numeric: true,
  })
);
