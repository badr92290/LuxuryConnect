import React, { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "../../theme/colors";
import { Button, Muted, Screen, Subtitle, Title } from "../../components/ui";
import { IconPlus } from "../../components/icons";

const CONTACT_EMAIL = "contact@luxuryconnect.fr";

const FAQ = [
  {
    q: "Comment se passe une demande ?",
    a: "Vous décrivez votre besoin une seule fois. Nous consultons les ateliers qualifiés de votre région, nous comparons leurs prix, et nous revenons vers vous avec une offre unique. Vous n'avez personne à appeler.",
  },
  {
    q: "Pourquoi je ne choisis pas l'atelier moi-même ?",
    a: "C'est le principe : nous sommes votre interlocuteur unique. Nous sélectionnons l'atelier adapté à votre véhicule et à votre prestation, après avoir vérifié son assurance et ses certifications. Vous découvrez son nom au moment où vous acceptez l'offre.",
  },
  {
    q: "Le prix annoncé peut-il changer ?",
    a: "Non. Le prix que nous vous transmettons est ferme et comprend tout. Il n'est révisé que si l'état réel du véhicule diffère sensiblement de votre description — et jamais sans votre accord.",
  },
  {
    q: "Un défaut apparaît après la prestation, que faire ?",
    a: "Ouvrez un dossier de service après-vente depuis la réservation concernée. Là, et seulement là, vous échangez directement avec l'atelier qui a posé : c'est lui qui garantit son travail. Sans réponse sous trois jours, nous reprenons la main sans que vous ayez à le demander.",
  },
  {
    q: "Puis-je vous appeler en renfort sur un dossier SAV ?",
    a: "Oui, à tout moment. Un bouton « Demander l'assistance LuxuryConnect » figure dans chaque dossier. Nous rejoignons alors la discussion.",
  },
  {
    q: "Quelles prestations proposez-vous ?",
    a: "PPF satin, PPF coloré, PPF brillant, covering, céramique et vitres teintées.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.item}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.itemHead}
      >
        <Text style={styles.question}>{q}</Text>
        <View style={open ? styles.iconOpen : undefined}>
          <IconPlus size={18} color={colors.primary} />
        </View>
      </Pressable>
      {open && <Text style={styles.answer}>{a}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Title>Assistance</Title>
        <Subtitle style={styles.lede}>
          Les réponses aux questions qui reviennent le plus souvent. Si la vôtre n'y est pas,
          écrivez-nous.
        </Subtitle>

        <View style={styles.list}>
          {FAQ.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </View>

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Besoin d'une réponse sur votre dossier ?</Text>
          <Muted style={styles.contactBody}>
            Écrivez-nous : nous répondons sous 24 à 48 heures ouvrées.
          </Muted>
          <Button
            title="Nous écrire"
            onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
            style={{ marginTop: spacing.lg }}
          />
          <Muted style={styles.email}>{CONTACT_EMAIL}</Muted>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.gutter, paddingBottom: spacing.xl },
  lede: { marginTop: spacing.sm },
  list: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.hairline },
  item: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  itemHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  question: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text, flexShrink: 1 },
  iconOpen: { transform: [{ rotate: "45deg" }] },
  answer: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    paddingBottom: spacing.md,
  },
  contact: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(201,168,118,0.25)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  contactTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text, textAlign: "center" },
  contactBody: { marginTop: spacing.sm, textAlign: "center", fontSize: 14 },
  email: { marginTop: spacing.md, fontSize: 13, color: colors.primary },
});
