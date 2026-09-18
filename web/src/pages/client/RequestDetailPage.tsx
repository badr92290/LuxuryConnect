import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { QuoteRequest, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { Badge, Button, Card, ErrorText, Input, Spinner } from "../../components/ui";

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    const data = await api.get<{ quoteRequest: QuoteRequest }>(`/quote-requests/${requestId}`);
    setQuoteRequest(data.quoteRequest);
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  async function acceptOffer() {
    if (!scheduledAt) {
      setError("Merci de choisir une date de rendez-vous souhaitée.");
      return;
    }
    setError(null);
    setActing(true);
    try {
      await api.post(`/quote-requests/${requestId}/accept`, {
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'accepter l'offre");
    } finally {
      setActing(false);
    }
  }

  async function declineOffer() {
    setActing(true);
    try {
      await api.post(`/quote-requests/${requestId}/decline`);
      await load();
    } finally {
      setActing(false);
    }
  }

  async function openConversation() {
    const data = await api.post<{ conversation: { id: string } }>("/conversations", {});
    navigate(`/app/messages/${data.conversation.id}`);
  }

  if (loading || !quoteRequest) return <Spinner />;

  return (
    <div className="mx-auto max-w-lg">
      <button onClick={() => navigate("/app/requests")} className="mb-4 text-sm text-muted">
        ← Retour à mes demandes
      </button>

      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{SERVICE_LABELS[quoteRequest.serviceType]}</h1>
          <Badge label={QUOTE_REQUEST_STATUS_LABELS[quoteRequest.status]} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
          {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""}
        </p>
        {quoteRequest.city && <p className="text-sm text-muted">{quoteRequest.city}</p>}
        {quoteRequest.description && <p className="mt-3 text-sm">{quoteRequest.description}</p>}
      </Card>

      {(quoteRequest.status === "PENDING_REVIEW" || quoteRequest.status === "FORWARDED" || quoteRequest.status === "QUOTED") && (
        <Card className="mt-4">
          <p className="text-sm text-muted">
            Votre demande est en cours de traitement par notre équipe. Nous consultons les professionnels
            adaptés et revenons vers vous rapidement avec une offre.
          </p>
        </Card>
      )}

      {quoteRequest.status === "FINALIZED" && (
        <Card className="mt-4">
          <h2 className="mb-2 font-semibold text-primary">Offre reçue</h2>
          <p className="text-2xl font-bold">{quoteRequest.finalPrice} €</p>
          {quoteRequest.finalMessage && <p className="mt-2 text-sm text-muted">{quoteRequest.finalMessage}</p>}

          <div className="mt-4">
            <Input
              label="Date de rendez-vous souhaitée"
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex gap-3">
            <Button onClick={acceptOffer} loading={acting}>
              Accepter l'offre
            </Button>
            <Button variant="secondary" onClick={declineOffer} disabled={acting}>
              Refuser
            </Button>
          </div>
        </Card>
      )}

      {(quoteRequest.status === "ACCEPTED" || quoteRequest.booking) && quoteRequest.booking && (
        <Card className="mt-4">
          <h2 className="mb-2 font-semibold text-success">Réservation confirmée</h2>
          <p className="text-sm text-muted">
            Prestataire : {quoteRequest.selectedProfessional?.businessName ?? "à confirmer"}
          </p>
          <p className="text-sm text-muted">
            Rendez-vous le {new Date(quoteRequest.booking.scheduledAt).toLocaleDateString("fr-FR")}
          </p>
          <p className="mt-1 text-sm font-semibold">{quoteRequest.booking.price} €</p>
        </Card>
      )}

      {quoteRequest.status === "DECLINED" && (
        <Card className="mt-4">
          <p className="text-sm text-muted">Cette demande a été refusée.</p>
        </Card>
      )}

      <Button variant="secondary" full className="mt-6" onClick={openConversation}>
        Contacter notre équipe
      </Button>
    </div>
  );
}
