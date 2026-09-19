import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Card, Reveal, SectionLabel, Skeleton } from "../../components/ui";
import { IconChart, IconInbox, IconSparkle, IconCrown } from "../../components/icons";

interface Stats {
  totalRequests: number;
  byStatus: Record<string, number>;
  pendingReview: number;
  awaitingQuotes: number;
  revenueTotal: number;
  revenueThisMonth: number;
  marginTotal: number;
  marginThisMonth: number;
  marginAverage: number;
  acceptedCount: number;
  conversionRate: number;
  offerAcceptanceRate: number;
  monthly: { month: string; revenue: number; margin: number; count: number }[];
}

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const percent = (n: number) => `${Math.round(n * 100)} %`;

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card glass className={`flex h-full flex-col ${accent ? "border-gold/30" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider2 text-mutedDark">{label}</p>
        <Icon className={`h-4 w-4 shrink-0 ${accent ? "text-gold" : "text-mutedDark"}`} />
      </div>
      <p className={`mt-auto pt-3 font-display text-3xl tracking-tight ${accent ? "text-gold-gradient" : "text-ivory"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-mutedDark">{hint}</p>}
    </Card>
  );
}

function MonthlyChart({ monthly }: { monthly: Stats["monthly"] }) {
  const max = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div className="flex h-52 justify-between gap-3 md:gap-5">
      {monthly.map((m) => {
        const revenueHeight = (m.revenue / max) * 100;
        const marginHeight = (m.margin / max) * 100;
        return (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[28px] rounded-t-md bg-gradient-to-t from-gold/25 to-gold/60 transition-all duration-500"
                style={{ height: `${Math.max(revenueHeight, m.revenue > 0 ? 3 : 0)}%` }}
                title={`CA : ${euros(m.revenue)}`}
              />
              <div
                className="w-1/2 max-w-[28px] rounded-t-md bg-gradient-to-t from-success/25 to-success/60 transition-all duration-500"
                style={{ height: `${Math.max(marginHeight, m.margin > 0 ? 3 : 0)}%` }}
                title={`Marge : ${euros(m.margin)}`}
              />
            </div>
            <span className="text-[11px] capitalize text-mutedDark">{m.month}</span>
          </div>
        );
      })}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "À traiter",
  FORWARDED: "Transmises",
  QUOTED: "Devis reçus",
  FINALIZED: "Offre envoyée",
  ACCEPTED: "Réservées",
  DECLINED: "Refusées",
  CANCELLED: "Annulées",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ stats: Stats }>("/admin/stats").then((d) => setStats(d.stats));
  }, []);

  if (!stats) {
    return (
      <div>
        <Skeleton className="mb-6 h-9 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl tracking-tight text-ivory">Tableau de bord</h1>
      <p className="mb-6 text-sm text-muted">Vos chiffres d'intermédiaire, en temps réel.</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Reveal index={0}>
          <StatCard
            label="Marge du mois"
            value={euros(stats.marginThisMonth)}
            hint={`${euros(stats.marginTotal)} depuis le début`}
            icon={IconCrown}
            accent
          />
        </Reveal>
        <Reveal index={1}>
          <StatCard
            label="CA du mois"
            value={euros(stats.revenueThisMonth)}
            hint={`${euros(stats.revenueTotal)} au total`}
            icon={IconChart}
          />
        </Reveal>
        <Reveal index={2}>
          <StatCard
            label="Marge moyenne"
            value={euros(stats.marginAverage)}
            hint="par dossier réservé"
            icon={IconSparkle}
          />
        </Reveal>
        <Reveal index={3}>
          <StatCard
            label="Conversion"
            value={percent(stats.conversionRate)}
            hint={`${percent(stats.offerAcceptanceRate)} des offres acceptées`}
            icon={IconInbox}
          />
        </Reveal>
      </div>

      {stats.pendingReview > 0 && (
        <Reveal index={4}>
          <Card
            glass
            className="mt-4 border-danger/30"
            onClick={() => navigate("/admin/queue")}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ivory">
                  {stats.pendingReview} demande{stats.pendingReview > 1 ? "s" : ""} en attente de traitement
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  À transmettre à des professionnels pour obtenir des devis.
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gold">Traiter →</span>
            </div>
          </Card>
        </Reveal>
      )}

      <Reveal index={5}>
        <Card className="mt-4">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <SectionLabel>6 derniers mois</SectionLabel>
            <div className="flex items-center gap-4 text-[11px] text-mutedDark">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-gold/60" /> Chiffre d'affaires
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-success/60" /> Votre marge
              </span>
            </div>
          </div>
          <MonthlyChart monthly={stats.monthly} />
        </Card>
      </Reveal>

      <Reveal index={6}>
        <Card className="mt-4">
          <SectionLabel>Répartition des dossiers</SectionLabel>
          <div className="mt-2 flex flex-col divide-y divide-hairline">
            {Object.entries(STATUS_LABELS).map(([key, label]) => {
              const count = stats.byStatus[key] ?? 0;
              const share = stats.totalRequests ? (count / stats.totalRequests) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-4 py-2.5">
                  <span className="w-32 shrink-0 text-sm text-muted">{label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surfaceAlt">
                    <div
                      className="h-full rounded-full bg-gold-gradient transition-all duration-700"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold text-ivory">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
