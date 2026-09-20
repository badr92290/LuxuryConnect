import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Recompresse les images statiques de `public/` avant la mise en ligne.
 *
 * Les captures produites par le navigateur sont bien plus lourdes que
 * nécessaire. Chaque image est ré-encodée dans son propre format — les
 * icônes doivent rester en PNG, c'est ce qu'attendent le manifeste web et
 * iOS — et une variante WebP est écrite à côté pour les pages qui savent la
 * proposer. Le script est idempotent : le relancer ne dégrade rien.
 */
const PUBLIC_DIR = path.resolve("public");
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} ko`;

async function optimise(file) {
  const ext = path.extname(file).toLowerCase();
  if (!RASTER.has(ext)) return null;

  const full = path.join(PUBLIC_DIR, file);
  const before = (await stat(full)).size;

  const output =
    ext === ".png"
      ? await sharp(full).png({ compressionLevel: 9, effort: 10, palette: true }).toBuffer()
      : await sharp(full).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();

  // On n'écrit que si l'on gagne réellement du poids.
  if (output.length < before) await writeFile(full, output);

  const webp = await sharp(full).webp({ quality: 80 }).toBuffer();
  await writeFile(full.replace(/\.(png|jpe?g)$/i, ".webp"), webp);

  return { file, before, after: Math.min(output.length, before), webp: webp.length };
}

const entries = await readdir(PUBLIC_DIR);
let saved = 0;
for (const entry of entries.sort()) {
  const result = await optimise(entry);
  if (!result) continue;
  saved += result.before - result.after;
  console.log(`${result.file}  ${kb(result.before)} → ${kb(result.after)} (webp ${kb(result.webp)})`);
}
console.log(`\nGain total : ${kb(Math.max(saved, 0))}`);
