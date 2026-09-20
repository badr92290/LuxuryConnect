import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Button, Card, EmptyState, Screen, Title } from "../../components/ui";
import { api } from "../../api/client";
import {
  QuoteRequest,
  QuoteRequestStatus,
  QUOTE_REQUEST_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";

const TONE: Record<QuoteRequestStatus, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

export default function MyQuotesScreen() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ quoteRequests: QuoteRequest[] }>("/quote-requests");
      setQuoteRequests(data.quoteRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // L'offre finale vient de LuxuryConnect : le client accepte un prix,
  // jamais le devis d'un atelier en particulier.
  async function acceptOffer(quoteRequestId: string) {
    setAcceptingId(quoteRequestId);
    try {
      const scheduledAt = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
      await api.post(`/quote-requests/${quoteRequestId}/accept`, { scheduledAt });
      await load();
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Screen>
      <FlatList
        data={quoteRequests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        ListHeaderComponent={<Title style={styles.title}>Mes demandes</Title>}
        ListEmptyComponent={
          !loading ? (
            <EmptyState message="Vous n'avez pas encore fait de demande de devis." />
          ) : null
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.service}>{SERVICE_LABELS[item.serviceType]}</Text>
              <Badge label={QUOTE_REQUEST_STATUS_LABELS[item.status]} tone={TONE[item.status]} />
            </View>
            <Text style={styles.meta}>
              {item.vehicleMake} {item.vehicleModel}
              {item.vehicleYear ? ` (${item.vehicleYear})` : ""}
            </Text>

            {item.status === "FINALIZED" && item.finalPrice != null && (
              <>
                <Text style={styles.offer}>Offre reçue : {item.finalPrice} €</Text>
                <Button
                  title="Accepter l'offre"
                  onPress={() => acceptOffer(item.id)}
                  loading={acceptingId === item.id}
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.md },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  service: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15, flexShrink: 1 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginTop: 6 },
  offer: { fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 14, marginTop: 10 },
});
