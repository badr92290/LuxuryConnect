import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { QuoteRequest, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { Badge, Card, EmptyState, Spinner } from "../../components/ui";

const TONE: Record<string, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

export default function MyRequestsPage() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ quoteRequests: QuoteRequest[] }>("/quote-requests");
      setQuoteRequests(data.quoteRequests);
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes demandes</h1>
      </div>
      {quoteRequests.length === 0 && <EmptyState message="Vous n'avez pas encore fait de demande de devis." />}
      <div className="flex flex-col gap-3">
        {quoteRequests.map((q) => (
          <Card key={q.id} className="cursor-pointer hover:border-primary/40" onClick={() => navigate(`/app/requests/${q.id}`)}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{SERVICE_LABELS[q.serviceType]}</p>
              <Badge label={QUOTE_REQUEST_STATUS_LABELS[q.status]} tone={TONE[q.status]} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {q.vehicleMake} {q.vehicleModel}
              {q.vehicleYear ? ` (${q.vehicleYear})` : ""}
            </p>
            {q.status === "FINALIZED" && q.finalPrice && (
              <p className="mt-2 text-sm font-semibold text-primary">Offre reçue : {q.finalPrice} €</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
