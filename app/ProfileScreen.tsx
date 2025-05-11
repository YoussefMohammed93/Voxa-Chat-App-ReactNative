import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { Stack } from "expo-router";
import React from "react";

export default function ProfileScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileScreen />
    </>
  );
}
