import React, { useRef, useState } from "react";
import { IconCamera, IconX } from "./icons";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Redimensionne et recompresse une image côté navigateur pour alléger l'envoi. */
async function toCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function PhotoPicker({
  photos,
  onChange,
  max = 6,
  label = "Photos du véhicule",
  hint,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, max - photos.length);
    if (files.length === 0) return;

    setBusy(true);
    try {
      const encoded = await Promise.all(files.map(toCompressedDataUrl));
      onChange([...photos, ...encoded]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mb-4">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider2 text-muted">
        {label}
      </span>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-hairline">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, index) => index !== i))}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted backdrop-blur transition-colors hover:text-danger"
              aria-label="Retirer la photo"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-mutedDark transition-colors hover:border-gold/50 hover:text-gold disabled:opacity-50"
          >
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <IconCamera className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-mutedDark">
        {hint ?? `${photos.length}/${max} photos — elles aident à obtenir un devis précis.`}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
