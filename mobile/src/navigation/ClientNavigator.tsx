import React from "react";
import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/colors";
import SearchScreen from "../screens/client/SearchScreen";
import MyQuotesScreen from "../screens/client/MyQuotesScreen";
import MyBookingsScreen from "../screens/client/MyBookingsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import ProfessionalDetailScreen from "../screens/client/ProfessionalDetailScreen";
import QuoteRequestFormScreen from "../screens/client/QuoteRequestFormScreen";
import LeaveReviewScreen from "../screens/client/LeaveReviewScreen";
import type { ClientTabParamList, ClientStackParamList } from "./types";

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createNativeStackNavigator<ClientStackParamList>();

const TAB_ICONS: Record<keyof ClientTabParamList, string> = {
  Search: "🔍",
  MyQuotes: "📋",
  MyBookings: "📅",
  Messages: "💬",
  Profile: "👤",
};

function ClientTabs() {
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
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "Recherche" }} />
      <Tab.Screen name="MyQuotes" component={MyQuotesScreen} options={{ title: "Devis" }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "Réservations" }} />
      <Tab.Screen name="Messages" component={ConversationsScreen} options={{ title: "Messages" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ClientTabs" component={ClientTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProfessionalDetail"
        component={ProfessionalDetailScreen}
        options={{ title: "Profil professionnel" }}
      />
      <Stack.Screen
        name="QuoteRequestForm"
        component={QuoteRequestFormScreen}
        options={{ title: "Demande de devis" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Message" }} />
      <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} options={{ title: "Avis" }} />
    </Stack.Navigator>
  );
}
