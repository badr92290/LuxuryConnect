import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import { Booking } from "../../types";
import { Badge, Button, Card, EmptyState, SkeletonList } from "../../components/ui";

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function ProBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  async function markCompleted(id: string) {
    setUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}`, { status: "COMPLETED" });
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <SkeletonList />;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Réservations</h1>
      {bookings.length === 0 && <EmptyState message="Aucune réservation pour le moment." />}
      <div className="flex flex-col gap-3">
        {bookings.map((b) => (
          <Card key={b.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {b.client?.firstName} {b.client?.lastName}
              </p>
              <Badge label={STATUS_LABELS[b.status]} />
            </div>
            <p className="mt-1 text-sm text-muted">
              Rendez-vous le {new Date(b.scheduledAt).toLocaleDateString("fr-FR")}
            </p>
            {b.status === "CONFIRMED" && (
              <Button variant="secondary" className="mt-3" onClick={() => markCompleted(b.id)} loading={updatingId === b.id}>
                Marquer comme terminée
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
