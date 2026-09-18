import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Booking } from "../../types";
import { Badge, Button, Card, EmptyState, Spinner } from "../../components/ui";

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[] }>("/bookings");
      setBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Mes réservations</h1>
      {bookings.length === 0 && <EmptyState message="Aucune réservation pour le moment." />}
      <div className="flex flex-col gap-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{b.professional?.businessName}</p>
              <Badge label={STATUS_LABELS[b.status]} />
            </div>
            <p className="mt-1 text-sm text-muted">
              Rendez-vous le {new Date(b.scheduledAt).toLocaleDateString("fr-FR")} · {b.price} €
            </p>
            {b.status === "COMPLETED" && !b.review && (
              <Button variant="secondary" className="mt-3" onClick={() => navigate(`/app/bookings/${b.id}/review`)}>
                Laisser un avis
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
