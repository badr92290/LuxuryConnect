import React from "react";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { colors, fonts } from "../theme/colors";
import { HeaderActions, HeaderWordmark } from "../components/AppHeader";

/**
 * En-têtes et barre d'onglets calqués sur l'`AppShell` du site :
 * filet `hairline`, fond `surface`, actif doré, inactif `mutedDark`.
 */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export const tabScreenOptions: BottomTabNavigationOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerTitle: () => <HeaderWordmark />,
  headerTitleAlign: "left",
  headerRight: () => <HeaderActions />,
  headerShadowVisible: false,
  sceneStyle: { backgroundColor: colors.background },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.hairline,
    borderTopWidth: 1,
    height: 62,
    paddingTop: 6,
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMutedDark,
  tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.3 },
};
