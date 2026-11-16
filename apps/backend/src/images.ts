/**
 * Event pictures uploaded from the admin area. They are stored in S3 and
 * served through CloudFront on `bildBaseUrl`, so they are online as soon as
 * the upload finishes - no commit, no site deploy.
 */
import { randomBytes } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { bildBaseUrl, slugify } from "../../../src/shared/content-schema";

/** Decoded size limit. The admin UI shrinks pictures well below this before uploading. */
export const maxImageBytes = 3 * 1024 * 1024;

export type ImageType = { extension: "jpg" | "png" | "webp" | "avif"; mimeType: string };

/** Where uploaded pictures go; S3 in production, a fake in tests. */
export type ImageStore = {
  put(input: { key: string; body: Buffer; contentType: string; metadata: Record<string, string> }): Promise<void>;
};

/** Detects the image format from the file's magic bytes - the file name and declared type are not trusted. */
export function detectImageType(data: Buffer): ImageType | undefined {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: "png", mimeType: "image/png" };
  }
  if (data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") {
    return { extension: "webp", mimeType: "image/webp" };
  }
  if (data.length >= 12 && data.toString("ascii", 4, 8) === "ftyp") {
    const brand = data.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") {
      return { extension: "avif", mimeType: "image/avif" };
    }
  }
  return undefined;
}

/**
 * Object key for a new picture: club id, a slug of the original file name and
 * a random suffix, so an upload never replaces an existing picture.
 */
export function imageKey(vereinId: string, dateiname: string, type: ImageType): string {
  const stem = slugify(dateiname.replace(/\.[^.]*$/, ""), 40) || "bild";
  const suffix = randomBytes(4).toString("hex");
  return `veranstaltungen/${vereinId}-${stem}-${suffix}.${type.extension}`;
}

/** Public URL of an uploaded picture, as stored in the `bild` field. */
export function imageUrl(key: string): string {
  return `${bildBaseUrl}/${key}`;
}

/** Strict base64 decoding: rejects anything that is not plain base64 (an optional data-URL prefix is allowed). */
export function decodeBase64(value: string): Buffer | undefined {
  const raw = value.replace(/^data:[^;,]+;base64,/, "").replace(/\s/g, "");
  if (!raw || raw.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
    return undefined;
  }
  return Buffer.from(raw, "base64");
}

export function s3ImageStoreFromEnv(): ImageStore | undefined {
  const bucket = process.env.IMAGE_BUCKET_NAME;
  if (!bucket) return undefined;
  const s3 = new S3Client({});
  return {
    async put({ key, body, contentType, metadata }) {
      await s3.send(
        new PutObjectCommand({
          Body: body,
          Bucket: bucket,
          // Keys are unique and never overwritten, so browsers and CloudFront may cache forever.
          CacheControl: "public, max-age=31536000, immutable",
          ContentType: contentType,
          Key: key,
          Metadata: metadata,
        }),
      );
    },
  };
}
