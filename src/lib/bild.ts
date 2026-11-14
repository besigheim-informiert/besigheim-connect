/**
 * Prepares a picture for upload in the browser: decodes it, scales it down so
 * the longer side is at most `maxKante` pixels and re-encodes it as JPEG.
 * Phone photos are often 5-10 MB; after this they are a few hundred KB, which
 * keeps the repository small and stays well below the API's size limit.
 */
export const erlaubteBildtypen = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Largest file accepted before shrinking - larger files are most likely not photos. */
export const maxEingabeBytes = 25 * 1024 * 1024;
/** Must match the backend limit (`maxImageBytes`). */
export const maxUploadBytes = 3 * 1024 * 1024;

export class BildFehler extends Error {}

export function pruefeBilddatei(datei: File): void {
  if (!(erlaubteBildtypen as readonly string[]).includes(datei.type)) {
    throw new BildFehler("Bitte wählen Sie ein Bild im Format JPEG, PNG, WebP oder AVIF.");
  }
  if (datei.size > maxEingabeBytes) {
    throw new BildFehler("Das Bild ist zu groß. Bitte wählen Sie eine Datei unter 25 MB.");
  }
}

export type VorbereitetesBild = {
  dateiname: string;
  /** base64 without data-URL prefix */
  daten: string;
};

export async function bereiteBildVor(datei: File, maxKante = 1600): Promise<VorbereitetesBild> {
  pruefeBilddatei(datei);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(datei);
  } catch {
    throw new BildFehler("Das Bild konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.");
  }

  const faktor = Math.min(1, maxKante / Math.max(bitmap.width, bitmap.height));
  const breite = Math.max(1, Math.round(bitmap.width * faktor));
  const hoehe = Math.max(1, Math.round(bitmap.height * faktor));

  const canvas = document.createElement("canvas");
  canvas.width = breite;
  canvas.height = hoehe;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new BildFehler("Ihr Browser kann das Bild nicht verarbeiten.");
  }
  // JPEG has no transparency: put transparent PNGs on white instead of black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, breite, hoehe);
  context.drawImage(bitmap, 0, 0, breite, hoehe);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) {
    throw new BildFehler("Das Bild konnte nicht umgewandelt werden.");
  }
  if (blob.size > maxUploadBytes) {
    throw new BildFehler("Das Bild ist auch verkleinert noch zu groß. Bitte wählen Sie ein anderes Bild.");
  }

  return {
    dateiname: `${datei.name.replace(/\.[^.]*$/, "") || "bild"}.jpg`,
    daten: await blobZuBase64(blob),
  };
}

async function blobZuBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binaer = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binaer += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binaer);
}
