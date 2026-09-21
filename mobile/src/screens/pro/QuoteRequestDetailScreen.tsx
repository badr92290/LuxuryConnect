import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, fonts, spacing } from "../../theme/colors";
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
      <ScrollView contentContainerStyle={{ padding: spacing.gutter, gap: spacing.md }}>
        <Card>
          {/* L'identité du client ne vous est transmise qu'une fois l'offre
              acceptée : ici, la demande se lit par sa prestation. */}
          <Badge label={SERVICE_LABELS[quoteRequest.serviceType]} />
          <Text style={styles.vehicle}>
            {quoteRequest.vehicleMake} {quoteRequest.vehicleModel}
            {quoteRequest.vehicleYear ? ` (${quoteRequest.vehicleYear})` : ""}
          </Text>
          {quoteRequest.city ? <Text style={styles.meta}>{quoteRequest.city}</Text> : null}
          {quoteRequest.description ? (
            <Text style={styles.description}>{quoteRequest.description}</Text>
          ) : null}
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

        {quoteRequest.status === "FORWARDED" || quoteRequest.status === "QUOTED" ? (
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
  vehicle: { fontFamily: fonts.bodySemi, color: colors.text, fontSize: 17, marginTop: spacing.md },
  meta: { fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  description: { fontFamily: fonts.body, color: colors.text, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.display, color: colors.text, fontSize: 20 },
  price: { fontFamily: fonts.bodyBold, color: colors.primary, fontSize: 18 },
});
