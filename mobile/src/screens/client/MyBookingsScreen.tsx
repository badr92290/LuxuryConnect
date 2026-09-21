import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Badge, Button, Card, EmptyState, Screen, Title } from "../../components/ui";
import { api } from "../../api/client";
import { Booking, ClientPayment, formatAmount } from "../../types";
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
  // État de paiement par réservation, pour savoir s'il reste à régler.
  const [payments, setPayments] = useState<Record<string, ClientPayment | null>>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ bookings: Booking[] }>("/bookings");
      setBookings(data.bookings);

      const states = await Promise.all(
        data.bookings.map((b) =>
          api
            .get<{ payment: ClientPayment | null }>(`/payments/bookings/${b.id}`)
            .then((r) => [b.id, r.payment] as const)
            .catch(() => [b.id, null] as const),
        ),
      );
      setPayments(Object.fromEntries(states));
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
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListHeaderComponent={<Title style={styles.title}>Mes réservations</Title>}
        ListEmptyComponent={
          !loading ? <EmptyState message="Aucune réservation pour le moment." /> : null
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.businessName}>{item.professional?.businessName}</Text>
              <Badge label={STATUS_LABELS[item.status]} />
            </View>
            <Text style={styles.meta}>
              Rendez-vous le {new Date(item.scheduledAt).toLocaleDateString("fr-FR")} ·{" "}
              {formatAmount(Math.round(item.price * 100))}
            </Text>

            {payments[item.id]?.status === "PAID" ? (
              <Text style={styles.paid}>
                Réglé
                {payments[item.id]?.paymentMethodLabel
                  ? ` · ${payments[item.id]?.paymentMethodLabel}`
                  : ""}
              </Text>
            ) : (
              item.status !== "CANCELLED" && (
                <Button
                  title={`Régler ${formatAmount(Math.round(item.price * 100))}`}
                  style={{ marginTop: spacing.md }}
                  onPress={() => navigation.navigate("Payment", { bookingId: item.id })}
                />
              )
            )}
            {item.status === "COMPLETED" && (
              <>
                {!item.review && (
                  <Button
                    title="Laisser un avis"
                    variant="secondary"
                    style={{ marginTop: spacing.md }}
                    onPress={() =>
                      navigation.navigate("LeaveReview", {
                        bookingId: item.id,
                        businessName: item.professional?.businessName ?? "",
                      })
                    }
                  />
                )}
                <Button
                  title="Un souci ? Ouvrir un dossier SAV"
                  variant="secondary"
                  style={{ marginTop: spacing.sm }}
                  onPress={() =>
                    navigation.navigate("NewSupportTicket", {
                      bookingId: item.id,
                      businessName: item.professional?.businessName ?? "l'atelier",
                    })
                  }
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
  businessName: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15, flexShrink: 1 },
  meta: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginTop: 6 },
  paid: { fontFamily: fonts.bodySemi, color: colors.success, fontSize: 14, marginTop: 10 },
});
