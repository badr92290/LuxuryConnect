import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
import {
  Badge,
  Body,
  Button,
  Card,
  ErrorText,
  Muted,
  Screen,
  SectionLabel,
  Spinner,
  Title,
} from "../../components/ui";
import { api, ApiError } from "../../api/client";
import {
  QuoteRequest,
  QuoteRequestStatus,
  QUOTE_REQUEST_STATUS_LABELS,
  SERVICE_LABELS,
} from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ClientStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ClientStackParamList, "RequestDetail">;

const TONE: Record<QuoteRequestStatus, "primary" | "muted" | "success" | "danger"> = {
  PENDING_REVIEW: "muted",
  FORWARDED: "muted",
  QUOTED: "primary",
  FINALIZED: "primary",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
};

/** Les états où la demande est encore entre nos mains. */
const IN_PROGRESS: QuoteRequestStatus[] = ["PENDING_REVIEW", "FORWARDED", "QUOTED"];

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ quoteRequest: QuoteRequest }>(`/quote-requests/${requestId}`);
      setRequest(data.quoteRequest);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function decide(action: "accept" | "decline") {
    setActing(true);
    setError(null);
    try {
      // Le rendez-vous est proposé à trois jours ; l'atelier ajuste ensuite.
      const body =
        action === "accept"
          ? { scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString() }
          : undefined;
      await api.post(`/quote-requests/${requestId}/${action}`, body);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Action impossible");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;
  if (!request) {
    return (
      <Screen>
        <View style={styles.container}>
          <ErrorText>Demande introuvable.</ErrorText>
        </View>
      </Screen>
    );
  }

  const pro = request.selectedProfessional;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headRow}>
          <Title style={styles.title}>{SERVICE_LABELS[request.serviceType]}</Title>
          <Badge label={QUOTE_REQUEST_STATUS_LABELS[request.status]} tone={TONE[request.status]} />
        </View>
        <Muted style={styles.vehicle}>
          {request.vehicleMake} {request.vehicleModel}
          {request.vehicleYear ? ` (${request.vehicleYear})` : ""}
          {request.city ? ` · ${request.city}` : ""}
        </Muted>

        {request.description ? (
          <Card style={styles.card}>
            <SectionLabel>Votre demande</SectionLabel>
            <Body style={styles.description}>{request.description}</Body>
          </Card>
        ) : null}

        {IN_PROGRESS.includes(request.status) && (
          <Card style={styles.card}>
            <Body>
              Votre demande est entre nos mains. Nous consultons les ateliers qualifiés et revenons
              vers vous avec une offre unique. Vous n'avez personne à relancer.
            </Body>
          </Card>
        )}

        {request.status === "FINALIZED" && request.finalPrice != null && (
          <Card style={StyleSheet.flatten([styles.card, styles.offerCard])}>
            <SectionLabel style={styles.offerLabel}>Offre reçue</SectionLabel>
            <Text style={styles.price}>{request.finalPrice} €</Text>
            {request.finalMessage ? (
              <Muted style={styles.offerMessage}>{request.finalMessage}</Muted>
            ) : null}

            {pro && (
              <View style={styles.proBlock}>
                <SectionLabel>Prestataire retenu</SectionLabel>
                <Text style={styles.proName}>{pro.businessName}</Text>
                {pro.city ? <Muted>{pro.city}</Muted> : null}
              </View>
            )}

            {error && <ErrorText>{error}</ErrorText>}

            <Button
              title="Accepter l'offre"
              onPress={() => decide("accept")}
              loading={acting}
              style={{ marginTop: spacing.md }}
            />
            <Button
              title="Refuser"
              variant="secondary"
              onPress={() => decide("decline")}
              disabled={acting}
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        )}

        {request.booking && (
          <Card style={styles.card}>
            <SectionLabel style={styles.okLabel}>Réservation confirmée</SectionLabel>
            <Body>
              Rendez-vous le{" "}
              {new Date(request.booking.scheduledAt).toLocaleDateString("fr-FR")} chez{" "}
              {pro?.businessName ?? "l'atelier retenu"}.
            </Body>
            <Button
              title="Voir mes réservations"
              variant="secondary"
              onPress={() => navigation.navigate("ClientTabs")}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        <Button
          title="Écrire à LuxuryConnect"
          variant="secondary"
          onPress={async () => {
            const data = await api.post<{ conversation: { id: string } }>("/conversations", {});
            navigation.navigate("Chat", {
              conversationId: data.conversation.id,
              title: "LuxuryConnect",
            });
          }}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xl },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: { flexShrink: 1 },
  vehicle: { marginTop: spacing.sm, fontSize: 14 },
  card: { marginTop: spacing.lg },
  description: { fontSize: 14, marginTop: 6 },
  offerCard: { borderColor: "rgba(201,168,118,0.3)" },
  offerLabel: { color: colors.primary },
  price: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.6,
    color: colors.text,
    marginTop: 6,
  },
  offerMessage: { marginTop: spacing.sm, fontSize: 14 },
  proBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  proName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, marginTop: 4 },
  okLabel: { color: colors.success },
});
