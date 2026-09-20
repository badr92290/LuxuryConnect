import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { io, Socket } from "socket.io-client";
import { colors, fonts, radius, spacing } from "../../theme/colors";
import { Input, Button, Screen } from "../../components/ui";
import { api, getToken } from "../../api/client";
import { API_BASE_URL } from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { Message } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList, ProStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList | ProStackParamList, "Chat">;

export default function ChatScreen({ route, navigation }: Props) {
  const { conversationId, title } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  useEffect(() => {
    api.get<{ messages: Message[] }>(`/conversations/${conversationId}/messages`).then((data) => {
      setMessages(data.messages);
    });
  }, [conversationId]);

  useEffect(() => {
    let socket: Socket;
    (async () => {
      const token = await getToken();
      socket = io(API_BASE_URL, { auth: { token } });
      socketRef.current = socket;
      socket.emit("join_conversation", conversationId);
      socket.on("new_message", (message: Message) => {
        if (message.conversationId !== conversationId) return;
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      });
    })();
    return () => {
      socket?.disconnect();
    };
  }, [conversationId]);

  function send() {
    if (!text.trim()) return;
    socketRef.current?.emit("send_message", { conversationId, content: text.trim() });
    setText("");
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.gutter, gap: spacing.sm }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const mine = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={mine ? styles.textMine : styles.textTheirs}>{item.content}</Text>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Input value={text} onChangeText={setText} placeholder="Écrivez un message..." style={{ marginBottom: 0 }} />
          </View>
          <Button title="Envoyer" onPress={send} style={styles.sendButton} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  bubbleTheirs: {
    backgroundColor: colors.surfaceAlt,
    alignSelf: "flex-start",
  },
  textMine: { color: colors.background },
  textTheirs: { fontFamily: fonts.body, color: colors.text },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sendButton: { paddingVertical: 12, paddingHorizontal: spacing.md },
});
