import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { QuoteRequest, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { BackLink, Badge, Button, Card, ErrorText, Input, SectionLabel, Spinner } from "../../components/ui";
import { PhotoGallery } from "../../components/PhotoGallery";
import { TrustBadges } from "../../components/TrustBadges";
import { useToast } from "../../context/ToastContext";

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast("Offre acceptée, votre réservation est confirmée");
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
      toast("Offre refusée", "info");
    } finally {
      setActing(false);
    }
  }

  async function openConversation() {
    const data = await api.post<{ conversation: { id: string } }>("/conversations", {});
    navigate(`/app/messages/${data.conversation.id}`);
  }

  if (loading || !quoteRequest) return <Spinner />;

  const pro = quoteRequest.selectedProfessional;
  const portfolio = pro?.portfolioImages ?? [];
  // On met en avant les avant/après quand il y en a, sinon le reste du portfolio.
  const beforeAfter = portfolio.filter((img) => img.isBeforeAfter);
  const showcase = beforeAfter.length > 0 ? beforeAfter : portfolio;

  return (
    <div className="mx-auto max-w-lg">
      <BackLink label="Retour à mes demandes" onClick={() => navigate("/app/requests")} />

      <Card>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-ivory tracking-tight">{SERVICE_LABELS[quoteRequest.serviceType]}</h1>
          <Badge label={QUOTE_REQUEST_STATUS_LABELS[quoteRequest.status]} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
          {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""}
        </p>
        {quoteRequest.city && <p className="text-sm text-muted">{quoteRequest.city}</p>}
        {quoteRequest.description && <p className="mt-3 text-sm">{quoteRequest.description}</p>}
        {quoteRequest.photos && quoteRequest.photos.length > 0 && (
          <div className="mt-4">
            <PhotoGallery photos={quoteRequest.photos} />
          </div>
        )}
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
        <Card glass className="mt-4 border-gold/30">
          <h2 className="mb-2 font-semibold text-gold">Offre reçue</h2>
          <p className="font-display text-3xl tracking-tight text-ivory">{quoteRequest.finalPrice} €</p>
          {quoteRequest.finalMessage && <p className="mt-2 text-sm text-muted">{quoteRequest.finalMessage}</p>}

          {pro && (
            <div className="mt-4 border-t border-hairline pt-4">
              <SectionLabel>Prestataire retenu</SectionLabel>
              <p className="font-semibold text-ivory">{pro.businessName}</p>
              {pro.city && <p className="mt-0.5 text-sm text-muted">{pro.city}</p>}
              <div className="mt-2">
                <TrustBadges
                  isInsured={pro.isInsured}
                  isCertified={pro.isCertified}
                  yearsExperience={pro.yearsExperience}
                />
              </div>
              {showcase.length > 0 && (
                <div className="mt-4">
                  <SectionLabel>
                    {beforeAfter.length > 0 ? "Ses réalisations avant / après" : "Ses réalisations"}
                  </SectionLabel>
                  <PhotoGallery photos={showcase} />
                </div>
              )}
            </div>
          )}

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
