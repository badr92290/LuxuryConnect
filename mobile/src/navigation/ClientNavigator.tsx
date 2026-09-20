import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { stackScreenOptions, tabScreenOptions } from "./screenOptions";
import {
  IconCalendar,
  IconList,
  IconMessage,
  IconSearch,
  IconUser,
  type IconProps,
} from "../components/icons";
import SearchScreen from "../screens/client/SearchScreen";
import MyQuotesScreen from "../screens/client/MyQuotesScreen";
import MyBookingsScreen from "../screens/client/MyBookingsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import ProfessionalDetailScreen from "../screens/client/ProfessionalDetailScreen";
import QuoteRequestFormScreen from "../screens/client/QuoteRequestFormScreen";
import LeaveReviewScreen from "../screens/client/LeaveReviewScreen";
import ReviewsScreen from "../screens/shared/ReviewsScreen";
import type { ClientTabParamList, ClientStackParamList } from "./types";

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createNativeStackNavigator<ClientStackParamList>();

const TAB_ICONS: Record<keyof ClientTabParamList, React.ComponentType<IconProps>> = {
  Search: IconSearch,
  MyQuotes: IconList,
  MyBookings: IconCalendar,
  Messages: IconMessage,
  Profile: IconUser,
};

function ClientTabs() {
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
      screenOptions={stackScreenOptions}
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
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Avis clients" }} />
    </Stack.Navigator>
  );
}
