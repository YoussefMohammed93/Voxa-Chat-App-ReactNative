import { ProfileSettingsScreen } from "@/components/screens/ProfileSettingsScreen";
import { Stack } from "expo-router";
import React from "react";

export default function ProfileSettingsScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileSettingsScreen />
    </>
  );
}
