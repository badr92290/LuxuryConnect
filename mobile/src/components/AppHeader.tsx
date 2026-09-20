import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme/colors";
import { IconLogout } from "./icons";
import { Wordmark } from "./ui";
import { useAuth } from "../context/AuthContext";

/**
 * En-tête des onglets : mot-symbole à gauche, déconnexion à droite —
 * exactement le bandeau mobile de l'`AppShell` du site.
 */
export function HeaderWordmark() {
  return (
    <View style={styles.left}>
      <Wordmark size={18} />
    </View>
  );
}

export function HeaderActions() {
  const { logout } = useAuth();
  return (
    <Pressable
      onPress={logout}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Se déconnecter"
      style={styles.action}
    >
      <IconLogout size={18} color={colors.textMutedDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  left: { paddingLeft: spacing.xs },
  action: { padding: spacing.sm, marginRight: spacing.xs },
});
