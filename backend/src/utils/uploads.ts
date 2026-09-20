import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_BYTES = 6 * 1024 * 1024;
/** Au-delà, on ne gagne plus rien en qualité perçue sur une fiche ou une galerie. */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 78;

/**
 * Recompresse un buffer image et l'écrit sur le disque. Utilisé aussi par
 * l'import depuis le site d'un professionnel, où les photos arrivent en
 * pleine résolution depuis un serveur tiers.
 */
export async function saveImageBuffer(buffer: Buffer): Promise<string | null> {
  try {
    const optimised = await sharp(buffer)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();
    return writeBuffer(optimised, "jpg");
  } catch {
    return null;
  }
}

function writeBuffer(buffer: Buffer, extension: string): string {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  writeFileSync(path.join(UPLOAD_DIR, fileName), buffer);
  return `/uploads/${fileName}`;
}

function decode(dataUrl: string): { mimeType: string; buffer: Buffer } | null {
  const match = /^data:([\w/+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mimeType, base64] = match;
  if (!ACCEPTED_MIME.has(mimeType)) return null;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength > MAX_BYTES) return null;
  return { mimeType, buffer };
}

/**
 * Écrit une image envoyée en data URL et renvoie son chemin public.
 *
 * Le navigateur redimensionne déjà avant l'envoi, mais rien n'oblige un
 * client à le faire : on recompresse donc systématiquement ici, ce qui
 * borne le poids servi et retire au passage les métadonnées EXIF (dont la
 * géolocalisation de la photo). `rotate()` sans argument applique
 * l'orientation EXIF avant de la supprimer.
 *
 * Renvoie null si le format n'est pas une image supportée, si elle est trop
 * lourde, ou si le contenu n'est pas réellement une image.
 */
export async function saveDataUrlImage(dataUrl: string): Promise<string | null> {
  const decoded = decode(dataUrl);
  if (!decoded) return null;

  try {
    const optimised = await sharp(decoded.buffer)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toBuffer();
    return writeBuffer(optimised, "jpg");
  } catch {
    // Extension d'image valide mais contenu illisible : on refuse le fichier
    // plutôt que de servir un binaire arbitraire depuis notre domaine.
    return null;
  }
}
