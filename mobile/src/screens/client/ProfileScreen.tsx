import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme/colors";
import { Button, Card, Screen } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <View style={{ padding: spacing.md, gap: spacing.md }}>
        <Text style={styles.title}>Mon profil</Text>
        <Card>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.phone && <Text style={styles.email}>{user.phone}</Text>}
        </Card>
        <Button title="Se déconnecter" variant="secondary" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  email: { color: colors.textMuted, marginTop: 4 },
});
