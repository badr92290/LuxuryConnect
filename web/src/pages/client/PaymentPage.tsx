import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { api, ApiError } from "../../api/client";
import { getStripe, paymentsConfigured, stripeAppearance } from "../../lib/stripe";
import { useToast } from "../../context/ToastContext";
import {
  Booking,
  ClientPayment,
  formatAmount,
  PAYMENT_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";
import {
  BackLink,
  Badge,
  Button,
  Card,
  ErrorText,
  SectionLabel,
  Spinner,
} from "../../components/ui";
import { IconShield } from "../../components/icons";
import { CardBrands } from "../../components/CardBrands";

type IntentResponse = { clientSecret: string; amountTotal: number; currency: string };

/** Formulaire proprement dit, une fois le secret obtenu. */
function PaymentForm({
  amount,
  currency,
  onPaid,
}: {
  amount: number;
  currency: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Vérifiez les informations saisies.");
      setSubmitting(false);
      return;
    }

    // `redirect: "if_required"` garde le client sur la page quand la banque
    // n'exige pas d'authentification ; sinon Stripe l'emmène et le ramène.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${window.location.pathname}` },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Le paiement n'a pas abouti.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      onPaid();
      return;
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Carte bancaire d'abord ; Apple Pay et Google Pay s'ajoutent d'eux-mêmes
          au-dessus, selon l'appareil et le navigateur. */}
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
          defaultValues: { billingDetails: { name: "" } },
        }}
      />

      {error && (
        <div className="mt-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      <Button type="submit" full loading={submitting} disabled={!ready} className="mt-6">
        Payer {formatAmount(amount, currency)}
      </Button>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <CardBrands />
        <span className="text-xs text-mutedDark">Carte bancaire, Apple Pay ou Google Pay</span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mutedDark">
        <IconShield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Paiement sécurisé par Stripe. Vos coordonnées bancaires ne transitent pas par
          LuxuryConnect et ne sont jamais stockées sur nos serveurs.
        </span>
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<ClientPayment | null>(null);
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [{ bookings }, state] = await Promise.all([
        api.get<{ bookings: Booking[] }>("/bookings"),
        api.get<{ payment: ClientPayment | null }>(`/payments/bookings/${bookingId}`),
      ]);
      setBooking(bookings.find((b) => b.id === bookingId) ?? null);
      setPayment(state.payment);
      return state.payment;
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load().then((current) => {
      if (current?.status === "PAID" || !paymentsConfigured()) return;
      api
        .post<IntentResponse>(`/payments/bookings/${bookingId}/intent`)
        .then(setIntent)
        .catch((err) =>
          setError(err instanceof ApiError ? err.message : "Le paiement n'a pas pu être préparé."),
        );
    });
  }, [bookingId, load]);

  if (loading) return <Spinner />;
  if (!booking) return <ErrorText>Réservation introuvable.</ErrorText>;

  const vehicle = booking.quoteRequest;
  const paid = payment?.status === "PAID";

  return (
    <div className="mx-auto max-w-lg">
      <BackLink label="Retour aux réservations" onClick={() => navigate("/app/bookings")} />

      <h1 className="font-display text-3xl tracking-tight text-ivory">
        {paid ? "Prestation réglée" : "Régler ma prestation"}
      </h1>

      <Card className="mt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-ivory">{booking.professional?.businessName}</p>
            {vehicle && (
              <p className="mt-1 text-sm text-muted">
                {SERVICE_LABELS[vehicle.serviceType]} · {vehicle.vehicleMake} {vehicle.vehicleModel}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">
              Rendez-vous le {new Date(booking.scheduledAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {payment && (
            <Badge
              label={PAYMENT_STATUS_LABELS[payment.status]}
              tone={paid ? "success" : payment.status === "FAILED" ? "danger" : "primary"}
            />
          )}
        </div>

        <div className="mt-5 border-t border-hairline pt-5">
          <SectionLabel>Montant</SectionLabel>
          <p className="font-display text-4xl tracking-tight text-ivory">
            {formatAmount(payment?.amountTotal ?? Math.round(booking.price * 100))}
          </p>
          <p className="mt-2 text-xs text-mutedDark">
            Prix ferme, tout compris. Vous réglez LuxuryConnect, qui rémunère ensuite l'atelier.
          </p>
        </div>
      </Card>

      {paid ? (
        <Card className="mt-4">
          <p className="text-sm leading-relaxed text-ivory">
            Réglé le {new Date(payment!.paidAt!).toLocaleDateString("fr-FR")}
            {payment!.paymentMethodLabel ? ` · ${payment!.paymentMethodLabel}` : ""}. Un reçu vous a
            été envoyé par e-mail.
          </p>
        </Card>
      ) : !paymentsConfigured() ? (
        <Card className="mt-4">
          <p className="text-sm leading-relaxed text-muted">
            Le paiement en ligne n'est pas encore activé. Contactez-nous depuis la messagerie pour
            régler cette prestation.
          </p>
        </Card>
      ) : error ? (
        <div className="mt-4">
          <ErrorText>{error}</ErrorText>
        </div>
      ) : intent ? (
        <Card className="mt-4">
          <Elements
            stripe={getStripe()}
            options={{ clientSecret: intent.clientSecret, appearance: stripeAppearance }}
          >
            <PaymentForm
              amount={intent.amountTotal}
              currency={intent.currency}
              onPaid={() => {
                toast("Paiement accepté, merci.", "success");
                load();
              }}
            />
          </Elements>
        </Card>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
