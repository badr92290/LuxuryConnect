import React, { useState } from "react";
import { fileUrl } from "../api/client";
import { IconX } from "./icons";

/**
 * Galerie de photos. `label` décrit ce que montrent les images (« Photos de la
 * demande », « Réalisations d'Auto Shine Lyon ») : sans lui, un lecteur d'écran
 * n'annoncerait que « bouton », ce qui n'aide personne.
 */
export function PhotoGallery({
  photos,
  label = "Photos jointes",
}: {
  photos: { id: string; imageUrl: string; caption?: string | null }[];
  label?: string;
}) {
  const [zoomed, setZoomed] = useState<{ url: string; alt: string } | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <ul aria-label={label} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, index) => {
          const alt = photo.caption?.trim() || `${label} — image ${index + 1} sur ${photos.length}`;
          return (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => setZoomed({ url: fileUrl(photo.imageUrl), alt })}
                aria-label={`Agrandir : ${alt}`}
                className="block aspect-square w-full overflow-hidden rounded-xl border border-hairline transition-all duration-200 hover:border-gold/50 hover:shadow-gold"
              >
                <img
                  src={fileUrl(photo.imageUrl)}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.alt}
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
          onClick={() => setZoomed(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ivory"
            aria-label="Fermer"
          >
            <IconX className="h-6 w-6" />
          </button>
          <img
            src={zoomed.url}
            alt={zoomed.alt}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}
