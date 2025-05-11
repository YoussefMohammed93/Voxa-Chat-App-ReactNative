import { AboutScreen } from "@/components/screens/AboutScreen";
import { Stack } from "expo-router";
import React from "react";

export default function AboutScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AboutScreen />
    </>
  );
}
