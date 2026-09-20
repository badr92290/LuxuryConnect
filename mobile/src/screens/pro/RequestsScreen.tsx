import React, { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { QuoteRequest, QuoteRequestStatus, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ProTabParamList, ProStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ProTabParamList, "Requests">,
  NativeStackScreenProps<ProStackParamList>
>;

const STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  PENDING_REVIEW: "Nouvelle demande",
  FORWARDED: "Nouvelle demande",
  QUOTED: "Devis envoyé",
  FINALIZED: "Offre transmise au client",
  ACCEPTED: "Acceptée",
  DECLINED: "Refusée",
  CANCELLED: "Annulée",
};

const STATUS_TONES: Record<QuoteRequestStatus, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "primary",
  QUOTED: "muted",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

export default function RequestsScreen({ navigation }: Props) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes de devis</Text>
      </View>
      <FlatList
        data={quoteRequests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune demande pour le moment.</Text> : null}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("QuoteRequestDetail", { quoteRequestId: item.id })}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.clientName}>
                {item.client?.firstName} {item.client?.lastName}
              </Text>
              <Badge label={STATUS_LABELS[item.status]} tone={STATUS_TONES[item.status]} />
            </View>
            <Text style={styles.meta}>
              {SERVICE_LABELS[item.serviceType]} · {item.vehicleMake} {item.vehicleModel}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.md,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  clientName: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
