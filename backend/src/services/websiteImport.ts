import { prisma } from "../prisma";
import { saveImageBuffer } from "../utils/uploads";

const MAX_IMAGES = 6;
const FETCH_TIMEOUT_MS = 15000;
const MIN_BYTES = 25 * 1024; // en dessous, c'est presque toujours un logo ou une icône
const MAX_BYTES = 8 * 1024 * 1024;

// Noms de fichiers qui ne sont presque jamais une photo de réalisation.
const EXCLUDED_NAME = /logo|icon|favicon|sprite|placeholder|avatar|badge|pixel|banner|header|footer|thumb/i;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Récupère les URL d'images candidates dans le HTML d'une page. */
function extractImageUrls(html: string, baseUrl: string): string[] {
  const candidates: string[] = [];

  const push = (raw?: string) => {
    if (!raw) return;
    const cleaned = raw.trim().split(/\s+/)[0];
    if (!cleaned || cleaned.startsWith("data:")) return;
    try {
      candidates.push(new URL(cleaned, baseUrl).toString());
    } catch {
      // URL inexploitable : on ignore
    }
  };

  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) {
    push(m[1]);
  }
  for (const m of html.matchAll(/<img[^>]+>/gi)) {
    const tag = m[0];
    push(/\bsrc=["']([^"']+)["']/i.exec(tag)?.[1]);
    push(/\bdata-src=["']([^"']+)["']/i.exec(tag)?.[1]);
    push(/\bdata-lazy-src=["']([^"']+)["']/i.exec(tag)?.[1]);

    // Dans un srcset, la dernière entrée est la plus grande définition.
    const srcset = /\bsrcset=["']([^"']+)["']/i.exec(tag)?.[1];
    if (srcset) {
      const entries = srcset.split(",").map((s) => s.trim()).filter(Boolean);
      push(entries[entries.length - 1]);
    }
  }
  for (const m of html.matchAll(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/gi)) {
    push(m[2]);
  }

  const usable = candidates.filter((url) => {
    const withoutQuery = url.split("?")[0];
    if (/\.(svg|gif|ico|bmp)$/i.test(withoutQuery)) return false;
    return !EXCLUDED_NAME.test(withoutQuery.split("/").pop() ?? "");
  });

  // Une même photo revient souvent en plusieurs tailles (srcset, miniatures) :
  // on n'en garde qu'une, la plus grande.
  const byIdentity = new Map<string, string>();
  for (const url of usable) {
    const identity = imageIdentity(url);
    const current = byIdentity.get(identity);
    if (!current || sizeHint(url) > sizeHint(current)) byIdentity.set(identity, url);
  }
  return Array.from(byIdentity.values());
}

/** Nom de fichier débarrassé des marqueurs de résolution, pour repérer les doublons. */
function imageIdentity(url: string): string {
  const fileName = (url.split("?")[0].split("/").pop() ?? url).toLowerCase();
  return fileName
    .replace(/^\d+px-/, "")
    .replace(/[-_@](\d{2,4}x\d{2,4}|\d{2,4}w|\d(?:\.\d)?x)(?=\.[a-z]+$)/, "")
    .replace(/[-_]scaled(?=\.[a-z]+$)/, "");
}

/** Plus grand nombre de pixels annoncé dans l'URL, pour choisir la meilleure variante. */
function sizeHint(url: string): number {
  const numbers = (url.match(/\d{2,4}/g) ?? []).map(Number);
  return numbers.length ? Math.max(...numbers) : 0;
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; extension: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LuxuryConnectBot/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const extension = ALLOWED_TYPES[contentType];
    if (!extension) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < MIN_BYTES || buffer.byteLength > MAX_BYTES) return null;

    return { buffer, extension };
  } catch {
    return null;
  }
}

export interface ImportResult {
  imported: number;
  scanned: number;
  error?: string;
}

/**
 * Récupère jusqu'à six photos de réalisations depuis le site du professionnel
 * et les ajoute à son portfolio. Best effort : un site qui bloque les robots ou
 * qui charge ses images en JavaScript peut ne rien donner, d'où l'ajout manuel.
 */
export async function importPortfolioFromWebsite(professionalId: string): Promise<ImportResult> {
  const profile = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { id: true, websiteUrl: true, websiteRightsConfirmed: true },
  });

  if (!profile?.websiteUrl) return { imported: 0, scanned: 0, error: "Aucun site renseigné" };
  if (!profile.websiteRightsConfirmed) {
    return { imported: 0, scanned: 0, error: "Droits sur les images non confirmés" };
  }

  const url = normalizeWebsiteUrl(profile.websiteUrl);
  if (!url) return { imported: 0, scanned: 0, error: "Adresse de site invalide" };

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LuxuryConnectBot/1.0)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { imported: 0, scanned: 0, error: `Le site a répondu ${res.status}` };
    html = await res.text();
  } catch {
    return { imported: 0, scanned: 0, error: "Site injoignable" };
  }

  const candidates = extractImageUrls(html, url);

  const existing = await prisma.portfolioImage.findMany({
    where: { professionalId, sourceUrl: { not: null } },
    select: { sourceUrl: true },
  });
  const alreadyImported = new Set(existing.map((e) => e.sourceUrl));

  let imported = 0;

  for (const candidate of candidates) {
    if (imported >= MAX_IMAGES) break;
    if (alreadyImported.has(candidate)) continue;

    const downloaded = await downloadImage(candidate);
    if (!downloaded) continue;

    // Les photos d'un site tiers arrivent en pleine résolution : on les
    // recompresse avant de les servir depuis notre domaine.
    const storedUrl = await saveImageBuffer(downloaded.buffer);
    if (!storedUrl) continue;

    await prisma.portfolioImage.create({
      data: {
        professionalId,
        imageUrl: storedUrl,
        sourceUrl: candidate,
        caption: "Réalisation",
      },
    });
    imported++;
  }

  await prisma.professionalProfile.update({
    where: { id: professionalId },
    data: { websiteImportedAt: new Date() },
  });

  return { imported, scanned: candidates.length };
}
