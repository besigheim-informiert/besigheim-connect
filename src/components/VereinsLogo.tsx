import { cn } from "@/lib/utils";
import type { Verein } from "@/shared/content-schema";

type Props = {
  verein: Pick<Verein, "logo" | "name">;
  className?: string;
  /** "eager" for a logo at the top of the page; lists keep the default lazy loading. */
  loading?: "eager" | "lazy";
};

/**
 * Club logo in a white, rounded box. Logos come in every shape, so the picture
 * is fitted (not cropped) into the box. Renders nothing when the club has no logo.
 */
export default function VereinsLogo({ verein, className, loading = "lazy" }: Props) {
  if (!verein.logo) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-foreground/10 bg-white p-1.5",
        className,
      )}
    >
      <img
        src={verein.logo}
        alt={`Logo von ${verein.name}`}
        loading={loading}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
