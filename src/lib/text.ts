/** A chunk of free text: plain prose, or a URL / mail address to be linked. */
export interface TextSegment {
  text: string;
  /** Set for linkable segments - an absolute http(s) URL or a `mailto:` href. */
  href?: string;
}

/**
 * URLs and mail addresses inside free text. Descriptions are authored as plain
 * text in the content JSON, so links are recognised by pattern, not by markup.
 */
const linkMuster = /(https?:\/\/\S+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Punctuation that ends the surrounding sentence rather than the link itself. */
const satzzeichenAmEnde = /[.,;:!?)\]"']+$/;

/**
 * Split free text into prose and linkable parts, so a description can be
 * rendered with clickable links while staying plain text in the JSON.
 */
export function textSegmente(text: string): TextSegment[] {
  const segmente: TextSegment[] = [];
  let position = 0;

  for (const treffer of text.matchAll(linkMuster)) {
    const start = treffer.index;
    let roh = treffer[0];

    // "... unter https://example.de/seite." - the dot belongs to the sentence.
    const schwanz = roh.match(satzzeichenAmEnde)?.[0] ?? "";
    if (schwanz) roh = roh.slice(0, -schwanz.length);
    if (!roh) continue;

    if (start > position) segmente.push({ text: text.slice(position, start) });
    segmente.push({
      text: roh,
      href: roh.startsWith("http") ? roh : `mailto:${roh}`,
    });
    position = start + roh.length;
  }

  if (position < text.length) segmente.push({ text: text.slice(position) });
  return segmente;
}
