import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Button, Card, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { Booking } from "../../types";

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function ProBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[] }>("/bookings");
      setBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function markCompleted(id: string) {
    setUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}`, { status: "COMPLETED" });
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Réservations</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune réservation pour le moment.</Text> : null}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.clientName}>
                {item.client?.firstName} {item.client?.lastName}
              </Text>
              <Badge label={STATUS_LABELS[item.status]} />
            </View>
            <Text style={styles.meta}>Rendez-vous le {new Date(item.scheduledAt).toLocaleDateString("fr-FR")}</Text>
            {item.status === "CONFIRMED" && (
              <Button
                title="Marquer comme terminée"
                variant="secondary"
                style={{ marginTop: spacing.sm }}
                onPress={() => markCompleted(item.id)}
                loading={updatingId === item.id}
              />
            )}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
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
