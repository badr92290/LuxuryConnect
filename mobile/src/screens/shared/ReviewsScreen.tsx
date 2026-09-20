import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Screen, StarRating } from "../../components/ui";
import { ReviewCard, usePublicReviews } from "../../components/ClientReviews";
import { colors, spacing } from "../../theme/colors";

/** Liste complète des avis publiés, accessible depuis l'accueil et le profil. */
export default function ReviewsScreen() {
  const data = usePublicReviews(30);

  return (
    <Screen>
      <FlatList
        data={data?.reviews ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Ce qu'en disent nos clients</Text>
            <Text style={styles.subtitle}>
              Chaque avis provient d'une prestation réellement réalisée via LuxuryConnect.
            </Text>
            {data?.summary.average != null && (
              <View style={styles.score}>
                <Text style={styles.average}>
                  {data.summary.average.toFixed(1).replace(".", ",")}
                </Text>
                <Text style={styles.outOf}>/ 5</Text>
                <StarRating rating={data.summary.average} />
                <Text style={styles.count}>{data.summary.count} avis vérifiés</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => <ReviewCard review={item} style={styles.card} metaLines={2} />}
        ListEmptyComponent={
          data ? <Text style={styles.empty}>Aucun avis publié pour le moment.</Text> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
  header: { marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: "600", color: colors.text },
  subtitle: { marginTop: spacing.sm, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  score: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.md },
  average: { fontSize: 30, fontWeight: "700", color: colors.text },
  outOf: { fontSize: 12, color: colors.textMuted },
  count: { fontSize: 11, letterSpacing: 0.7, color: colors.textMuted },
  card: { minHeight: 150 },
  empty: { textAlign: "center", color: colors.textMuted, paddingVertical: spacing.xl },
});
