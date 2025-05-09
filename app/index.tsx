import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import {
  RegistrationStep,
  debugAuthState,
  getAuthState,
  validateAuthState,
} from "@/services/auth-state";

export default function Index() {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Check authentication state on app launch
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setIsLoading(true);

        // First validate the auth state to fix any inconsistencies
        await validateAuthState();

        // For debugging purposes
        await debugAuthState();

        // Now get the auth state
        const authState = await getAuthState();

        // Set user name if available
        if (authState.firstName) {
          setUserName(authState.firstName);
        }

        // Always redirect unregistered users based on their progress
        if (!authState.isRegistered) {
          console.log(
            "User is not registered, current step:",
            authState.currentStep
          );

          switch (authState.currentStep) {
            case RegistrationStep.WELCOME:
              setRedirectPath("../walkthrough");
              break;
            case RegistrationStep.PHONE_VERIFICATION:
              setRedirectPath("../verification");
              break;
            case RegistrationStep.PROFILE_SETUP:
              // If we have phone and country code, pass them to the profile screen
              if (authState.phoneNumber && authState.countryCode) {
                setRedirectPath(
                  `../profile?phoneNumber=${authState.phoneNumber}&countryCode=${authState.countryCode}`
                );
              } else {
                // If missing data, restart from verification
                setRedirectPath("../verification");
              }
              break;
            default:
              // Default to walkthrough for any unknown state
              setRedirectPath("../walkthrough");
          }
        } else {
          console.log("User is registered, showing main screen");
          // User is registered, no redirect needed
          setRedirectPath(null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsLoading(false);
        // Default to walkthrough on error
        setRedirectPath("../walkthrough");
      }
    };

    checkAuthState();
  }, []);

  // Redirect based on auth state if we have a redirect path and not loading
  if (redirectPath && !isLoading) {
    console.log("Redirecting to:", redirectPath);
    return <Redirect href={redirectPath} />;
  }

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <ThemedView
        style={[styles.container, { justifyContent: "center" }]}
        lightColor={Colors.light.surface}
        darkColor={Colors.dark.surface}
      >
        <ThemedText style={styles.subtitle}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.surface}
    >
      <ThemedText style={styles.title}>
        {userName ? `Welcome, ${userName}!` : "Welcome to Voxa Chat"}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Your home for secure messaging
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 30,
  },
  flagsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
    marginTop: 30,
  },
  flagWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
