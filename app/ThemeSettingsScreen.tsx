import { ThemeSettingsScreen } from "@/components/screens/ThemeSettingsScreen";
import { Stack } from "expo-router";
import React from "react";

export default function ThemeSettingsScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemeSettingsScreen />
    </>
  );
}
