import type { Veranstaltung } from "@/shared/content-schema";
import { cn } from "@/lib/utils";

/**
 * Aspect ratio every event picture is cropped to - landscape, 3 wide by 2 high.
 * Shared with the date placeholder that stands in for events without a picture,
 * so the cards in a grid line up whether or not they have one.
 */
export const bildFormat = "aspect-[3/2]";

interface Props {
  veranstaltung: Pick<Veranstaltung, "bild" | "bildAlt" | "titel">;
  /** Sizing for the call site - the aspect ratio is fixed. */
  className?: string;
}

/**
 * Landscape picture of an event. Renders nothing when the event has no `bild`,
 * so call sites can drop it into a layout without guarding themselves.
 */
export default function VeranstaltungsBild({ veranstaltung, className }: Props) {
  if (!veranstaltung.bild) return null;

  return (
    <img
      src={veranstaltung.bild}
      alt={veranstaltung.bildAlt ?? veranstaltung.titel}
      className={cn("w-full object-cover", bildFormat, className)}
      loading="lazy"
    />
  );
}
