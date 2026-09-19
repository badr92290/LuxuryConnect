import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Booking } from "../../types";
import { Badge, Card, EmptyState, SkeletonList } from "../../components/ui";

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ bookings: Booking[] }>("/admin/bookings")
      .then((data) => setBookings(data.bookings))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonList />;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Toutes les réservations</h1>
      {bookings.length === 0 && <EmptyState message="Aucune réservation pour le moment." />}
      <div className="flex flex-col gap-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {b.client?.firstName} {b.client?.lastName} → {b.professional?.businessName}
              </p>
              <Badge label={STATUS_LABELS[b.status]} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {new Date(b.scheduledAt).toLocaleDateString("fr-FR")} · {b.price} €
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
