import {
  RelativePathString,
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  RegistrationStep,
  updateRegistrationStep,
} from "@/services/auth-state";

export default function VerificationCodeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {
    phoneNumber,
    countryCode,
    code: verificationCode,
  } = useLocalSearchParams();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Auto-focus the first input when the screen loads
  useEffect(() => {
    setTimeout(() => {
      if (inputRefs.current[0]) {
        (inputRefs.current[0] as TextInput)?.focus();
      }
    }, 100);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-advance to next input
    if (text.length === 1 && index < 5) {
      (inputRefs.current[index + 1] as TextInput)?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    // Go back to previous input on backspace if current input is empty
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      (inputRefs.current[index - 1] as TextInput)?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert(
        "Invalid Code",
        "Please enter the complete 6-digit verification code"
      );
      return;
    }

    try {
      setIsVerifying(true);

      console.log(`Verifying code ${fullCode}`);

      // For demo purposes, we'll just check if the entered code matches the one we passed
      const isValid = fullCode === verificationCode;

      if (isValid) {
        // Update registration step to profile setup
        await updateRegistrationStep(RegistrationStep.PROFILE_SETUP, {
          phoneNumber: phoneNumber as string,
          countryCode: countryCode as string,
        });

        // Code is valid, navigate to profile screen
        Alert.alert("Success", "Verification successful!", [
          {
            text: "Continue",
            onPress: () => {
              // Navigate to profile screen with phone number and country code
              router.push({
                pathname: "/profile" as unknown as RelativePathString,
                params: {
                  phoneNumber: phoneNumber as string,
                  countryCode: countryCode as string,
                },
              });
            },
          },
        ]);
      } else {
        // Code is invalid
        Alert.alert(
          "Invalid Code",
          "The verification code you entered is incorrect. Please try again or request a new code."
        );
      }
    } catch (error) {
      console.error("Error in verification process:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);

      // Go back to the verification screen to get a new code
      Alert.alert(
        "Change Phone Number",
        "Would you like to go back to change your phone number or try again?",
        [
          {
            text: "Go Back",
            onPress: () => {
              setIsResending(false);
              router.back();
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsResending(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error handling resend:", error);
      Alert.alert("Error", "Failed to process your request. Please try again.");
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "",
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor:
              colorScheme === "light"
                ? Colors.light.surface
                : Colors.dark.surface,
          },
        }}
      />

      <ThemedView
        style={styles.container}
        lightColor={Colors.light.surface}
        darkColor={Colors.dark.surface}
      >
        <View style={styles.content}>
          <ThemedText style={styles.title}>Enter verification code</ThemedText>
          <ThemedText style={styles.subtitle}>
            We&apos;ve sent a verification code to {countryCode} {phoneNumber}
          </ThemedText>

          <View style={styles.codeContainer}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  {
                    borderColor:
                      colorScheme === "light"
                        ? Colors.light.border
                        : Colors.dark.border,
                    color:
                      colorScheme === "light"
                        ? Colors.light.text
                        : Colors.dark.text,
                  },
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor:
                  colorScheme === "light"
                    ? Colors.light.primary
                    : Colors.dark.primary,
                opacity:
                  code.every((digit) => digit !== "") && !isVerifying ? 1 : 0.7,
              },
            ]}
            onPress={handleVerify}
            disabled={!code.every((digit) => digit !== "") || isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText
                style={styles.buttonText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Verify
              </ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <ThemedText style={styles.resendText}>
              Need to change your phone number?
            </ThemedText>
            <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator
                  size="small"
                  color={
                    colorScheme === "light"
                      ? Colors.light.primary
                      : Colors.dark.primary
                  }
                />
              ) : (
                <ThemedText
                  style={styles.resendLink}
                  lightColor={Colors.light.primary}
                  darkColor={Colors.dark.primary}
                >
                  Go Back
                </ThemedText>
              )}
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
    marginTop: -20,
  },
  content: {
    flex: 1,
    marginTop: 32,
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 350,
    fontSize: 16,
    marginBottom: 40,
    opacity: 0.8,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  verifyButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    marginRight: 8,
  },
  resendLink: {
    fontWeight: "600",
  },
});
