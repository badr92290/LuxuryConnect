import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing } from "../../theme/colors";
import { Badge, Button, Card, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { Booking } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ClientTabParamList, ClientStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, "MyBookings">,
  NativeStackScreenProps<ClientStackParamList>
>;

const STATUS_LABELS: Record<Booking["status"], string> = {
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export default function MyBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mes réservations</Text>
      </View>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune réservation pour le moment.</Text> : null}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.businessName}>{item.professional?.businessName}</Text>
              <Badge label={STATUS_LABELS[item.status]} />
            </View>
            <Text style={styles.meta}>Rendez-vous le {new Date(item.scheduledAt).toLocaleDateString("fr-FR")}</Text>
            {item.status === "COMPLETED" && !item.review && (
              <Button
                title="Laisser un avis"
                variant="secondary"
                style={{ marginTop: spacing.sm }}
                onPress={() =>
                  navigation.navigate("LeaveReview", {
                    bookingId: item.id,
                    businessName: item.professional?.businessName ?? "",
                  })
                }
              />
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
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
