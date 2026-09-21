import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Card, EmptyState, Muted, Screen, Subtitle, Title } from "../../components/ui";
import { api } from "../../api/client";
import {
  SERVICE_LABELS,
  SUPPORT_REASON_LABELS,
  SUPPORT_STATUS_LABELS,
  SupportTicket,
  SupportTicketStatus,
} from "../../types";
import { useAuth } from "../../context/AuthContext";

const TONE: Record<SupportTicketStatus, "primary" | "muted" | "success" | "danger"> = {
  OPEN: "primary",
  IN_PROGRESS: "primary",
  ESCALATED: "danger",
  RESOLVED: "success",
};

export default function SupportListScreen({ navigation }: { navigation: any }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ tickets: SupportTicket[] }>("/support");
      setTickets(data.tickets);
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
        data={tickets}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Title>Service après-vente</Title>
            <Subtitle style={styles.lede}>
              {isClient
                ? "Un souci après une prestation ? Ouvrez un dossier depuis la réservation concernée. Ici, vous échangez directement avec l'atelier — et nous intervenons si besoin."
                : "Les dossiers ouverts par vos clients après une prestation. Vous leur répondez directement."}
            </Subtitle>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              message={
                isClient
                  ? "Aucun dossier ouvert. Tant mieux."
                  : "Aucun dossier de service après-vente pour le moment."
              }
            />
          ) : null
        }
        renderItem={({ item }) => {
          const vehicle = item.booking.quoteRequest;
          const last = item.messages[0];
          return (
            <Card onPress={() => navigation.navigate("SupportTicket", { ticketId: item.id })}>
              <View style={styles.rowBetween}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Badge label={SUPPORT_STATUS_LABELS[item.status]} tone={TONE[item.status]} />
              </View>
              <Text style={styles.meta}>
                {SUPPORT_REASON_LABELS[item.reason]} · {SERVICE_LABELS[vehicle.serviceType]} ·{" "}
                {vehicle.vehicleMake} {vehicle.vehicleModel}
              </Text>
              <Muted style={styles.who}>
                {isClient
                  ? item.professional.businessName
                  : `${item.client.firstName} ${item.client.lastName}`}
              </Muted>
              {last && !last.isSystem && (
                <Text style={styles.last} numberOfLines={2}>
                  « {last.content} »
                </Text>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.sm },
  lede: { marginTop: spacing.sm },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  subject: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15, flexShrink: 1 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: 6 },
  who: { marginTop: 4, fontSize: 12, color: colors.textMutedDark },
  last: { fontFamily: fonts.body, color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 10 },
});
