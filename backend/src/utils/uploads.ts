import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Écrit une image envoyée en data URL sur le disque et renvoie son chemin public.
 * Renvoie null si le format n'est pas une image supportée ou si elle est trop lourde.
 */
export function saveDataUrlImage(dataUrl: string): string | null {
  const match = /^data:([\w/+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const [, mimeType, base64] = match;
  const extension = EXTENSIONS[mimeType];
  if (!extension) return null;

  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > MAX_BYTES) return null;

  mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  writeFileSync(path.join(UPLOAD_DIR, fileName), buffer);

  return `/uploads/${fileName}`;
}
