import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { stackScreenOptions, tabScreenOptions } from "./screenOptions";
import {
  IconCalendar,
  IconInbox,
  IconMessage,
  IconUser,
  type IconProps,
} from "../components/icons";
import RequestsScreen from "../screens/pro/RequestsScreen";
import ProBookingsScreen from "../screens/pro/ProBookingsScreen";
import ProProfileScreen from "../screens/pro/ProProfileScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import QuoteRequestDetailScreen from "../screens/pro/QuoteRequestDetailScreen";
import type { ProTabParamList, ProStackParamList } from "./types";

const Tab = createBottomTabNavigator<ProTabParamList>();
const Stack = createNativeStackNavigator<ProStackParamList>();

const TAB_ICONS: Record<keyof ProTabParamList, React.ComponentType<IconProps>> = {
  Requests: IconInbox,
  ProBookings: IconCalendar,
  Messages: IconMessage,
  ProProfile: IconUser,
};

function ProTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = TAB_ICONS[route.name];
        return {
          ...tabScreenOptions,
          tabBarIcon: ({ color }) => <Icon size={21} color={color} />,
        };
      }}
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
      screenOptions={stackScreenOptions}
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
