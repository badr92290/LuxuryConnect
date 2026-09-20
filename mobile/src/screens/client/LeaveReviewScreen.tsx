import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Button, Input, Screen } from "../../components/ui";
import { api, ApiError } from "../../api/client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "LeaveReview">;

export default function LeaveReviewScreen({ route, navigation }: Props) {
  const { bookingId, businessName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.post("/reviews", { bookingId, rating, comment: comment || undefined });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer l'avis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ padding: spacing.gutter }}>
        <Text style={styles.title}>Laisser un avis</Text>
        <Text style={styles.subtitle}>{businessName}</Text>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => setRating(i)}>
              <Text style={[styles.star, { color: i <= rating ? colors.accent : colors.border }]}>★</Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Commentaire (optionnel)"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: "top" }}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title="Envoyer l'avis" onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  subtitle: { fontFamily: fonts.body, color: colors.textMuted, marginBottom: spacing.lg },
  stars: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  star: { fontFamily: fonts.body, fontSize: 36 },
  error: { color: colors.danger, marginBottom: spacing.md },
});
