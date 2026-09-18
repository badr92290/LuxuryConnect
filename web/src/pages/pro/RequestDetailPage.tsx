import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { QuoteRequest, SERVICE_LABELS } from "../../types";
import { Badge, Button, Card, ErrorText, Input, Spinner, Textarea } from "../../components/ui";

export default function ProRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    const data = await api.get<{ quoteRequest: QuoteRequest }>(`/quote-requests/${requestId}`);
    setQuoteRequest(data.quoteRequest);
    if (data.quoteRequest.myQuote) {
      setPrice(String(data.quoteRequest.myQuote.price));
      setMessage(data.quoteRequest.myQuote.message ?? "");
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitQuote() {
    setError(null);
    if (!price) {
      setError("Merci d'indiquer un prix.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/quote-requests/${requestId}/quotes`, {
        price: parseFloat(price),
        message: message || undefined,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le devis");
    } finally {
      setSubmitting(false);
    }
  }

  async function openConversation() {
    const data = await api.post<{ conversation: { id: string } }>("/conversations", {});
    navigate(`/pro/messages/${data.conversation.id}`);
  }

  if (loading || !quoteRequest) return <Spinner />;

  return (
    <div className="mx-auto max-w-lg">
      <button onClick={() => navigate("/pro/requests")} className="mb-4 text-sm text-muted">
        ← Retour aux demandes
      </button>

      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{SERVICE_LABELS[quoteRequest.serviceType]}</h1>
          <Badge label={quoteRequest.forwardStatus === "QUOTED" ? "Devis envoyé" : "À traiter"} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
          {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""}
        </p>
        {quoteRequest.city && <p className="text-sm text-muted">{quoteRequest.city}</p>}
        {quoteRequest.description && <p className="mt-3 text-sm">{quoteRequest.description}</p>}
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold">{quoteRequest.myQuote ? "Modifier mon devis" : "Proposer un devis"}</h2>
        <Input label="Prix (€)" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="890" inputMode="decimal" />
        <Textarea
          label="Message (optionnel)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
        {error && <ErrorText>{error}</ErrorText>}
        <Button onClick={submitQuote} loading={submitting}>
          {quoteRequest.myQuote ? "Mettre à jour le devis" : "Envoyer le devis"}
        </Button>
      </Card>

      <Button variant="secondary" full className="mt-4" onClick={openConversation}>
        Contacter notre équipe
      </Button>
    </div>
  );
}
