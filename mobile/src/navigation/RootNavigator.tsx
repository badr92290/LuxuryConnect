import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { colors, fonts } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import ClientNavigator from "./ClientNavigator";
import ProNavigator from "./ProNavigator";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.hairline,
    primary: colors.primary,
  },
  fonts: {
    ...DarkTheme.fonts,
    regular: { fontFamily: fonts.body, fontWeight: "400" as const },
    medium: { fontFamily: fonts.bodyMedium, fontWeight: "500" as const },
    bold: { fontFamily: fonts.bodySemi, fontWeight: "600" as const },
    heavy: { fontFamily: fonts.bodyBold, fontWeight: "700" as const },
  },
};

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {!user ? <AuthNavigator /> : user.role === "CLIENT" ? <ClientNavigator /> : <ProNavigator />}
    </NavigationContainer>
  );
}
