import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { QuoteRequest, SERVICE_LABELS } from "../../types";
import { Badge, Card, EmptyState, SkeletonList } from "../../components/ui";

const FORWARD_LABELS: Record<string, string> = {
  PENDING: "Nouvelle demande",
  QUOTED: "Devis envoyé",
  DECLINED: "Refusée",
};

export default function RequestsPage() {
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

  if (loading) return <SkeletonList />;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-ivory tracking-tight">Demandes transmises</h1>
      {quoteRequests.length === 0 && (
        <EmptyState message="Aucune demande transmise pour le moment. Notre équipe vous contactera dès qu'une mission correspond à votre profil." />
      )}
      <div className="flex flex-col gap-3">
        {quoteRequests.map((q) => (
          <Card key={q.id} className="cursor-pointer hover:border-primary/40" onClick={() => navigate(`/pro/requests/${q.id}`)}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{SERVICE_LABELS[q.serviceType]}</p>
              <Badge label={FORWARD_LABELS[q.forwardStatus ?? "PENDING"]} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {q.vehicleMake} {q.vehicleModel}
              {q.city ? ` · ${q.city}` : ""}
            </p>
            {q.myQuote && <p className="mt-2 text-sm font-semibold text-primary">Votre prix : {q.myQuote.price} €</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
