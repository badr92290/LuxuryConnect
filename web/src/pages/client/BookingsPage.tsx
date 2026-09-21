import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Booking, ClientPayment, formatAmount, PAYMENT_STATUS_LABELS } from "../../types";
import { Badge, Button, Card, EmptyState, SkeletonList } from "../../components/ui";

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  // État de paiement par réservation, chargé en parallèle des réservations.
  const [payments, setPayments] = useState<Record<string, ClientPayment | null>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[] }>("/bookings");
      setBookings(data.bookings);

      const states = await Promise.all(
        data.bookings.map((b) =>
          api
            .get<{ payment: ClientPayment | null }>(`/payments/bookings/${b.id}`)
            .then((r) => [b.id, r.payment] as const)
            .catch(() => [b.id, null] as const),
        ),
      );
      setPayments(Object.fromEntries(states));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <SkeletonList />;

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
              Rendez-vous le {new Date(b.scheduledAt).toLocaleDateString("fr-FR")} ·{" "}
              {formatAmount(Math.round(b.price * 100))}
            </p>

            {payments[b.id] && payments[b.id]!.status === "PAID" ? (
              <p className="mt-2 text-sm text-success">
                {PAYMENT_STATUS_LABELS.PAID}
                {payments[b.id]!.paymentMethodLabel
                  ? ` · ${payments[b.id]!.paymentMethodLabel}`
                  : ""}
              </p>
            ) : (
              b.status !== "CANCELLED" && (
                <div className="mt-4">
                  <Button onClick={() => navigate(`/app/bookings/${b.id}/paiement`)}>
                    Régler {formatAmount(Math.round(b.price * 100))}
                  </Button>
                  <p className="mt-2 text-xs text-mutedDark">
                    Carte bancaire, Apple Pay ou Google Pay
                  </p>
                </div>
              )
            )}
            {b.status === "COMPLETED" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!b.review && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/app/bookings/${b.id}/review`)}
                  >
                    Laisser un avis
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigate(`/app/bookings/${b.id}/sav`)}>
                  Un souci ? Ouvrir un dossier SAV
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
