import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Layout pulls in Clerk, which needs a provider we do not want in a render smoke test.
vi.mock("@clerk/react", () => ({
  Show: () => null,
  SignInButton: () => null,
  UserButton: () => null,
}));

const { default: VeranstaltungDetail } = await import("@/pages/VeranstaltungDetail");
const { default: Veranstaltungen } = await import("@/pages/Veranstaltungen");
const { default: NetzwerkQuartier } = await import("@/pages/NetzwerkQuartier");

function renderRoute(pfad: string, element: React.ReactElement, pattern: string) {
  return render(
    <MemoryRouter initialEntries={[pfad]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Veranstaltungs-Detailseite", () => {
  it("zeigt Titel, Datum, Uhrzeit und Ort", () => {
    renderRoute(
      "/veranstaltungen/2026-10-07-09-30-stricken-und-haekeln",
      <VeranstaltungDetail />,
      "/veranstaltungen/:id"
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Stricken und Häkeln" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mittwoch, 7. Oktober 2026")).toBeInTheDocument();
    expect(screen.getByText("09:30 Uhr")).toBeInTheDocument();
    expect(screen.getByText("Begegnungsstätte, Besigheim")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Netzwerk Quartier Besigheim" })).toHaveAttribute(
      "href",
      "/vereine/quartier-besigheim"
    );
  });

  it("meldet unbekannte Veranstaltungen", () => {
    renderRoute("/veranstaltungen/gibt-es-nicht", <VeranstaltungDetail />, "/veranstaltungen/:id");

    expect(
      screen.getByRole("heading", { name: "Veranstaltung nicht gefunden" })
    ).toBeInTheDocument();
  });
});

describe("Veranstaltungskalender", () => {
  it("verlinkt jeden Termin auf seine eigene Seite", () => {
    renderRoute("/veranstaltungen", <Veranstaltungen />, "/veranstaltungen");

    expect(screen.getByRole("link", { name: "Stricken und Häkeln" })).toHaveAttribute(
      "href",
      "/veranstaltungen/2026-10-07-09-30-stricken-und-haekeln"
    );
  });

  it("zeigt ein Monatsraster mit allen Wochentagen", () => {
    renderRoute("/veranstaltungen", <Veranstaltungen />, "/veranstaltungen");

    expect(screen.getByRole("grid")).toBeInTheDocument();
    const wochentage = [
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag",
    ];
    for (const tag of wochentage) {
      expect(screen.getByRole("columnheader", { name: tag })).toBeInTheDocument();
    }
  });

  it("filtert die Liste auf den im Kalender gewählten Tag", () => {
    renderRoute("/veranstaltungen", <Veranstaltungen />, "/veranstaltungen");

    // 18.09.2026 - erster Tag der mehrtägigen Musik- und Weintage.
    fireEvent.click(screen.getByRole("gridcell", { name: "18" }));

    expect(screen.getByText(/Termine am Freitag, 18\. September 2026/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Musik- und Weintage 2026" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Stricken und Häkeln" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Alle Termine zeigen" }));
    expect(screen.getByRole("link", { name: "Stricken und Häkeln" })).toBeInTheDocument();
  });
});

describe("Netzwerk Quartier", () => {
  it("zeigt den Netzwerktreffen-Kalender und verlinkt die Termine", () => {
    renderRoute("/netzwerk-quartier", <NetzwerkQuartier />, "/netzwerk-quartier");

    expect(
      screen.getByRole("heading", { name: "Die nächsten Netzwerktreffen" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Großes Vereins- und Netzwerktreffen/ })
    ).toHaveAttribute(
      "href",
      "/veranstaltungen/2026-10-22-19-00-grosses-vereins-und-netzwerktreffen"
    );
  });

  it("nimmt andere Termine der Quartiersarbeit nicht auf", () => {
    renderRoute("/netzwerk-quartier", <NetzwerkQuartier />, "/netzwerk-quartier");

    expect(
      screen.queryByRole("link", { name: /Stricken und Häkeln/ })
    ).not.toBeInTheDocument();
  });
});
