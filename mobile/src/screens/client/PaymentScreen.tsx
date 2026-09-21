import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useStripe } from "../../payments/stripe";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Muted,
  Screen,
  SectionLabel,
  Spinner,
  Title,
} from "../../components/ui";
import { api, ApiError } from "../../api/client";
import { paymentsConfigured } from "../../api/stripeConfig";
import {
  Booking,
  ClientPayment,
  formatAmount,
  PAYMENT_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "Payment">;
type IntentResponse = { clientSecret: string; amountTotal: number; currency: string };

/**
 * Règlement d'une prestation depuis l'application.
 *
 * On passe par la feuille de paiement de Stripe : c'est elle qui affiche
 * Apple Pay sur iPhone et Google Pay sur Android, sans qu'on ait à détecter
 * quoi que ce soit. Le client paie LuxuryConnect ; l'atelier est réglé plus
 * tard, par nous.
 */
export default function PaymentScreen({ route }: Props) {
  const { bookingId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<ClientPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [ready, setReady] = useState(false);
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Prépare la feuille de paiement dès que l'écran s'ouvre, pour que le
  // premier appui ne se solde pas par une attente.
  useEffect(() => {
    if (!paymentsConfigured()) return;
    let cancelled = false;

    (async () => {
      try {
        const current = await api.get<{ payment: ClientPayment | null }>(
          `/payments/bookings/${bookingId}`,
        );
        if (current.payment?.status === "PAID" || cancelled) return;

        const intent = await api.post<IntentResponse>(`/payments/bookings/${bookingId}/intent`);
        if (cancelled) return;

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "LuxuryConnect",
          paymentIntentClientSecret: intent.clientSecret,
          // Apple Pay et Google Pay : déclarés ici, proposés par la feuille
          // selon l'appareil.
          applePay: { merchantCountryCode: "FR" },
          googlePay: {
            merchantCountryCode: "FR",
            currencyCode: intent.currency.toUpperCase(),
            testEnv: __DEV__,
          },
          appearance: {
            colors: {
              background: colors.surface,
              componentBackground: colors.surfaceAlt,
              componentBorder: colors.border,
              primary: colors.primary,
              primaryText: colors.text,
              secondaryText: colors.textMuted,
              componentText: colors.text,
              placeholderText: colors.textMutedDark,
            },
            shapes: { borderRadius: 16 },
          },
          returnURL: "luxuryconnect://paiement",
        });
        if (initError) throw new Error(initError.message);
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Le paiement n'a pas pu être préparé.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId, initPaymentSheet]);

  async function pay() {
    setPaying(true);
    setError(null);
    const { error: sheetError } = await presentPaymentSheet();
    setPaying(false);

    if (sheetError) {
      // L'annulation par le client n'est pas une erreur à afficher en rouge.
      if (sheetError.code !== "Canceled") {
        setError(sheetError.message ?? "Le paiement n'a pas abouti.");
      }
      return;
    }
    await load();
  }

  if (loading) return <Spinner />;
  if (!booking) {
    return (
      <Screen>
        <View style={styles.container}>
          <ErrorText>Réservation introuvable.</ErrorText>
        </View>
      </Screen>
    );
  }

  const vehicle = booking.quoteRequest;
  const paid = payment?.status === "PAID";
  const amount = payment?.amountTotal ?? Math.round(booking.price * 100);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>{paid ? "Prestation réglée" : "Régler ma prestation"}</Title>

        <Card style={styles.card}>
          <View style={styles.headRow}>
            <Text style={styles.business}>{booking.professional?.businessName}</Text>
            {payment && (
              <Badge
                label={PAYMENT_STATUS_LABELS[payment.status]}
                tone={paid ? "success" : payment.status === "FAILED" ? "danger" : "primary"}
              />
            )}
          </View>
          {vehicle && (
            <Muted style={styles.meta}>
              {SERVICE_LABELS[vehicle.serviceType]} · {vehicle.vehicleMake} {vehicle.vehicleModel}
            </Muted>
          )}
          <Muted style={styles.meta}>
            Rendez-vous le {new Date(booking.scheduledAt).toLocaleDateString("fr-FR")}
          </Muted>

          <View style={styles.amountBlock}>
            <SectionLabel>Montant</SectionLabel>
            <Text style={styles.amount}>{formatAmount(amount)}</Text>
            <Muted style={styles.note}>
              Prix ferme, tout compris. Vous réglez LuxuryConnect, qui rémunère ensuite l'atelier.
            </Muted>
          </View>
        </Card>

        {paid ? (
          <Card style={styles.card}>
            <Body>
              Réglé le {new Date(payment!.paidAt!).toLocaleDateString("fr-FR")}
              {payment!.paymentMethodLabel ? ` · ${payment!.paymentMethodLabel}` : ""}. Un reçu vous
              a été envoyé par e-mail.
            </Body>
          </Card>
        ) : !paymentsConfigured() ? (
          <Card style={styles.card}>
            <Muted>
              Le paiement en ligne n'est pas encore activé. Écrivez-nous depuis la messagerie pour
              régler cette prestation.
            </Muted>
          </Card>
        ) : (
          <View style={styles.actions}>
            {error && <ErrorText>{error}</ErrorText>}
            <Button
              title={`Payer ${formatAmount(amount)}`}
              onPress={pay}
              loading={paying}
              disabled={!ready}
            />
            <Muted style={styles.secure}>
              Apple Pay, Google Pay ou carte bancaire. Paiement sécurisé par Stripe : vos
              coordonnées bancaires ne transitent pas par LuxuryConnect.
            </Muted>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xl },
  card: { marginTop: spacing.lg },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  business: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, flexShrink: 1 },
  meta: { marginTop: 6, fontSize: 14 },
  amountBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  amount: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.6,
    color: colors.text,
    marginTop: 6,
  },
  note: { marginTop: spacing.sm, fontSize: 12, color: colors.textMutedDark },
  actions: { marginTop: spacing.lg },
  secure: { marginTop: spacing.md, fontSize: 12, color: colors.textMutedDark },
});
