import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Card, EmptyState, Screen, Title } from "../../components/ui";
import { api } from "../../api/client";
import {
  QuoteRequest,
  QuoteRequestStatus,
  QUOTE_REQUEST_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ClientStackParamList, ClientTabParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, "MyRequests">,
  NativeStackScreenProps<ClientStackParamList>
>;

const TONE: Record<QuoteRequestStatus, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

export default function MyRequestsScreen({ navigation }: Props) {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ quoteRequests: QuoteRequest[] }>("/quote-requests");
      setRequests(data.quoteRequests);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <FlatList
        data={requests}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        ListHeaderComponent={<Title style={styles.title}>Mes demandes</Title>}
        ListEmptyComponent={
          !loading ? (
            <EmptyState message="Vous n'avez pas encore fait de demande. Décrivez votre besoin, nous nous occupons du reste." />
          ) : null
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate("RequestDetail", { requestId: item.id })}>
            <View style={styles.rowBetween}>
              <Text style={styles.service}>{SERVICE_LABELS[item.serviceType]}</Text>
              <Badge label={QUOTE_REQUEST_STATUS_LABELS[item.status]} tone={TONE[item.status]} />
            </View>
            <Text style={styles.meta}>
              {item.vehicleMake} {item.vehicleModel}
              {item.vehicleYear ? ` (${item.vehicleYear})` : ""}
            </Text>
            {item.status === "FINALIZED" && item.finalPrice != null && (
              <Text style={styles.offer}>Offre reçue : {item.finalPrice} €</Text>
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
