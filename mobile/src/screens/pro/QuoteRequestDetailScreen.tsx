import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing } from "../../theme/colors";
import { Badge, Button, Card, Input, Screen } from "../../components/ui";
import { api } from "../../api/client";
import { QuoteRequest, SERVICE_LABELS } from "../../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ProStackParamList, "QuoteRequestDetail">;

export default function QuoteRequestDetailScreen({ route }: Props) {
  const { quoteRequestId } = route.params;
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await api.get<{ quoteRequest: QuoteRequest }>(`/quote-requests/${quoteRequestId}`);
    setQuoteRequest(data.quoteRequest);
  }, [quoteRequestId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function submitQuote() {
    if (!price) return;
    setLoading(true);
    try {
      await api.post(`/quote-requests/${quoteRequestId}/quotes`, {
        price: parseFloat(price),
        message: message || undefined,
      });
      setPrice("");
      setMessage("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  if (!quoteRequest) return null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Card>
          <Text style={styles.clientName}>
            {quoteRequest.client?.firstName} {quoteRequest.client?.lastName}
          </Text>
          {quoteRequest.client?.phone && <Text style={styles.meta}>{quoteRequest.client.phone}</Text>}
          <View style={{ marginTop: spacing.sm }}>
            <Badge label={SERVICE_LABELS[quoteRequest.serviceType]} />
          </View>
          <Text style={styles.meta}>
            Véhicule : {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
            {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""}
          </Text>
          {quoteRequest.description && <Text style={styles.description}>{quoteRequest.description}</Text>}
        </Card>

        {quoteRequest.quotes && quoteRequest.quotes.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Devis envoyés</Text>
            {quoteRequest.quotes.map((q) => (
              <Card key={q.id} style={{ marginTop: spacing.sm }}>
                <Text style={styles.price}>{q.price} €</Text>
                {q.message && <Text style={styles.meta}>{q.message}</Text>}
                <Badge label={q.status} />
              </Card>
            ))}
          </View>
        )}

        {quoteRequest.status === "PENDING" || quoteRequest.status === "QUOTED" ? (
          <View>
            <Text style={styles.sectionTitle}>Proposer un devis</Text>
            <Input label="Prix (€)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="890" />
            <Input
              label="Message (optionnel)"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: "top" }}
            />
            <Button title="Envoyer le devis" onPress={submitQuote} loading={loading} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clientName: { color: colors.text, fontWeight: "700", fontSize: 18 },
  meta: { color: colors.textMuted, marginTop: 4 },
  description: { color: colors.text, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  price: { color: colors.primary, fontWeight: "700", fontSize: 18 },
});
