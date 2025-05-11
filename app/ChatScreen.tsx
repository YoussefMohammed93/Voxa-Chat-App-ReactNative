import { ChatScreen } from "@/components/screens/ChatScreen";
import { Stack } from "expo-router";
import React from "react";

export default function ChatScreenRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatScreen />
    </>
  );
}
