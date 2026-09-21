import React, { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import {
  formatAmount,
  PAYOUT_STATUS_LABELS,
  SERVICE_LABELS,
  WorkshopEarning,
} from "../../types";
import { Badge, Button, Card, EmptyState, SectionLabel, SkeletonList } from "../../components/ui";

type ConnectStatus = {
  configured: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
  requirements?: string[];
};

/**
 * Côté atelier : l'inscription au paiement, puis le suivi des virements.
 * L'atelier n'encaisse jamais le client — c'est LuxuryConnect qui lui verse
 * sa part une fois la prestation faite.
 */
export default function ProPaymentsPage() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [earnings, setEarnings] = useState<WorkshopEarning[]>([]);
  const [totals, setTotals] = useState({ paidOut: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const [connect, earn] = await Promise.all([
        api.get<ConnectStatus>("/payments/connect/status"),
        api.get<{ payments: WorkshopEarning[]; totals: { paidOut: number; pending: number } }>(
          "/payments/earnings",
        ),
      ]);
      setStatus(connect);
      setEarnings(earn.payments);
      setTotals(earn.totals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startOnboarding() {
    setStarting(true);
    try {
      const { url } = await api.post<{ url: string }>("/payments/connect/onboard");
      // Stripe recueille lui-même l'identité et le RIB : nous ne les voyons pas.
      window.location.href = url;
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Impossible de démarrer l'inscription", "error");
      setStarting(false);
    }
  }

  if (loading) return <SkeletonList />;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ivory">Mes paiements</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        LuxuryConnect encaisse le client, puis vous verse votre part une fois la prestation
        terminée. Vous n'avez rien à demander au client.
      </p>

      {/* Ce que l'atelier a gagné se lit toujours : même sans paiement en
          ligne, il doit savoir ce que LuxuryConnect lui doit. */}
      {!status?.configured && (
        <Card className="mb-6">
          <p className="text-sm leading-relaxed text-muted">
            Le paiement en ligne n'est pas encore activé : vos prestations vous sont réglées
            directement par LuxuryConnect, par virement.
          </p>
        </Card>
      )}

      {status?.configured && !status.payoutsEnabled && (
        <Card className="mb-6 border-gold/25">
          <SectionLabel>Inscription requise</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-ivory">
            Pour recevoir vos virements, renseignez vos coordonnées bancaires auprès de Stripe,
            notre prestataire de paiement. Comptez cinq minutes. Ni votre RIB ni vos pièces
            d'identité ne transitent par LuxuryConnect.
          </p>
          {status.requirements && status.requirements.length > 0 && (
            <p className="mt-3 text-xs text-mutedDark">
              Informations encore attendues : {status.requirements.length}
            </p>
          )}
          <Button onClick={startOnboarding} loading={starting} className="mt-5">
            {status.connected ? "Reprendre mon inscription" : "M'inscrire au paiement"}
          </Button>
        </Card>
      )}

      <>
          <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
            <div className="bg-background px-6 py-5">
              <SectionLabel>Déjà versé</SectionLabel>
              <p className="font-display text-2xl tracking-tight text-ivory">
                {formatAmount(totals.paidOut)}
              </p>
            </div>
            <div className="bg-background px-6 py-5">
              <SectionLabel>En attente</SectionLabel>
              <p className="font-display text-2xl tracking-tight text-gold">
                {formatAmount(totals.pending)}
              </p>
              <p className="mt-1 text-xs text-mutedDark">versé après la prestation</p>
            </div>
          </div>

          {earnings.length === 0 && <EmptyState message="Aucune prestation réglée pour le moment." />}

          <div className="flex flex-col gap-3">
            {earnings.map((earning) => {
              const vehicle = earning.booking.quoteRequest;
              return (
                <Card key={earning.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ivory">
                        {SERVICE_LABELS[vehicle.serviceType]}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {vehicle.vehicleMake} {vehicle.vehicleModel} ·{" "}
                        {new Date(earning.booking.scheduledAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge
                      label={PAYOUT_STATUS_LABELS[earning.payoutStatus]}
                      tone={
                        earning.payoutStatus === "PAID"
                          ? "success"
                          : earning.payoutStatus === "FAILED"
                            ? "danger"
                            : "primary"
                      }
                    />
                  </div>
                  <p className="mt-3 font-display text-2xl tracking-tight text-ivory">
                    {formatAmount(earning.amountWorkshop, earning.currency)}
                  </p>
                  {earning.paidOutAt && (
                    <p className="mt-1 text-xs text-mutedDark">
                      Viré le {new Date(earning.paidOutAt).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
      </>
    </div>
  );
}
