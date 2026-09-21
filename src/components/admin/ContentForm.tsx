import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef } from "@/shared/content-schema";

/** Form state: every field as a string; list fields hold one entry per line. */
export type FormValues = Record<string, string>;

export function toFormValues(record: object | undefined, fields: readonly FieldDef[]): FormValues {
  const values: FormValues = {};
  const source = (record ?? {}) as Record<string, unknown>;
  for (const field of fields) {
    const raw = source[field.name];
    values[field.name] = Array.isArray(raw) ? raw.join("\n") : raw == null ? "" : String(raw);
  }
  return values;
}

type Props = {
  fields: readonly FieldDef[];
  values: FormValues;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /** Field names not rendered (the server derives them). */
  hidden?: readonly string[];
  /** Datalist suggestions for free-text fields, e.g. known categories. */
  suggestions?: Record<string, readonly string[]>;
  disabled?: boolean;
};

export default function ContentForm({ fields, values, errors, onChange, hidden = [], suggestions = {}, disabled }: Props) {
  return (
    <div className="grid gap-5">
      {fields
        .filter((field) => !hidden.includes(field.name))
        .map((field) => {
          const id = `feld-${field.name}`;
          const error = errors[field.name];
          const label = (
            <Label htmlFor={id}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
          );
          const errorText = error && (
            <p id={`${id}-fehler`} className="text-sm text-destructive">
              {error}
            </p>
          );
          const common = {
            "aria-describedby": error ? `${id}-fehler` : undefined,
            "aria-invalid": error ? true : undefined,
            disabled,
            id,
            name: field.name,
            value: values[field.name] ?? "",
          };

          if (field.kind === "textarea" || field.kind === "list") {
            return (
              <div key={field.name} className="grid gap-1.5">
                {label}
                <Textarea
                  {...common}
                  rows={field.kind === "list" ? 4 : 6}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
                {field.kind === "list" && (
                  <p className="text-xs text-muted-foreground">Ein Eintrag pro Zeile.</p>
                )}
                {errorText}
              </div>
            );
          }

          if (field.kind === "select") {
            return (
              <div key={field.name} className="grid gap-1.5">
                {label}
                <select
                  {...common}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) => onChange(field.name, event.target.value)}
                >
                  <option value="">Bitte wählen</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errorText}
              </div>
            );
          }

          const inputType =
            field.kind === "date" || field.kind === "time" || field.kind === "email" || field.kind === "tel" || field.kind === "url"
              ? field.kind
              : "text";
          const options = suggestions[field.name];

          return (
            <div key={field.name} className="grid gap-1.5">
              {label}
              <Input
                {...common}
                type={inputType}
                list={options ? `${id}-vorschlaege` : undefined}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
              {field.kind === "image" && (
                <p className="text-xs text-muted-foreground">
                  Pfad eines bereits hinterlegten Bildes, zum Beispiel /veranstaltungen/bild.jpg. Neue
                  Bilder richtet die Plattform-Administration ein.
                </p>
              )}
              {options && (
                <datalist id={`${id}-vorschlaege`}>
                  {options.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              )}
              {errorText}
            </div>
          );
        })}
    </div>
  );
}
