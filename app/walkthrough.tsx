import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  RegistrationStep,
  updateRegistrationStep,
} from "@/services/auth-state";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalkthroughScreen() {
  const colorScheme = useColorScheme() ?? "light";

  const handleStartMessaging = async () => {
    // Update registration step before navigating
    await updateRegistrationStep(RegistrationStep.PHONE_VERIFICATION);
    router.push("/verification");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ThemedView
        style={styles.container}
        lightColor={Colors.light.surface}
        darkColor={Colors.dark.surface}
      >
        <View style={styles.content}>
          <Image
            source={
              colorScheme === "dark"
                ? require("@/assets/images/welcome-dark.svg")
                : require("@/assets/images/welcome.svg")
            }
            style={styles.welcomeImage}
            contentFit="contain"
          />

          <ThemedText style={styles.welcomeText}>
            Connect easily with your family and friends over countries.
          </ThemedText>

          <View style={styles.buttonContainer}>
            <ExternalLink
              href="https://example.com/terms-privacy"
              style={styles.termsLink}
            >
              <ThemedText type="link">Terms & Privacy Policy</ThemedText>
            </ExternalLink>

            <TouchableOpacity
              style={[
                styles.startButton,
                {
                  backgroundColor:
                    colorScheme === "light"
                      ? Colors.light.primary
                      : Colors.dark.primary,
                },
              ]}
              onPress={handleStartMessaging}
            >
              <ThemedText
                style={styles.buttonText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Start Messaging
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    flex: 1,
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  welcomeImage: {
    width: 262,
    height: 271,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
    marginTop: 16,
    lineHeight: 30,
  },
  buttonContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 36,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  termsLink: {
    marginBottom: 16,
  },
  startButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
