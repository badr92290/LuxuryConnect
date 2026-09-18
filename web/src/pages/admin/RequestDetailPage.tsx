import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { ProfessionalProfile, QuoteRequest, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { Badge, Button, Card, ErrorText, Input, Spinner, Textarea } from "../../components/ui";

export default function AdminRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [candidates, setCandidates] = useState<ProfessionalProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);
  const [finalizingFor, setFinalizingFor] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState("");
  const [finalMessage, setFinalMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    const data = await api.get<{ quoteRequest: QuoteRequest }>(`/admin/quote-requests/${requestId}`);
    setQuoteRequest(data.quoteRequest);
    const proData = await api.get<{ professionals: ProfessionalProfile[] }>(
      `/admin/professionals?service=${data.quoteRequest.serviceType}`
    );
    setCandidates(proData.professionals);
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleCandidate(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function forward() {
    if (selectedIds.length === 0) return;
    setForwarding(true);
    try {
      await api.post(`/admin/quote-requests/${requestId}/forward`, { professionalIds: selectedIds });
      setSelectedIds([]);
      await load();
    } finally {
      setForwarding(false);
    }
  }

  async function finalize(professionalId: string, suggestedPrice: number) {
    setFinalizingFor(professionalId);
    setFinalPrice(String(suggestedPrice));
    setFinalMessage("");
  }

  async function confirmFinalize() {
    if (!finalizingFor || !finalPrice) return;
    setError(null);
    setActing(true);
    try {
      await api.post(`/admin/quote-requests/${requestId}/finalize`, {
        professionalId: finalizingFor,
        finalPrice: parseFloat(finalPrice),
        finalMessage: finalMessage || undefined,
      });
      setFinalizingFor(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de finaliser l'offre");
    } finally {
      setActing(false);
    }
  }

  async function messageUser(userId: string) {
    const data = await api.post<{ conversation: { id: string } }>("/conversations", { userId });
    navigate(`/admin/messages/${data.conversation.id}`);
  }

  if (loading || !quoteRequest) return <Spinner />;

  const forwardedIds = new Set(quoteRequest.forwards?.map((f) => f.professionalId));
  const alreadyForwarded = candidates.filter((c) => forwardedIds.has(c.id));
  const notForwardedYet = candidates.filter((c) => !forwardedIds.has(c.id));

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate("/admin")} className="mb-4 text-sm text-muted">
        ← Retour à la file
      </button>

      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {quoteRequest.client?.firstName} {quoteRequest.client?.lastName}
          </h1>
          <Badge label={QUOTE_REQUEST_STATUS_LABELS[quoteRequest.status]} />
        </div>
        <p className="text-sm text-muted">{quoteRequest.client?.phone}</p>
        <p className="text-sm text-muted">{quoteRequest.client?.email}</p>
        <div className="mt-3 border-t border-border pt-3">
          <p className="font-semibold">{SERVICE_LABELS[quoteRequest.serviceType]}</p>
          <p className="text-sm text-muted">
            {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
            {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""} {quoteRequest.city ? `· ${quoteRequest.city}` : ""}
          </p>
          {quoteRequest.description && <p className="mt-2 text-sm">{quoteRequest.description}</p>}
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => messageUser(quoteRequest.clientId)}>
          Message au client
        </Button>
      </Card>

      {quoteRequest.status !== "ACCEPTED" && quoteRequest.status !== "DECLINED" && quoteRequest.status !== "CANCELLED" && (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Transmettre à des professionnels</h2>
          {alreadyForwarded.length > 0 && (
            <p className="mb-3 text-xs text-muted">
              Déjà transmise à : {alreadyForwarded.map((p) => p.businessName).join(", ")}
            </p>
          )}
          {notForwardedYet.length === 0 ? (
            <p className="text-sm text-muted">
              Tous les professionnels proposant cette prestation ont déjà reçu la demande.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {notForwardedYet.map((p) => (
                <label key={p.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleCandidate(p.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="flex-1">
                    {p.businessName} <span className="text-muted">· {p.city}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <Button className="mt-4" onClick={forward} loading={forwarding} disabled={selectedIds.length === 0}>
            Transmettre ({selectedIds.length})
          </Button>
        </Card>
      )}

      {quoteRequest.forwards && quoteRequest.forwards.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Professionnels consultés</h2>
          <div className="flex flex-col gap-2">
            {quoteRequest.forwards.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                <span>{f.professional?.businessName}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    label={f.status === "QUOTED" ? "Devis reçu" : f.status === "DECLINED" ? "Refusé" : "En attente"}
                    tone={f.status === "QUOTED" ? "primary" : "muted"}
                  />
                  {f.professional?.userId && (
                    <button className="text-xs text-primary" onClick={() => messageUser(f.professional!.userId)}>
                      Message
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {quoteRequest.quotes && quoteRequest.quotes.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-3 font-semibold">Devis reçus</h2>
          <div className="flex flex-col gap-3">
            {quoteRequest.quotes.map((q) => (
              <div key={q.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{q.professional?.businessName}</p>
                  <Badge
                    label={q.status === "SELECTED" ? "Sélectionné" : q.status === "REJECTED" ? "Non retenu" : "Proposé"}
                    tone={q.status === "SELECTED" ? "success" : q.status === "REJECTED" ? "muted" : "primary"}
                  />
                </div>
                <p className="mt-1 text-lg font-bold text-primary">{q.price} €</p>
                {q.message && <p className="text-sm text-muted">{q.message}</p>}
                {q.status === "PROPOSED" && quoteRequest.status !== "FINALIZED" && quoteRequest.status !== "ACCEPTED" && (
                  <Button variant="secondary" className="mt-2" onClick={() => finalize(q.professionalId, q.price)}>
                    Choisir ce prestataire
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {finalizingFor && (
        <Card className="mt-4 border-primary/40">
          <h2 className="mb-3 font-semibold text-primary">Fixer le prix final au client</h2>
          <Input label="Prix facturé au client (€)" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} inputMode="decimal" />
          <Textarea
            label="Message pour le client (optionnel)"
            value={finalMessage}
            onChange={(e) => setFinalMessage(e.target.value)}
            rows={3}
          />
          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex gap-3">
            <Button onClick={confirmFinalize} loading={acting}>
              Envoyer l'offre au client
            </Button>
            <Button variant="secondary" onClick={() => setFinalizingFor(null)}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {quoteRequest.status === "FINALIZED" && (
        <Card className="mt-4">
          <h2 className="mb-2 font-semibold">Offre envoyée au client</h2>
          <p className="text-lg font-bold">{quoteRequest.finalPrice} €</p>
          <p className="text-sm text-muted">Prestataire : {quoteRequest.selectedProfessional?.businessName}</p>
          <p className="mt-1 text-xs text-muted">En attente de la décision du client.</p>
        </Card>
      )}

      {quoteRequest.booking && (
        <Card className="mt-4">
          <h2 className="mb-2 font-semibold text-success">Réservation confirmée</h2>
          <p className="text-sm text-muted">
            {quoteRequest.selectedProfessional?.businessName} · {quoteRequest.booking.price} € ·{" "}
            {new Date(quoteRequest.booking.scheduledAt).toLocaleDateString("fr-FR")}
          </p>
        </Card>
      )}
    </div>
  );
}
