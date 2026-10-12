import { describe, expect, it } from "vitest";
import { buildRecordId, isIsoDate, slugify, validateRecord } from "@/shared/content-schema";

describe("slugify", () => {
  it("builds URL-safe ids from German titles", () => {
    expect(slugify("Großes Vereins- und Netzwerktreffen")).toBe("grosses-vereins-und-netzwerktreffen");
    expect(slugify("  Stricken & Häkeln!  ")).toBe("stricken-hakeln");
  });
});

describe("isIsoDate", () => {
  it("accepts real calendar days only", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("28.02.2026")).toBe(false);
  });
});

describe("buildRecordId", () => {
  it("encodes day, time and title for events like the existing files", () => {
    expect(
      buildRecordId("veranstaltung", { datum: "2026-10-07", titel: "Stricken und Häkeln", uhrzeit: "09:30" }),
    ).toBe("2026-10-07-09-30-stricken-und-hakeln");
  });

  it("uses the name for clubs", () => {
    expect(buildRecordId("verein", { name: "SpVgg Besigheim" })).toBe("spvgg-besigheim");
  });
});

describe("validateRecord", () => {
  const gueltig = {
    beschreibung: "Offener Treff.",
    datum: "2026-10-07",
    kategorie: "Soziales",
    ort: "Begegnungsstätte",
    titel: "Stricken und Häkeln",
    uhrzeit: "09:30",
  };

  it("returns a cleaned record and ignores derived fields", () => {
    const result = validateRecord("veranstaltung", {
      ...gueltig,
      enddatum: "",
      titel: "  Stricken und Häkeln ",
      vereinId: "fremder-verein",
      wiederholung: "Jeden Mittwoch",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.record).toEqual({ ...gueltig, wiederholung: "Jeden Mittwoch" });
      expect(result.record).not.toHaveProperty("vereinId");
      expect(result.record).not.toHaveProperty("enddatum");
    }
  });

  it("reports missing and malformed fields in German", () => {
    const result = validateRecord("veranstaltung", { ...gueltig, datum: "7.10.2026", ort: "", uhrzeit: "9 Uhr" });
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(Object.keys(result.errors).sort()).toEqual(["datum", "ort", "uhrzeit"]);
      expect(result.errors.ort).toBe("Ort ist ein Pflichtfeld.");
    }
  });

  it("rejects an end date before the start", () => {
    const result = validateRecord("veranstaltung", { ...gueltig, enddatum: "2026-10-01" });
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.errors.enddatum).toMatch(/Enddatum/);
  });

  it("splits list fields on newlines and drops duplicates", () => {
    const result = validateRecord("verein", {
      angebote: "Training\nTraining\n\nJugend",
      beschreibung: "Lang",
      kategorie: "Sport",
      kurzbeschreibung: "Kurz",
      name: "SpVgg",
      website: "spvgg.de",
      zielgruppe: "Alle",
    });
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(Object.keys(result.errors)).toEqual(["website"]);

    const ok = validateRecord("verein", {
      angebote: ["Training", "Training", "Jugend"],
      beschreibung: "Lang",
      kategorie: "Sport",
      kurzbeschreibung: "Kurz",
      name: "SpVgg",
      zielgruppe: "Alle",
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.record.angebote).toEqual(["Training", "Jugend"]);
  });

  it("keeps a valid picture path and rejects anything that is not a site-root image", () => {
    const ok = validateRecord("veranstaltung", {
      ...gueltig,
      bild: "/veranstaltungen/netzwerktreffen.jpg",
      bildAlt: "Menschen im Gespräch",
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.record.bild).toBe("/veranstaltungen/netzwerktreffen.jpg");

    for (const bild of ["https://evil.example/x.jpg", "/../secret.png", "/veranstaltungen/notiz.txt"]) {
      const result = validateRecord("veranstaltung", { ...gueltig, bild });
      expect(result.ok).toBe(false);
    }
  });

  it("checks select options", () => {
    const result = validateRecord("engagement", {
      art: "manchmal",
      beschreibung: "x",
      kontakt: "a@b.de",
      titel: "Helfer",
    });
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.errors.art).toMatch(/vorgegebenen Werte/);
  });
});
