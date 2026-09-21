import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { stackScreenOptions, tabScreenOptions } from "./screenOptions";
import {
  IconCalendar,
  IconLifebuoy,
  IconList,
  IconMessage,
  IconPlus,
  IconUser,
  type IconProps,
} from "../components/icons";
import NewRequestScreen from "../screens/client/NewRequestScreen";
import MyRequestsScreen from "../screens/client/MyRequestsScreen";
import RequestDetailScreen from "../screens/client/RequestDetailScreen";
import MyBookingsScreen from "../screens/client/MyBookingsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";
import LeaveReviewScreen from "../screens/client/LeaveReviewScreen";
import NewSupportTicketScreen from "../screens/client/NewSupportTicketScreen";
import PaymentScreen from "../screens/client/PaymentScreen";
import ConversationsScreen from "../screens/shared/ConversationsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import ReviewsScreen from "../screens/shared/ReviewsScreen";
import SupportListScreen from "../screens/shared/SupportListScreen";
import SupportTicketScreen from "../screens/shared/SupportTicketScreen";
import HelpScreen from "../screens/shared/HelpScreen";
import type { ClientStackParamList, ClientTabParamList } from "./types";

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createNativeStackNavigator<ClientStackParamList>();

const TAB_ICONS: Record<keyof ClientTabParamList, React.ComponentType<IconProps>> = {
  NewRequest: IconPlus,
  MyRequests: IconList,
  MyBookings: IconCalendar,
  Support: IconLifebuoy,
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
      <Tab.Screen name="NewRequest" component={NewRequestScreen} options={{ title: "Demander" }} />
      <Tab.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: "Demandes" }} />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: "Agenda" }}
      />
      <Tab.Screen name="Support" component={SupportListScreen} options={{ title: "SAV" }} />
      <Tab.Screen name="Messages" component={ConversationsScreen} options={{ title: "Messages" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
    </Tab.Navigator>
  );
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ClientTabs" component={ClientTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="RequestDetail"
        component={RequestDetailScreen}
        options={{ title: "Ma demande" }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Message" }} />
      <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} options={{ title: "Avis" }} />
      <Stack.Screen
        name="NewSupportTicket"
        component={NewSupportTicketScreen}
        options={{ title: "Nouveau dossier" }}
      />
      <Stack.Screen
        name="SupportTicket"
        component={SupportTicketScreen}
        options={{ title: "Dossier SAV" }}
      />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "Paiement" }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Avis clients" }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: "Assistance" }} />
    </Stack.Navigator>
  );
}
