import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NotificationProvider } from "@/src/contexts/NotificationContext";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <AppWithTheme />
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}

function AppWithTheme() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF",
            },
            headerTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          }}
        >
          <Stack.Screen name="walkthrough" options={{ headerShown: false }} />
          <Stack.Screen name="verification" />
          <Stack.Screen name="verification-code" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="ChatScreen" options={{ headerShown: false }} />
          <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen
            name="ProfileSettingsScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationsSettingsScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ThemeSettingsScreen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="AboutScreen" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
