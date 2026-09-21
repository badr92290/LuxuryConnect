import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io, Socket } from "socket.io-client";
import { colors, fonts, radius, spacing } from "../../theme/colors";
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Input,
  Muted,
  Screen,
  SectionLabel,
  Spinner,
} from "../../components/ui";
import { api, ApiError, getToken } from "../../api/client";
import { API_BASE_URL } from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import {
  SERVICE_LABELS,
  SUPPORT_REASON_LABELS,
  SUPPORT_STATUS_LABELS,
  SupportMessage,
  SupportTicket,
  SupportTicketStatus,
} from "../../types";

const TONE: Record<SupportTicketStatus, "primary" | "muted" | "success" | "danger"> = {
  OPEN: "primary",
  IN_PROGRESS: "primary",
  ESCALATED: "danger",
  RESOLVED: "success",
};

/**
 * Fil d'un dossier SAV : le client et l'atelier s'écrivent ici sans
 * intermédiaire. Les messages du système sont centrés et atténués pour
 * qu'on ne les prenne pas pour une parole humaine.
 */
export default function SupportTicketScreen({ route, navigation }: { route: any; navigation: any }) {
  const { ticketId } = route.params as { ticketId: string };
  const { user } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ ticket: SupportTicket }>(`/support/${ticketId}`);
      setTicket(data.ticket);
      setMessages(data.ticket.messages);
      navigation.setOptions({ title: data.ticket.subject });
    } finally {
      setLoading(false);
    }
  }, [ticketId, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  // Le pied de liste porte les actions du dossier : on descend jusqu'à lui
  // à chaque nouveau message, sinon elles restent hors écran.
  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    let socket: Socket;
    (async () => {
      const token = await getToken();
      socket = io(API_BASE_URL, { auth: { token } });
      socketRef.current = socket;
      socket.emit("join_support", ticketId);
      socket.on("support_message", (message: SupportMessage) => {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      });
    })();
    return () => {
      socket?.disconnect();
    };
  }, [ticketId]);

  async function send() {
    const content = draft.trim();
    if (!content) return;
    setError(null);
    try {
      const { message } = await api.post<{ message: SupportMessage }>(
        `/support/${ticketId}/messages`,
        { content },
      );
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setDraft("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Message non envoyé");
    }
  }

  async function act(path: "escalate" | "resolve") {
    setActing(true);
    setError(null);
    try {
      const data = await api.post<{ ticket: SupportTicket }>(`/support/${ticketId}/${path}`);
      setTicket(data.ticket);
      setMessages(data.ticket.messages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action impossible");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;
  if (!ticket) {
    return (
      <Screen>
        <View style={{ padding: spacing.gutter }}>
          <ErrorText>Dossier introuvable.</ErrorText>
        </View>
      </Screen>
    );
  }

  const vehicle = ticket.booking.quoteRequest;
  const isClient = user?.id === ticket.clientId;
  const isPro = user?.id === ticket.professional.user.id;
  const closed = ticket.status === "RESOLVED";
  const phone = isPro ? ticket.client.phone : ticket.professional.user.phone;

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
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headRow}>
                <Text style={styles.subject}>{ticket.subject}</Text>
                <Badge label={SUPPORT_STATUS_LABELS[ticket.status]} tone={TONE[ticket.status]} />
              </View>
              <Muted style={styles.meta}>
                {SUPPORT_REASON_LABELS[ticket.reason]} · {SERVICE_LABELS[vehicle.serviceType]} ·{" "}
                {vehicle.vehicleMake} {vehicle.vehicleModel}
              </Muted>

              <Card style={styles.contactCard}>
                <SectionLabel>{isPro ? "Votre client" : "Votre interlocuteur"}</SectionLabel>
                <Text style={styles.contactName}>
                  {isPro
                    ? `${ticket.client.firstName} ${ticket.client.lastName}`
                    : ticket.professional.businessName}
                </Text>
                {phone ? (
                  <Text
                    style={styles.contactLink}
                    onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, "")}`)}
                  >
                    {phone}
                  </Text>
                ) : null}
                {!isPro && (
                  <Muted style={styles.contactNote}>
                    Pour le service après-vente, vous échangez directement avec l'atelier : c'est
                    lui qui a réalisé la pose et qui la garantit. LuxuryConnect reste joignable si
                    l'échange n'avance pas.
                  </Muted>
                )}
              </Card>
            </View>
          }
          renderItem={({ item }) => {
            if (item.isSystem) {
              return (
                <View style={styles.systemRow}>
                  <Text style={styles.systemText}>{item.content}</Text>
                </View>
              );
            }
            const mine = item.senderId === user?.id;
            const author =
              item.sender?.role === "ADMIN"
                ? "Assistance LuxuryConnect"
                : item.sender?.role === "PROFESSIONAL"
                  ? ticket.professional.businessName
                  : `${item.sender?.firstName ?? ""} ${item.sender?.lastName ?? ""}`.trim();
            return (
              <View style={mine ? styles.mineRow : styles.theirRow}>
                <View style={{ maxWidth: "82%" }}>
                  {!mine && <Text style={styles.author}>{author}</Text>}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={styles.bubbleText}>{item.content}</Text>
                  </View>
                  <Text style={[styles.time, mine && styles.timeRight]}>
                    {new Date(item.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              {error && <ErrorText>{error}</ErrorText>}
              {closed ? (
                <Body style={styles.closed}>
                  Ce dossier est clos. Ouvrez-en un nouveau si le problème réapparaît.
                </Body>
              ) : (
                <>
                  {!ticket.escalatedAt && (
                    <Button
                      title="Demander l'assistance LuxuryConnect"
                      variant="secondary"
                      onPress={() => act("escalate")}
                      disabled={acting}
                    />
                  )}
                  {isClient && (
                    <Button
                      title="Mon problème est réglé"
                      variant="secondary"
                      onPress={() => act("resolve")}
                      disabled={acting}
                      style={{ marginTop: spacing.sm }}
                    />
                  )}
                </>
              )}
            </View>
          }
        />

        {!closed && (
          <View style={styles.composer}>
            <Input
              value={draft}
              onChangeText={setDraft}
              placeholder="Écrivez votre message…"
              containerStyle={{ flex: 1, marginBottom: 0 }}
              multiline
            />
            <Button title="Envoyer" onPress={send} style={styles.sendButton} />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.gutter, gap: spacing.sm },
  header: { marginBottom: spacing.md },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  subject: { fontFamily: fonts.display, fontSize: 22, color: colors.text, flexShrink: 1 },
  meta: { marginTop: 6, fontSize: 13 },
  contactCard: { marginTop: spacing.md },
  contactName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, marginTop: 4 },
  contactLink: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  contactNote: { marginTop: spacing.md, fontSize: 12, color: colors.textMutedDark },

  systemRow: { alignItems: "center", marginVertical: spacing.xs },
  systemText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: colors.textMutedDark,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },

  mineRow: { alignItems: "flex-end" },
  theirRow: { alignItems: "flex-start" },
  author: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.textMutedDark,
    marginBottom: 4,
  },
  bubble: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 11 },
  bubbleMine: { backgroundColor: "rgba(201,168,118,0.18)" },
  bubbleTheirs: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.hairline },
  bubbleText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  time: { fontFamily: fonts.body, fontSize: 10, color: colors.textMutedDark, marginTop: 4 },
  timeRight: { textAlign: "right" },

  footer: { marginTop: spacing.lg },
  closed: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.gutter,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  sendButton: { paddingHorizontal: spacing.md },
});
