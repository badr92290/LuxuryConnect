import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "../../theme/colors";
import { Badge, Input, Screen, StarRating } from "../../components/ui";
import { api } from "../../api/client";
import { ProfessionalProfile, ServiceType, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ClientTabParamList, ClientStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList, "Search">,
  NativeStackScreenProps<ClientStackParamList>
>;

const SERVICES: ServiceType[] = ["PPF", "COVERING", "CERAMIC", "TINT", "POLISH"];

export default function SearchScreen({ navigation }: Props) {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [service, setService] = useState<ServiceType | null>(null);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (service) params.set("service", service);
      if (city) params.set("city", city);
      const data = await api.get<{ professionals: ProfessionalProfile[] }>(
        `/professionals?${params.toString()}`
      );
      setProfessionals(data.professionals);
    } catch {
      // ignore for MVP
    } finally {
      setLoading(false);
    }
  }, [service, city]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Trouver un professionnel</Text>
        <Input placeholder="Ville (ex: Lyon)" value={city} onChangeText={setCity} onSubmitEditing={load} />
        <FlatList
          data={SERVICES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setService(service === item ? null : item)}
              style={[styles.chip, service === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, service === item && styles.chipTextActive]}>
                {SERVICE_LABELS[item]}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={professionals}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>Aucun professionnel trouvé pour ces critères.</Text> : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("ProfessionalDetail", { professionalId: item.id })}
          >
            {item.portfolioImages?.[0] && (
              <Image source={{ uri: item.portfolioImages[0].imageUrl }} style={styles.image} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.businessName}>{item.businessName}</Text>
              <Text style={styles.city}>{item.city}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                <StarRating rating={item.averageRating} />
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
              </View>
              <View style={styles.badgeRow}>
                {item.services?.slice(0, 3).map((s) => (
                  <Badge key={s.id} label={SERVICE_LABELS[s.serviceType]} />
                ))}
              </View>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.background,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.md,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  businessName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  city: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  reviewCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.xs,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
