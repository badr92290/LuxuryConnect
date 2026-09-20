import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  SERVICE_LABELS,
  SUPPORT_REASON_LABELS,
  SUPPORT_STATUS_LABELS,
  SupportTicket,
  SupportTicketStatus,
} from "../../types";
import { Badge, Card, EmptyState, Reveal, SkeletonList } from "../../components/ui";

const TONE: Record<SupportTicketStatus, "primary" | "muted" | "success" | "danger"> = {
  OPEN: "primary",
  IN_PROGRESS: "primary",
  ESCALATED: "danger",
  RESOLVED: "success",
};

export default function SupportListPage({ basePath }: { basePath: string }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api
      .get<{ tickets: SupportTicket[] }>("/support")
      .then((data) => setTickets(data.tickets))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonList />;

  const isClient = user?.role === "CLIENT";

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ivory">Service après-vente</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {isClient
          ? "Un souci après une prestation ? Ouvrez un dossier depuis la réservation concernée. Ici, vous échangez directement avec l'atelier qui a réalisé le travail — et nous intervenons si besoin."
          : "Les dossiers ouverts par vos clients après une prestation. Vous leur répondez directement."}
      </p>

      {tickets.length === 0 && (
        <EmptyState
          message={
            isClient
              ? "Aucun dossier ouvert. Tant mieux."
              : "Aucun dossier de service après-vente pour le moment."
          }
        />
      )}

      {isClient && tickets.length === 0 && (
        <p className="mt-2 text-center text-sm">
          <Link to={`${basePath}/bookings`} className="text-gold underline underline-offset-2">
            Voir mes réservations
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {tickets.map((ticket, i) => {
          const vehicle = ticket.booking.quoteRequest;
          const last = ticket.messages[0];
          return (
            <Reveal key={ticket.id} index={i}>
              <Card onClick={() => navigate(`${basePath}/sav/${ticket.id}`)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold text-ivory">{ticket.subject}</p>
                  <Badge label={SUPPORT_STATUS_LABELS[ticket.status]} tone={TONE[ticket.status]} />
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  {SUPPORT_REASON_LABELS[ticket.reason]} · {SERVICE_LABELS[vehicle.serviceType]} ·{" "}
                  {vehicle.vehicleMake} {vehicle.vehicleModel}
                </p>
                <p className="mt-1 text-xs text-mutedDark">
                  {isClient
                    ? ticket.professional.businessName
                    : `${ticket.client.firstName} ${ticket.client.lastName}`}
                </p>
                {last && !last.isSystem && (
                  <p className="mt-3 line-clamp-2 text-sm text-ivory/80">« {last.content} »</p>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
