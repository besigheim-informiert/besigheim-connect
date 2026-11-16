import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ContentForm, { toFormValues, type FormValues } from "@/components/admin/ContentForm";
import { BildFehler, bereiteBildVor, pruefeBilddatei } from "@/lib/bild";
import { contentFields, derivedFields } from "@/shared/content-schema";

// Canvas and createImageBitmap do not exist in jsdom; the shrinking itself is mocked.
vi.mock("@/lib/bild", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/bild")>();
  return { ...actual, bereiteBildVor: vi.fn() };
});

const fields = contentFields.veranstaltung;

function Formular({
  upload,
  start = {},
  disabled,
}: {
  upload?: (bild: { dateiname: string; daten: string }) => Promise<string>;
  start?: Record<string, unknown>;
  disabled?: boolean;
}) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(start, fields));
  return (
    <>
      <ContentForm
        fields={fields}
        hidden={derivedFields.veranstaltung}
        values={values}
        errors={{}}
        disabled={disabled}
        uploadImage={upload}
        onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      />
      <output data-testid="bild">{values.bild}</output>
    </>
  );
}

const datei = () => new File(["x"], "Sommerfest.png", { type: "image/png" });

describe("image field in the admin form", () => {
  beforeEach(() => {
    vi.mocked(bereiteBildVor).mockReset();
    vi.mocked(bereiteBildVor).mockResolvedValue({
      daten: "QUJD",
      dateiname: "Sommerfest.jpg",
    });
  });

  it("uploads the chosen picture and writes the returned URL into the form", async () => {
    const upload = vi.fn(async () => "https://bilder.unser-besigheim.de/veranstaltungen/tsv-sommerfest-1a2b3c4d.jpg");
    render(<Formular upload={upload} />);

    fireEvent.change(screen.getByLabelText("Bild"), { target: { files: [datei()] } });

    await waitFor(() =>
      expect(screen.getByTestId("bild")).toHaveTextContent("https://bilder.unser-besigheim.de/veranstaltungen/tsv-sommerfest-1a2b3c4d.jpg"),
    );
    expect(upload).toHaveBeenCalledWith({ daten: "QUJD", dateiname: "Sommerfest.jpg" });
    expect(screen.getByAltText("Vorschau des Veranstaltungsbildes")).toHaveAttribute("src", "https://bilder.unser-besigheim.de/veranstaltungen/tsv-sommerfest-1a2b3c4d.jpg");
    expect(screen.getByText(/Es erscheint bei der Veranstaltung, sobald Sie speichern/)).toBeInTheDocument();
    expect(screen.getByText(/Bitte beschreiben Sie das Bild/)).toBeInTheDocument();
  });

  it("shows the error and keeps the old path when the upload fails", async () => {
    const upload = vi.fn(async () => {
      throw new Error("Das Bild ist zu groß. Erlaubt sind höchstens 3 MB.");
    });
    render(<Formular upload={upload} start={{ bild: "/veranstaltungen/alt.jpg" }} />);

    fireEvent.change(screen.getByLabelText("Bild"), { target: { files: [datei()] } });

    expect(await screen.findByText("Das Bild ist zu groß. Erlaubt sind höchstens 3 MB.")).toBeInTheDocument();
    expect(screen.getByTestId("bild")).toHaveTextContent("/veranstaltungen/alt.jpg");
  });

  it("shows a rejected file type without uploading", async () => {
    vi.mocked(bereiteBildVor).mockRejectedValue(new BildFehler("Bitte wählen Sie ein Bild im Format JPEG, PNG, WebP oder AVIF."));
    const upload = vi.fn(async () => "/veranstaltungen/x.jpg");
    render(<Formular upload={upload} />);

    fireEvent.change(screen.getByLabelText("Bild"), { target: { files: [new File(["x"], "a.pdf", { type: "application/pdf" })] } });

    expect(await screen.findByText(/JPEG, PNG, WebP oder AVIF/)).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });

  it("shows the existing picture, and removing it clears the path", () => {
    render(<Formular upload={vi.fn()} start={{ bild: "/veranstaltungen/alt.jpg", bildAlt: "Foto vom Fest" }} />);

    expect(screen.getByAltText("Vorschau des Veranstaltungsbildes")).toHaveAttribute("src", "/veranstaltungen/alt.jpg");
    expect(screen.queryByText(/Bitte beschreiben Sie das Bild/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Bild entfernen/ }));

    expect(screen.getByTestId("bild")).toBeEmptyDOMElement();
  });

  it("is read-only for members", () => {
    render(<Formular upload={vi.fn()} disabled start={{ bild: "/veranstaltungen/alt.jpg" }} />);

    expect(screen.queryByRole("button", { name: /Bild/ })).not.toBeInTheDocument();
    expect(screen.getByAltText("Vorschau des Veranstaltungsbildes")).toBeInTheDocument();
  });

  it("falls back to the path input without an upload function", () => {
    render(<Formular start={{ bild: "/veranstaltungen/alt.jpg" }} />);

    expect(screen.getByLabelText("Bild")).toHaveValue("/veranstaltungen/alt.jpg");
  });
});

describe("pruefeBilddatei", () => {
  it("accepts the supported picture types and rejects others", () => {
    expect(() => pruefeBilddatei(new File(["x"], "a.jpg", { type: "image/jpeg" }))).not.toThrow();
    expect(() => pruefeBilddatei(new File(["x"], "a.svg", { type: "image/svg+xml" }))).toThrow(BildFehler);
    expect(() => pruefeBilddatei(new File(["x"], "a.gif", { type: "image/gif" }))).toThrow(BildFehler);
  });
});
