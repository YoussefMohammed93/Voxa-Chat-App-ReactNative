import { RelativePathString, Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { countries } from "@/models/countries";
import {
  RegistrationStep,
  updateRegistrationStep,
} from "@/services/auth-state";

// Function to generate a random 6-digit code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function VerificationScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === "EG") || countries[0]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (phoneNumber.trim().length < 5) {
      Alert.alert("Invalid Input", "Please enter a valid phone number");
      return;
    }

    try {
      setIsLoading(true);

      // Format the phone number with country code
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;

      // Generate a verification code
      const code = generateVerificationCode();

      console.log(`Sending verification code ${code} to ${fullPhoneNumber}`);

      // Save the current registration step with phone data
      await updateRegistrationStep(RegistrationStep.PHONE_VERIFICATION, {
        phoneNumber,
        countryCode: selectedCountry.dialCode,
      });

      // In a real app, you would send an SMS with this code
      // For now, we'll show it to the user
      Alert.alert(
        "Verification Code",
        `Your verification code is: ${code}\n\nIn a real app, this would be sent via SMS to ${fullPhoneNumber}.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset loading state before navigation
              setIsLoading(false);
              // Navigate to the verification code screen
              router.push({
                pathname: "/verification-code" as unknown as RelativePathString,
                params: {
                  phoneNumber,
                  countryCode: selectedCountry.dialCode,
                  code, // Pass the code for demo purposes
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error generating verification code:", error);
      Alert.alert(
        "Error",
        "Failed to generate verification code. Please try again."
      );
      setIsLoading(false);
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
          <ThemedText style={styles.title}>Enter your phone number</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please confirm your country code and enter your phone number
          </ThemedText>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.countrySelector,
                {
                  borderColor:
                    colorScheme === "light"
                      ? Colors.light.border
                      : Colors.dark.border,
                },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.flagContainer}>
                <CountryFlag isoCode={selectedCountry.code} size={24} />
              </View>
              <ThemedText style={styles.countryCode}>
                {selectedCountry.dialCode}
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={
                  colorScheme === "light" ? Colors.light.icon : Colors.dark.icon
                }
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.phoneInput,
                {
                  color:
                    colorScheme === "light"
                      ? Colors.light.text
                      : Colors.dark.text,
                },
                {
                  borderColor:
                    colorScheme === "light"
                      ? Colors.light.border
                      : Colors.dark.border,
                },
              ]}
              placeholder="Phone number"
              placeholderTextColor={
                colorScheme === "light" ? "#999999" : "#777777"
              }
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor:
                  colorScheme === "light"
                    ? Colors.light.primary
                    : Colors.dark.primary,
                opacity: phoneNumber.trim().length > 0 && !isLoading ? 1 : 0.7,
              },
            ]}
            onPress={handleContinue}
            disabled={phoneNumber.trim().length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText
                style={styles.buttonText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Continue
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colorScheme === "light"
                      ? Colors.light.surface
                      : Colors.dark.surface,
                },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  {
                    borderBottomColor:
                      colorScheme === "light"
                        ? Colors.light.border
                        : Colors.dark.border,
                  },
                ]}
              >
                <ThemedText style={styles.modalTitle}>
                  Select Country
                </ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <ThemedText>Close</ThemedText>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flex: 1,
                  padding: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "100%",
                    padding: 16,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      marginHorizontal: 20,
                      padding: 15,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor:
                        selectedCountry.code === "EG"
                          ? Colors.light.primary
                          : "#DDDDDD",
                      backgroundColor:
                        selectedCountry.code === "EG"
                          ? colorScheme === "light"
                            ? "#E6EDFF"
                            : "#2A3A5F"
                          : "transparent",
                    }}
                    onPress={() => {
                      const egypt = countries.find((c) => c.code === "EG");
                      if (egypt) {
                        setSelectedCountry(egypt);
                        setModalVisible(false);
                      }
                    }}
                  >
                    <View
                      style={{
                        width: 120,
                        height: 65,
                        marginBottom: 10,
                        marginTop: 10,
                        alignItems: "center",
                      }}
                    >
                      <CountryFlag isoCode="EG" size={50} />
                    </View>
                    <ThemedText style={{ fontWeight: "600" }}>EG</ThemedText>
                    <ThemedText>+20</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      marginHorizontal: 20,
                      padding: 15,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor:
                        selectedCountry.code === "SA"
                          ? Colors.light.primary
                          : "#DDDDDD",
                      backgroundColor:
                        selectedCountry.code === "SA"
                          ? colorScheme === "light"
                            ? "#E6EDFF"
                            : "#2A3A5F"
                          : "transparent",
                    }}
                    onPress={() => {
                      const saudi = countries.find((c) => c.code === "SA");
                      if (saudi) {
                        setSelectedCountry(saudi);
                        setModalVisible(false);
                      }
                    }}
                  >
                    <View
                      style={{
                        width: 120,
                        height: 65,
                        marginBottom: 10,
                        marginTop: 10,
                        alignItems: "center",
                      }}
                    >
                      <CountryFlag isoCode="SA" size={50} />
                    </View>
                    <ThemedText style={{ fontWeight: "600" }}>KSA</ThemedText>
                    <ThemedText>+966</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
  inputContainer: {
    flexDirection: "row",
    marginBottom: 32,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
  },
  countryCode: {
    fontSize: 16,
    paddingRight: 8,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginLeft: 12,
  },
  continueButton: {
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  modalContent: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 20,
    minHeight: "45%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  countryDialCode: {
    marginLeft: "auto",
  },
  flagContainer: {
    width: 50,
    height: 24,
    overflow: "hidden",
  },
});
