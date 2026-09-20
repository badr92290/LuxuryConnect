import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { colors, radius, spacing } from "../theme/colors";
import { SERVICE_LABELS, ServiceType } from "../types";
import { StarRating } from "./ui";

export type PublicReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: string;
  serviceType: ServiceType;
  vehicle: string;
  city: string | null;
};

export type PublicReviews = {
  summary: { average: number | null; count: number };
  reviews: PublicReview[];
};

/** Charge la vitrine publique des avis. Renvoie `null` tant que rien n'est arrivé. */
export function usePublicReviews(limit = 10) {
  const [data, setData] = useState<PublicReviews | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PublicReviews>(`/reviews/public?limit=${limit}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ summary: { average: null, count: 0 }, reviews: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return data;
}

export function reviewMeta(review: PublicReview): string {
  return [SERVICE_LABELS[review.serviceType], review.vehicle, review.city]
    .filter(Boolean)
    .join(" · ");
}

export function ReviewCard({
  review,
  style,
  metaLines = 1,
}: {
  review: PublicReview;
  style?: any;
  metaLines?: number;
}) {
  return (
    <View style={[styles.card, style]}>
      <StarRating rating={review.rating} />
      <Text style={styles.quote} numberOfLines={5}>
        « {review.comment} »
      </Text>
      <View>
        <Text style={styles.author}>{review.author}</Text>
        <Text style={styles.meta} numberOfLines={metaLines}>
          {reviewMeta(review)}
        </Text>
      </View>
    </View>
  );
}

/** Bandeau horizontal d'avis, pensé pour tenir sous le pli de l'écran d'accueil. */
export function ClientReviewsStrip({ onSeeAll }: { onSeeAll?: () => void }) {
  const data = usePublicReviews(10);
  if (!data || data.reviews.length === 0) return null;

  const { average, count } = data.summary;

  return (
    <View style={styles.strip}>
      <View style={styles.header}>
        <Text style={styles.title}>Avis clients</Text>
        <View style={styles.score}>
          {average !== null && (
            <>
              <Text style={styles.average}>{average.toFixed(1).replace(".", ",")}</Text>
              <Text style={styles.outOf}>/ 5</Text>
            </>
          )}
          <Text style={styles.count} numberOfLines={1}>
            · {count} avis
          </Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={data.reviews}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={272}
        decelerationRate="fast"
        renderItem={({ item }) => <ReviewCard review={item} style={styles.stripCard} />}
      />

      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAll} hitSlop={8}>
          <Text style={styles.seeAllText}>Voir tous les avis →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { marginTop: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: { fontSize: 16, fontWeight: "600", color: colors.text },
  score: { flexDirection: "row", alignItems: "baseline", gap: 5, flexShrink: 1 },
  average: { fontSize: 20, fontWeight: "700", color: colors.text },
  outOf: { fontSize: 11, color: colors.textMuted },
  count: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.6 },
  list: { gap: spacing.md, paddingRight: spacing.md },
  stripCard: { width: 256 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  quote: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: "italic",
    color: colors.text,
  },
  author: { fontSize: 13, fontWeight: "700", color: colors.text },
  meta: {
    marginTop: 3,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  seeAll: { marginTop: spacing.md, alignSelf: "flex-start", paddingVertical: 6 },
  seeAllText: { fontSize: 13, fontWeight: "600", color: colors.primary },
});
