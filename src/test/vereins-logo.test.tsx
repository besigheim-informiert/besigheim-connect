import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VereinsLogo from "@/components/VereinsLogo";
import ContentForm, { toFormValues } from "@/components/admin/ContentForm";
import { contentFields } from "@/shared/content-schema";

describe("VereinsLogo", () => {
  it("shows the logo with the club name as alt text", () => {
    render(<VereinsLogo verein={{ logo: "https://bilder.unser-besigheim.de/vereine/tsv-logo-1a2b3c4d.png", name: "TSV Besigheim" }} />);

    expect(screen.getByAltText("Logo von TSV Besigheim")).toHaveAttribute(
      "src",
      "https://bilder.unser-besigheim.de/vereine/tsv-logo-1a2b3c4d.png",
    );
  });

  it("renders nothing without a logo", () => {
    const { container } = render(<VereinsLogo verein={{ name: "TSV Besigheim" }} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("logo field in the club admin form", () => {
  it("offers an upload and previews the logo as a club logo", () => {
    const fields = contentFields.verein;
    render(
      <ContentForm
        fields={fields}
        values={{ ...toFormValues(undefined, fields), logo: "https://bilder.unser-besigheim.de/vereine/tsv-logo-1a2b3c4d.png" }}
        errors={{}}
        uploadImage={vi.fn()}
        onChange={() => {}}
      />,
    );

    expect(screen.getByAltText("Vorschau des Vereinslogos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Anderes Bild wählen/ })).toBeInTheDocument();
  });
});
