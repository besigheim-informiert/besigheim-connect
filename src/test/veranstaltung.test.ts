import { describe, it, expect } from "vitest";
import { istNetzwerktreffen } from "@/data/veranstaltungen";
import { datumLabel, isoTag, istKommend, laeuftAm, tagLabel, terminTage } from "@/lib/veranstaltung";
import type { Veranstaltung } from "@/shared/content-schema";

const basis: Veranstaltung = {
  id: "test",
  titel: "Testtermin",
  beschreibung: "Beschreibung",
  datum: "2026-10-22",
  uhrzeit: "18:00",
  ort: "Alte Kelter, Besigheim",
  vereinId: "quartier-besigheim",
  vereinName: "Netzwerk Quartier Besigheim",
  kategorie: "Soziales",
};

const heute = new Date(2026, 9, 22); // 22.10.2026, lokal

describe("istKommend", () => {
  it("zählt den laufenden Tag noch als kommend", () => {
    expect(istKommend({ datum: "2026-10-22" }, heute)).toBe(true);
  });

  it("schließt vergangene Tage aus", () => {
    expect(istKommend({ datum: "2026-10-21" }, heute)).toBe(false);
  });

  it("hält mehrtägige Veranstaltungen bis zum letzten Tag kommend", () => {
    const mehrtaegig = { datum: "2026-10-20", enddatum: "2026-10-25" };
    expect(istKommend(mehrtaegig, heute)).toBe(true);
    expect(istKommend({ datum: "2026-10-18", enddatum: "2026-10-21" }, heute)).toBe(false);
  });
});

describe("Datumsformatierung", () => {
  it("nutzt den lokalen Kalendertag, nicht UTC", () => {
    expect(tagLabel({ datum: "2026-10-22" })).toBe("22");
    expect(datumLabel({ datum: "2026-10-22" })).toBe("Donnerstag, 22. Oktober 2026");
  });

  it("zeigt bei mehrtägigen Veranstaltungen eine Spanne", () => {
    expect(tagLabel({ datum: "2026-09-18", enddatum: "2026-09-20" })).toBe("18–20");
    expect(datumLabel({ datum: "2026-09-18", enddatum: "2026-09-20" })).toBe(
      "Freitag, 18. September 2026 bis Sonntag, 20. September 2026"
    );
  });
});

describe("Tagesfilter des Kalenders", () => {
  it("trifft eintägige Veranstaltungen genau an ihrem Tag", () => {
    expect(laeuftAm({ datum: "2026-10-22" }, "2026-10-22")).toBe(true);
    expect(laeuftAm({ datum: "2026-10-22" }, "2026-10-21")).toBe(false);
    expect(laeuftAm({ datum: "2026-10-22" }, "2026-10-23")).toBe(false);
  });

  it("trifft mehrtägige Veranstaltungen an jedem Tag der Spanne", () => {
    const musiktage = { datum: "2026-09-18", enddatum: "2026-09-20" };
    expect(laeuftAm(musiktage, "2026-09-18")).toBe(true);
    expect(laeuftAm(musiktage, "2026-09-19")).toBe(true);
    expect(laeuftAm(musiktage, "2026-09-20")).toBe(true);
    expect(laeuftAm(musiktage, "2026-09-21")).toBe(false);
  });
});

describe("terminTage", () => {
  it("markiert jeden Tag einer mehrtägigen Veranstaltung", () => {
    const tage = terminTage([
      { datum: "2026-09-18", enddatum: "2026-09-20" },
      { datum: "2026-10-22" },
    ]);

    expect(tage.map(isoTag)).toEqual([
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
      "2026-10-22",
    ]);
  });

  it("kommt auch über Monatsgrenzen hinweg zurecht", () => {
    const tage = terminTage([{ datum: "2026-09-29", enddatum: "2026-10-02" }]);

    expect(tage.map(isoTag)).toEqual([
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ]);
  });
});

describe("istNetzwerktreffen", () => {
  it("erkennt Netzwerktreffen der Quartiersarbeit", () => {
    expect(istNetzwerktreffen({ ...basis, titel: "Großes Netzwerktreffen" })).toBe(true);
    expect(istNetzwerktreffen({ ...basis, titel: "netzwerktreffen im Herbst" })).toBe(true);
  });

  it("ignoriert andere Termine der Quartiersarbeit", () => {
    expect(istNetzwerktreffen({ ...basis, titel: "Stricken und Häkeln" })).toBe(false);
  });

  it("ignoriert Netzwerktreffen anderer Veranstalter", () => {
    expect(
      istNetzwerktreffen({
        ...basis,
        titel: "Großes Netzwerktreffen",
        vereinId: "spvgg-besigheim",
      })
    ).toBe(false);
  });
});
