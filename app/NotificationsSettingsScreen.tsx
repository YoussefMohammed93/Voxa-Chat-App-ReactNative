import { NotificationsSettingsScreen } from "@/components/screens/NotificationsSettingsScreen";
import { Stack } from "expo-router";
import React from "react";

export default function NotificationsSettingsScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NotificationsSettingsScreen />
    </>
  );
}
