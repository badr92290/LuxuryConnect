import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { SERVICE_LABELS, ServiceType } from "../types";
import { StarRating } from "./ui";

export type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: string;
  serviceType: ServiceType;
  vehicle: string;
  city: string | null;
};

type PublicReviews = {
  summary: { average: number | null; count: number };
  reviews: PublicReview[];
};

/**
 * Vitrine des avis clients. Tant qu'aucun avis n'est publié, la section
 * disparaît entièrement plutôt que d'afficher une note vide.
 */
export function ClientReviews({ limit = 6 }: { limit?: number }) {
  const [data, setData] = useState<PublicReviews | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PublicReviews>(`/reviews/public?limit=${limit}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ summary: { average: null, count: 0 }, reviews: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  if (!data || data.reviews.length === 0) return null;

  const { average, count } = data.summary;

  return (
    <section className="mt-20 md:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="font-display text-3xl tracking-tight text-ivory md:text-4xl">
            Ce qu'en disent nos clients
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Chaque avis provient d'une prestation réellement réalisée via LuxuryConnect.
          </p>
        </div>

        {average !== null && (
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl text-ivory">
              {average.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
            </span>
            <span className="text-sm text-mutedDark">/ 5</span>
            <StarRating rating={average} />
            <span className="text-[11px] uppercase tracking-wider2 text-muted">
              {count} avis vérifié{count > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {data.reviews.map((review, i) => (
          <li
            key={review.id}
            className="flex animate-fade-in-up flex-col rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-sm transition-colors hover:border-gold/30"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <StarRating rating={review.rating} />
            <blockquote className="mt-4 flex-1 font-display text-lg italic leading-relaxed text-ivory">
              « {review.comment} »
            </blockquote>
            <footer className="mt-6">
              <p className="text-sm font-semibold text-ivory">{review.author}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider2 text-mutedDark">
                {SERVICE_LABELS[review.serviceType]}
                {review.vehicle ? ` · ${review.vehicle}` : ""}
                {review.city ? ` · ${review.city}` : ""}
              </p>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
