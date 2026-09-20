import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Screen } from "../../components/ui";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Conversation } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { ClientTabParamList, ClientStackParamList, ProTabParamList, ProStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<ClientTabParamList | ProTabParamList, any>,
  NativeStackScreenProps<ClientStackParamList | ProStackParamList>
>;

export default function ConversationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ conversations: Conversation[] }>("/conversations");
      setConversations(data.conversations);
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
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.sm }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucune conversation pour le moment.</Text> : null}
        renderItem={({ item }) => {
          const title =
            user?.role === "CLIENT" ? item.professional?.businessName : `${item.client?.firstName} ${item.client?.lastName}`;
          const lastMessage = item.messages?.[0];
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("Chat", { conversationId: item.id, title: title ?? "" })}
            >
              <Text style={styles.name}>{title}</Text>
              {lastMessage && (
                <Text style={styles.preview} numberOfLines={1}>
                  {lastMessage.content}
                </Text>
              )}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.md,
  },
  name: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
  preview: { fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
