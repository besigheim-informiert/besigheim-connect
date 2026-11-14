import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BildFehler, bereiteBildVor, erlaubteBildtypen } from "@/lib/bild";

type Props = {
  id: string;
  label: React.ReactNode;
  /** Current picture URL (or site-root path for older events); empty when none. */
  value: string;
  onChange: (pfad: string) => void;
  /** Uploads the prepared picture and resolves to its public URL. */
  upload: (bild: { dateiname: string; daten: string }) => Promise<string>;
  error?: string;
  disabled?: boolean;
  /** Shown under the preview when a picture is set but has no description yet. */
  fehlenderAltText?: boolean;
};

/**
 * Picture field for the admin forms: choose or drop a file, it is shrunk in
 * the browser, uploaded, and the returned URL is written into the form.
 * The picture is online right away; it shows on the event once the form is saved.
 */
export default function BildFeld({ id, label, value, onChange, upload, error, disabled, fehlenderAltText }: Props) {
  const eingabe = useRef<HTMLInputElement>(null);
  const [hochgeladen, setHochgeladen] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [ziehen, setZiehen] = useState(false);

  async function verarbeite(datei: File | undefined) {
    if (!datei || disabled || laedt) return;
    setFehler(null);
    setLaedt(true);
    try {
      const bild = await bereiteBildVor(datei);
      const pfad = await upload(bild);
      setHochgeladen(true);
      onChange(pfad);
    } catch (e) {
      setFehler(
        e instanceof BildFehler || e instanceof Error
          ? e.message
          : "Das Bild konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setLaedt(false);
      if (eingabe.current) eingabe.current.value = "";
    }
  }

  function entfernen() {
    setHochgeladen(false);
    setFehler(null);
    onChange("");
  }

  function beimAblegen(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setZiehen(false);
    void verarbeite(event.dataTransfer.files[0]);
  }

  const vorschau = value || null;
  const meldung = fehler ?? error;
  const fehlerId = `${id}-fehler`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>

      {vorschau && (
        <div className="flex flex-wrap items-start gap-3">
          <img
            src={vorschau}
            alt="Vorschau des Veranstaltungsbildes"
            className="h-32 w-auto max-w-full rounded-md border border-foreground/10 object-cover"
          />
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={entfernen} disabled={laedt}>
              <X className="h-4 w-4" /> Bild entfernen
            </Button>
          )}
        </div>
      )}

      {!disabled && (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setZiehen(true);
          }}
          onDragLeave={() => setZiehen(false)}
          onDrop={beimAblegen}
          className={`flex flex-wrap items-center gap-3 rounded-md border border-dashed px-4 py-3 text-sm transition-colors ${
            ziehen ? "border-primary bg-primary/5" : "border-input"
          }`}
        >
          <Button type="button" variant="outline" size="sm" disabled={laedt} onClick={() => eingabe.current?.click()}>
            {laedt ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {laedt ? "Wird hochgeladen …" : vorschau ? "Anderes Bild wählen" : "Bild auswählen"}
          </Button>
          <span className="text-muted-foreground">oder hierher ziehen. JPEG, PNG, WebP oder AVIF.</span>
          <input
            ref={eingabe}
            id={id}
            type="file"
            accept={erlaubteBildtypen.join(",")}
            className="sr-only"
            aria-describedby={meldung ? fehlerId : undefined}
            aria-invalid={meldung ? true : undefined}
            onChange={(event) => void verarbeite(event.target.files?.[0])}
          />
        </div>
      )}

      {disabled && !vorschau && <p className="text-sm text-muted-foreground">Kein Bild hinterlegt.</p>}

      {hochgeladen && vorschau && !disabled && (
        <p className="text-xs text-muted-foreground">
          Das Bild ist hochgeladen. Es erscheint bei der Veranstaltung, sobald Sie speichern.
        </p>
      )}
      {vorschau && fehlenderAltText && !disabled && (
        <p className="text-xs text-muted-foreground">
          Bitte beschreiben Sie das Bild unten im Feld „Bildbeschreibung“, damit es auch für blinde Menschen zugänglich ist.
        </p>
      )}
      {meldung && (
        <p id={fehlerId} className="text-sm text-destructive">
          {meldung}
        </p>
      )}
    </div>
  );
}
