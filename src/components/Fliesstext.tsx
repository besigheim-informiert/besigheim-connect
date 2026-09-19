import { textSegmente } from "@/lib/text";

interface Props {
  text: string;
  className?: string;
}

/**
 * A plain-text description with its URLs and mail addresses turned into links.
 * Line breaks are preserved, so the paragraph structure of the JSON survives.
 */
export default function Fliesstext({ text, className }: Props) {
  return (
    <div className={className}>
      {textSegmente(text).map((segment, i) =>
        segment.href ? (
          <a
            key={i}
            href={segment.href}
            {...(segment.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-primary underline underline-offset-2 hover:no-underline break-all"
          >
            {segment.text}
          </a>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </div>
  );
}
