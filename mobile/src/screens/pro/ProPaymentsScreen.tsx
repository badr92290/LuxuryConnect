import React, { useCallback, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Muted,
  Screen,
  SectionLabel,
  Spinner,
  Subtitle,
  Title,
} from "../../components/ui";
import { api, ApiError } from "../../api/client";
import {
  formatAmount,
  PAYOUT_STATUS_LABELS,
  SERVICE_LABELS,
  WorkshopEarning,
} from "../../types";

type ConnectStatus = {
  configured: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
  requirements?: string[];
};

/**
 * Côté atelier : l'inscription au paiement, puis le suivi des virements.
 * L'atelier n'encaisse jamais le client — c'est LuxuryConnect qui lui verse
 * sa part une fois la prestation réalisée.
 */
export default function ProPaymentsScreen() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [earnings, setEarnings] = useState<WorkshopEarning[]>([]);
  const [totals, setTotals] = useState({ paidOut: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function startOnboarding() {
    setStarting(true);
    setError(null);
    try {
      // Stripe recueille lui-même l'identité et le RIB, dans son navigateur :
      // ces pièces ne passent jamais par LuxuryConnect.
      const { url } = await api.post<{ url: string }>("/payments/connect/onboard");
      await Linking.openURL(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de démarrer l'inscription");
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>Mes paiements</Title>
        <Subtitle style={styles.lede}>
          LuxuryConnect encaisse le client, puis vous verse votre part une fois la prestation
          terminée. Vous n'avez rien à demander au client.
        </Subtitle>

        {/* Ce que l'atelier a gagné se lit toujours : même sans paiement en
            ligne, il doit savoir ce que LuxuryConnect lui doit. */}
        {!status?.configured && (
          <Card style={styles.card}>
            <Muted>
              Le paiement en ligne n'est pas encore activé : vos prestations vous sont réglées
              directement par LuxuryConnect, par virement.
            </Muted>
          </Card>
        )}

        {status?.configured && !status.payoutsEnabled && (
          <Card style={styles.card}>
            <SectionLabel>Inscription requise</SectionLabel>
            <Text style={styles.onboardText}>
              Pour recevoir vos virements, renseignez vos coordonnées bancaires auprès de Stripe,
              notre prestataire de paiement. Comptez cinq minutes.
            </Text>
            {error && <Muted style={styles.error}>{error}</Muted>}
            <Button
              title={status.connected ? "Reprendre mon inscription" : "M'inscrire au paiement"}
              onPress={startOnboarding}
              loading={starting}
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        )}

        <View style={styles.totals}>
          <View style={styles.totalCell}>
            <SectionLabel>Déjà versé</SectionLabel>
            <Text style={styles.totalValue}>{formatAmount(totals.paidOut)}</Text>
          </View>
          <View style={styles.totalCell}>
            <SectionLabel>En attente</SectionLabel>
            <Text style={[styles.totalValue, styles.pending]}>{formatAmount(totals.pending)}</Text>
          </View>
        </View>

        {earnings.length === 0 && <EmptyState message="Aucune prestation réglée pour le moment." />}

        {earnings.map((earning) => {
          const vehicle = earning.booking.quoteRequest;
          return (
            <Card key={earning.id} style={styles.card}>
              <View style={styles.headRow}>
                <Text style={styles.service}>{SERVICE_LABELS[vehicle.serviceType]}</Text>
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
              </View>
              <Muted style={styles.meta}>
                {vehicle.vehicleMake} {vehicle.vehicleModel} ·{" "}
                {new Date(earning.booking.scheduledAt).toLocaleDateString("fr-FR")}
              </Muted>
              <Text style={styles.amount}>
                {formatAmount(earning.amountWorkshop, earning.currency)}
              </Text>
              {earning.paidOutAt && (
                <Muted style={styles.paidAt}>
                  Viré le {new Date(earning.paidOutAt).toLocaleDateString("fr-FR")}
                </Muted>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xl },
  lede: { marginTop: spacing.sm },
  card: { marginTop: spacing.md },
  onboardText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
    marginTop: spacing.sm,
  },
  error: { marginTop: spacing.sm, color: colors.danger },
  totals: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  totalCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 22,
    padding: spacing.md,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    marginTop: 6,
  },
  pending: { color: colors.primary },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  service: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, flexShrink: 1 },
  meta: { marginTop: 6, fontSize: 13 },
  amount: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.sm,
  },
  paidAt: { marginTop: 4, fontSize: 12, color: colors.textMutedDark },
});
