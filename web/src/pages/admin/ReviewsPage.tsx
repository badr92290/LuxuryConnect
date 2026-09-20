import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { SERVICE_LABELS, ServiceType } from "../../types";
import { Badge, Button, Card, EmptyState, SkeletonList, StarRating } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  published: boolean;
  createdAt: string;
  client: { firstName: string; lastName: string | null; email: string };
  professional: { businessName: string };
  booking: {
    price: number;
    quoteRequest: {
      serviceType: ServiceType;
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear: number | null;
    };
  };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get<{ reviews: AdminReview[] }>("/admin/reviews")
      .then((data) => setReviews(data.reviews))
      .finally(() => setLoading(false));
  }, []);

  async function togglePublished(review: AdminReview) {
    setBusyId(review.id);
    try {
      await api.patch(`/admin/reviews/${review.id}`, { published: !review.published });
      setReviews((list) =>
        list.map((r) => (r.id === review.id ? { ...r, published: !r.published } : r)),
      );
      toast(review.published ? "Avis retiré de la vitrine" : "Avis publié sur le site", "success");
    } catch {
      toast("Impossible de modifier cet avis", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <SkeletonList />;

  const publishedCount = reviews.filter((r) => r.published).length;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ivory">Avis clients</h1>
      <p className="mb-6 mt-2 text-sm text-muted">
        {publishedCount} avis affiché{publishedCount > 1 ? "s" : ""} sur la page d'accueil du site
        et de l'application, sur {reviews.length} au total.
      </p>

      {reviews.length === 0 && <EmptyState message="Aucun avis pour le moment." />}

      <div className="flex flex-col gap-3">
        {reviews.map((review) => {
          const request = review.booking.quoteRequest;
          return (
            <Card key={review.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <p className="font-semibold text-ivory">
                      {review.client.firstName} {review.client.lastName}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {SERVICE_LABELS[request.serviceType]} · {request.vehicleMake}{" "}
                    {request.vehicleModel} {request.vehicleYear ?? ""} · {review.professional.businessName}
                  </p>
                </div>
                <Badge
                  label={review.published ? "Publié" : "Masqué"}
                  tone={review.published ? "success" : "muted"}
                />
              </div>

              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-ivory/90">« {review.comment} »</p>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-mutedDark">
                  {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => togglePublished(review)}
                  disabled={busyId === review.id}
                >
                  {review.published ? "Retirer de la vitrine" : "Publier sur le site"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
