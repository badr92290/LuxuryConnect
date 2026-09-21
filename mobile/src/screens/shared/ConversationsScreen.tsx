import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import { Button, Card, EmptyState, Muted, Screen, Subtitle, Title } from "../../components/ui";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Conversation } from "../../types";

/**
 * Messagerie. Le client comme le professionnel n'ont qu'un interlocuteur :
 * LuxuryConnect. Les deux ne se parlent jamais ici — seul un dossier de
 * service après-vente les met en relation directe.
 */
export default function ConversationsScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);

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
    }, [load]),
  );

  function other(c: Conversation) {
    return c.participantA?.id === user?.id ? c.participantB : c.participantA;
  }

  function titleFor(c: Conversation) {
    const o = other(c);
    if (!o) return "Conversation";
    return o.role === "ADMIN" ? "LuxuryConnect" : `${o.firstName} ${o.lastName}`;
  }

  /** Ouvre (ou retrouve) la conversation avec l'intermédiaire. */
  async function openWithAdmin() {
    setOpening(true);
    try {
      const data = await api.post<{ conversation: { id: string } }>("/conversations", {});
      navigation.navigate("Chat", { conversationId: data.conversation.id, title: "LuxuryConnect" });
    } finally {
      setOpening(false);
    }
  }

  return (
    <Screen>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Title>Messages</Title>
            <Subtitle style={styles.lede}>
              Vous échangez directement avec l'équipe LuxuryConnect, votre interlocuteur unique.
            </Subtitle>
            <Button
              title="Écrire à LuxuryConnect"
              onPress={openWithAdmin}
              loading={opening}
              style={{ marginTop: spacing.md }}
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? <EmptyState message="Aucune conversation pour le moment." /> : null
        }
        renderItem={({ item }) => {
          const o = other(item);
          const last = item.messages?.[0];
          return (
            <Card
              onPress={() =>
                navigation.navigate("Chat", { conversationId: item.id, title: titleFor(item) })
              }
            >
              <Text style={styles.name}>{titleFor(item)}</Text>
              {o?.role === "ADMIN" && <Muted style={styles.role}>Votre intermédiaire</Muted>}
              {last && (
                <Text style={styles.preview} numberOfLines={1}>
                  {last.content}
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
  name: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 15 },
  role: { marginTop: 3, fontSize: 12, color: colors.textMutedDark },
  preview: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginTop: 8 },
});
