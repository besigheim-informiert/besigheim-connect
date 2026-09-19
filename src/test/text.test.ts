import { describe, expect, it } from "vitest";
import { textSegmente } from "@/lib/text";

/** Link hrefs in reading order - the part the rendered description turns into <a>. */
const links = (text: string) =>
  textSegmente(text)
    .filter((s) => s.href)
    .map((s) => s.href);

describe("textSegmente", () => {
  it("lässt Text ohne Links unverändert", () => {
    expect(textSegmente("Ein ganz normaler Satz.")).toEqual([
      { text: "Ein ganz normaler Satz." },
    ]);
  });

  it("erkennt URLs und E-Mail-Adressen", () => {
    expect(links("Anmeldung unter https://forms.gle/Xq6nSUKgDhaVY7Jq9 möglich")).toEqual([
      "https://forms.gle/Xq6nSUKgDhaVY7Jq9",
    ]);
    expect(links("Rückfragen an quartier@besigheim.de gerne")).toEqual([
      "mailto:quartier@besigheim.de",
    ]);
  });

  it("lässt den Satzpunkt außerhalb des Links", () => {
    const segmente = textSegmente("Mehr unter https://www.besigheim.de/seite.");
    expect(segmente.at(-2)).toEqual({
      text: "https://www.besigheim.de/seite",
      href: "https://www.besigheim.de/seite",
    });
    expect(segmente.at(-1)).toEqual({ text: "." });
  });

  it("setzt den gesamten Text wieder zusammen", () => {
    const text =
      "Formular: https://forms.gle/abc, Rückfragen an quartier@besigheim.de.\nBis dann!";
    expect(textSegmente(text).map((s) => s.text).join("")).toBe(text);
  });
});
