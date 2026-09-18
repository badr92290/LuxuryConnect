import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/colors";
import RequestsScreen from "../screens/pro/RequestsScreen";
import ProBookingsScreen from "../screens/pro/ProBookingsScreen";
import ProProfileScreen from "../screens/pro/ProProfileScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import QuoteRequestDetailScreen from "../screens/pro/QuoteRequestDetailScreen";
import type { ProTabParamList, ProStackParamList } from "./types";

const Tab = createBottomTabNavigator<ProTabParamList>();
const Stack = createNativeStackNavigator<ProStackParamList>();

const TAB_ICONS: Record<keyof ProTabParamList, string> = {
  Requests: "📋",
  ProBookings: "📅",
  Messages: "💬",
  ProProfile: "👤",
};

function ProTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Requests" component={RequestsScreen} options={{ title: "Demandes" }} />
      <Tab.Screen name="ProBookings" component={ProBookingsScreen} options={{ title: "Réservations" }} />
      <Tab.Screen name="Messages" component={ConversationsScreen} options={{ title: "Messages" }} />
      <Tab.Screen name="ProProfile" component={ProProfileScreen} options={{ title: "Profil" }} />
    </Tab.Navigator>
  );
}

export default function ProNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ProTabs" component={ProTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="QuoteRequestDetail"
        component={QuoteRequestDetailScreen}
        options={{ title: "Demande de devis" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Message" }} />
    </Stack.Navigator>
  );
}
