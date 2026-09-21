import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { stackScreenOptions } from "./screenOptions";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ReviewsScreen from "../screens/shared/ReviewsScreen";
import HelpScreen from "../screens/shared/HelpScreen";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={stackScreenOptions}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "" }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: "Avis clients" }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ title: "Assistance" }} />
    </Stack.Navigator>
  );
}
