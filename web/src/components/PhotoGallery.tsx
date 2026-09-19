import React, { useState } from "react";
import { fileUrl } from "../api/client";
import { IconX } from "./icons";

export function PhotoGallery({ photos }: { photos: { id: string; imageUrl: string }[] }) {
  const [zoomed, setZoomed] = useState<string | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setZoomed(fileUrl(photo.imageUrl))}
            className="aspect-square overflow-hidden rounded-xl border border-hairline transition-all duration-200 hover:border-gold/50 hover:shadow-gold"
          >
            <img
              src={fileUrl(photo.imageUrl)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-background/90 p-6 backdrop-blur-sm"
          onClick={() => setZoomed(null)}
        >
          <button
            className="absolute right-6 top-6 text-muted transition-colors hover:text-ivory"
            aria-label="Fermer"
          >
            <IconX className="h-6 w-6" />
          </button>
          <img src={zoomed} alt="" className="max-h-full max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  );
}
