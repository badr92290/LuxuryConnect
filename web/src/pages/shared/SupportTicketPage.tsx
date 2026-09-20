import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  SERVICE_LABELS,
  SUPPORT_REASON_LABELS,
  SUPPORT_STATUS_LABELS,
  SupportTicket,
  SupportTicketStatus,
} from "../../types";
import {
  BackLink,
  Badge,
  Button,
  Card,
  ErrorText,
  SectionLabel,
  Spinner,
} from "../../components/ui";
import { PhotoGallery } from "../../components/PhotoGallery";
import { SupportThread } from "../../components/SupportThread";

const TONE: Record<SupportTicketStatus, "primary" | "muted" | "success" | "danger"> = {
  OPEN: "primary",
  IN_PROGRESS: "primary",
  ESCALATED: "danger",
  RESOLVED: "success",
};

export default function SupportTicketPage({ basePath }: { basePath: string }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ ticket: SupportTicket }>(`/support/${ticketId}`);
      setTicket(data.ticket);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(path: "escalate" | "resolve", message: string) {
    setActing(true);
    setError(null);
    try {
      const data = await api.post<{ ticket: SupportTicket }>(`/support/${ticketId}/${path}`);
      setTicket(data.ticket);
      toast(message, "success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;
  if (!ticket) return <ErrorText>Dossier introuvable.</ErrorText>;

  const vehicle = ticket.booking.quoteRequest;
  const isClient = user?.id === ticket.clientId;
  const isPro = user?.id === ticket.professional.user.id;
  const closed = ticket.status === "RESOLVED";

  return (
    <div>
      <BackLink label="Retour au service après-vente" onClick={() => navigate(`${basePath}/sav`)} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl leading-tight tracking-tight text-ivory">
            {ticket.subject}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {SUPPORT_REASON_LABELS[ticket.reason]} · {SERVICE_LABELS[vehicle.serviceType]} ·{" "}
            {vehicle.vehicleMake} {vehicle.vehicleModel}
            {vehicle.vehicleYear ? ` (${vehicle.vehicleYear})` : ""}
          </p>
        </div>
        <Badge label={SUPPORT_STATUS_LABELS[ticket.status]} tone={TONE[ticket.status]} />
      </div>

      {/* Le contact direct est la particularité du SAV : on l'annonce. */}
      <Card className="mb-4">
        <SectionLabel>{isPro ? "Votre client" : "Votre interlocuteur"}</SectionLabel>
        {isPro ? (
          <>
            <p className="font-semibold text-ivory">
              {ticket.client.firstName} {ticket.client.lastName}
            </p>
            <p className="mt-1 text-sm text-muted">
              <a href={`mailto:${ticket.client.email}`} className="text-gold underline underline-offset-2">
                {ticket.client.email}
              </a>
              {ticket.client.phone && ` · ${ticket.client.phone}`}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-ivory">{ticket.professional.businessName}</p>
            <p className="mt-1 text-sm text-muted">
              {ticket.professional.address ?? ticket.professional.city}
              {ticket.professional.user.phone && (
                <>
                  {" · "}
                  <a
                    href={`tel:${ticket.professional.user.phone.replace(/\s/g, "")}`}
                    className="text-gold underline underline-offset-2"
                  >
                    {ticket.professional.user.phone}
                  </a>
                </>
              )}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-mutedDark">
              Pour le service après-vente, vous échangez directement avec l'atelier : c'est lui qui
              a réalisé la pose et qui la garantit. LuxuryConnect reste joignable si l'échange
              n'avance pas.
            </p>
          </>
        )}
      </Card>

      {ticket.photos.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Photos jointes</SectionLabel>
          <PhotoGallery photos={ticket.photos} label="Photos jointes au dossier" />
        </div>
      )}

      <Card>
        <SupportThread
          ticket={ticket}
          currentUserId={user!.id}
          onTicketChange={(next) => setTicket(next)}
        />
      </Card>

      {error && <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>}

      {!closed && (
        <div className="mt-5 flex flex-wrap gap-3">
          {!ticket.escalatedAt && (
            <Button
              variant="secondary"
              onClick={() => act("escalate", "L'assistance a été prévenue.")}
              disabled={acting}
            >
              Demander l'assistance LuxuryConnect
            </Button>
          )}
          {(isClient || user?.role === "ADMIN") && (
            <Button
              variant="secondary"
              onClick={() => act("resolve", "Dossier clos.")}
              disabled={acting}
            >
              {isClient ? "Mon problème est réglé" : "Clore le dossier"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
