import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { QuoteRequest, QuoteRequestStatus, QUOTE_REQUEST_STATUS_LABELS, SERVICE_LABELS } from "../../types";
import { Badge, Card, EmptyState, Spinner } from "../../components/ui";

const TABS: { value: QuoteRequestStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING_REVIEW", label: "À traiter" },
  { value: "FORWARDED", label: "Transmises" },
  { value: "QUOTED", label: "Devis reçus" },
  { value: "FINALIZED", label: "Offre envoyée" },
  { value: "ACCEPTED", label: "Réservées" },
];

const TONE: Record<string, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "danger",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "muted",
  CANCELLED: "muted",
};

export default function QueuePage() {
  const [tab, setTab] = useState<QuoteRequestStatus | "ALL">("ALL");
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async (status: QuoteRequestStatus | "ALL") => {
    setLoading(true);
    try {
      const qs = status !== "ALL" ? `?status=${status}` : "";
      const data = await api.get<{ quoteRequests: QuoteRequest[] }>(`/admin/quote-requests${qs}`);
      setQuoteRequests(data.quoteRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  return (
    <div>
      <h1 className="mb-4 font-display text-3xl text-ivory tracking-tight">File des demandes</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold ${
              tab === t.value ? "border-primary bg-primary/15 text-primary" : "border-border text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : quoteRequests.length === 0 ? (
        <EmptyState message="Aucune demande dans cette catégorie." />
      ) : (
        <div className="flex flex-col gap-3">
          {quoteRequests.map((q) => (
            <Card
              key={q.id}
              className="cursor-pointer hover:border-primary/40"
              onClick={() => navigate(`/admin/requests/${q.id}`)}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  {q.client?.firstName} {q.client?.lastName} · {SERVICE_LABELS[q.serviceType]}
                </p>
                <Badge label={QUOTE_REQUEST_STATUS_LABELS[q.status]} tone={TONE[q.status]} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {q.vehicleMake} {q.vehicleModel} {q.city ? `· ${q.city}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
                {q.forwards?.length ?? 0} transmise(s) · {q.quotes?.length ?? 0} devis reçu(s)
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
