import React, { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import {
  AdminPayment,
  formatAmount,
  PAYMENT_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";
import { Badge, Button, Card, EmptyState, SectionLabel, SkeletonList } from "../../components/ui";

type Totals = { collected: number; owed: number; margin: number };

/**
 * Les deux mouvements d'une prestation, côté LuxuryConnect : ce que le client
 * a versé, et ce qu'il reste à virer à l'atelier. La marge n'est acquise
 * qu'une fois l'atelier payé — d'où le total séparé.
 */
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [totals, setTotals] = useState<Totals>({ collected: 0, owed: 0, margin: 0 });
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api.get<{
        payments: AdminPayment[];
        totals: Totals;
        configured: boolean;
      }>("/payments");
      setPayments(data.payments);
      setTotals(data.totals);
      setConfigured(data.configured);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(payment: AdminPayment, action: "release" | "refund") {
    setBusyId(payment.id);
    try {
      await api.post(`/payments/${payment.id}/${action}`);
      toast(
        action === "release"
          ? `Virement envoyé à ${payment.professional.businessName}`
          : "Remboursement lancé",
        "success",
      );
      await load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Action impossible", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <SkeletonList />;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-ivory">Paiements</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Le client vous règle, vous rémunérez l'atelier. Le virement n'est possible qu'une fois la
        prestation terminée : jusque-là, les fonds restent chez vous.
      </p>

      {!configured && (
        <Card className="mb-6 border-danger/30">
          <p className="text-sm leading-relaxed text-ivory">
            Stripe n'est pas configuré : renseignez <code className="text-gold">STRIPE_SECRET_KEY</code>{" "}
            et <code className="text-gold">STRIPE_WEBHOOK_SECRET</code> côté API pour activer les
            encaissements.
          </p>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
        {[
          { label: "Encaissé", value: totals.collected, hint: "réglé par les clients" },
          { label: "À reverser", value: totals.owed, hint: "dû aux ateliers" },
          { label: "Marge acquise", value: totals.margin, hint: "prestations soldées" },
        ].map((item) => (
          <div key={item.label} className="bg-background px-6 py-5">
            <SectionLabel>{item.label}</SectionLabel>
            <p className="font-display text-2xl tracking-tight text-ivory">
              {formatAmount(item.value)}
            </p>
            <p className="mt-1 text-xs text-mutedDark">{item.hint}</p>
          </div>
        ))}
      </div>

      {payments.length === 0 && <EmptyState message="Aucun paiement pour le moment." />}

      <div className="flex flex-col gap-3">
        {payments.map((payment) => {
          const vehicle = payment.booking.quoteRequest;
          const canRelease =
            payment.status === "PAID" &&
            payment.payoutStatus !== "PAID" &&
            payment.booking.status === "COMPLETED";
          const canRefund = payment.status === "PAID" && payment.payoutStatus !== "PAID";

          return (
            <Card key={payment.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ivory">
                    {payment.client.firstName} {payment.client.lastName} →{" "}
                    {payment.professional.businessName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {SERVICE_LABELS[vehicle.serviceType]} · {vehicle.vehicleMake}{" "}
                    {vehicle.vehicleModel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    label={PAYMENT_STATUS_LABELS[payment.status]}
                    tone={
                      payment.status === "PAID"
                        ? "success"
                        : payment.status === "FAILED"
                          ? "danger"
                          : "muted"
                    }
                  />
                  <Badge
                    label={PAYOUT_STATUS_LABELS[payment.payoutStatus]}
                    tone={
                      payment.payoutStatus === "PAID"
                        ? "success"
                        : payment.payoutStatus === "FAILED"
                          ? "danger"
                          : "primary"
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline">
                {[
                  { k: "Client paie", v: formatAmount(payment.amountTotal), cls: "text-ivory" },
                  {
                    k: "Atelier touche",
                    v: formatAmount(payment.amountWorkshop),
                    cls: "text-ivory",
                  },
                  { k: "Votre marge", v: formatAmount(payment.amountMargin), cls: "text-success" },
                ].map((cell) => (
                  <div key={cell.k} className="bg-surfaceAlt px-4 py-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider2 text-mutedDark">
                      {cell.k}
                    </p>
                    <p className={`mt-1 font-semibold ${cell.cls}`}>{cell.v}</p>
                  </div>
                ))}
              </div>

              {payment.paymentMethodLabel && (
                <p className="mt-3 text-xs text-mutedDark">
                  Réglé par {payment.paymentMethodLabel}
                  {payment.paidAt
                    ? ` le ${new Date(payment.paidAt).toLocaleDateString("fr-FR")}`
                    : ""}
                </p>
              )}
              {payment.failureMessage && (
                <p className="mt-3 text-xs text-danger">{payment.failureMessage}</p>
              )}
              {payment.payoutError && (
                <p className="mt-3 text-xs text-danger">Virement : {payment.payoutError}</p>
              )}
              {!payment.professional.stripePayoutsEnabled && payment.status === "PAID" && (
                <p className="mt-3 text-xs text-muted">
                  {payment.professional.businessName} n'a pas terminé son inscription au paiement :
                  le virement est impossible tant que ce n'est pas fait.
                </p>
              )}
              {payment.status === "PAID" &&
                payment.payoutStatus !== "PAID" &&
                payment.booking.status !== "COMPLETED" && (
                  <p className="mt-3 text-xs text-muted">
                    La prestation n'est pas encore marquée terminée.
                  </p>
                )}

              {(canRelease || canRefund) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canRelease && (
                    <Button
                      onClick={() => act(payment, "release")}
                      disabled={busyId === payment.id || !payment.professional.stripePayoutsEnabled}
                    >
                      Virer {formatAmount(payment.amountWorkshop)} à l'atelier
                    </Button>
                  )}
                  {canRefund && (
                    <Button
                      variant="secondary"
                      onClick={() => act(payment, "refund")}
                      disabled={busyId === payment.id}
                    >
                      Rembourser le client
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
