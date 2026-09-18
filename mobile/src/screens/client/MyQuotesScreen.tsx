import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing } from "../../theme/colors";
import { Badge, Button, Card, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { QuoteRequest, SERVICE_LABELS } from "../../types";

const STATUS_LABELS: Record<QuoteRequest["status"], string> = {
  PENDING: "En attente de devis",
  QUOTED: "Devis reçu",
  ACCEPTED: "Réservé",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
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

  async function acceptQuote(quoteRequestId: string, quoteId: string) {
    setAcceptingId(quoteId);
    try {
      const scheduledAt = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
      await api.post(`/quote-requests/${quoteRequestId}/quotes/${quoteId}/accept`, { scheduledAt });
      await load();
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mes demandes de devis</Text>
      </View>
      <FlatList
        data={quoteRequests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Vous n'avez pas encore fait de demande de devis.</Text> : null
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.businessName}>{item.professional?.businessName}</Text>
              <Badge label={STATUS_LABELS[item.status]} />
            </View>
            <Text style={styles.meta}>
              {SERVICE_LABELS[item.serviceType]} · {item.vehicleMake} {item.vehicleModel}
              {item.vehicleYear ? ` (${item.vehicleYear})` : ""}
            </Text>
            {item.quotes && item.quotes.length > 0 && (
              <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
                {item.quotes.map((q) => (
                  <View key={q.id} style={styles.quoteRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.price}>{q.price} €</Text>
                      {q.message && <Text style={styles.quoteMessage}>{q.message}</Text>}
                    </View>
                    {item.status === "QUOTED" && (
                      <Button
                        title="Accepter"
                        onPress={() => acceptQuote(item.id, q.id)}
                        loading={acceptingId === q.id}
                        style={{ paddingVertical: 8, paddingHorizontal: spacing.md }}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.md, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  businessName: { color: colors.text, fontWeight: "700", fontSize: 16 },
  meta: { color: colors.textMuted, marginTop: 4 },
  quoteRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  price: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  quoteMessage: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
