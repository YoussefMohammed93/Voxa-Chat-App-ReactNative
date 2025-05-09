import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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
import { api } from "@/convex/_generated/api";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  RegistrationStep,
  updateRegistrationStep,
} from "@/services/auth-state";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { phoneNumber, countryCode } = useLocalSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convex mutations for user creation and image upload
  const createUser = useMutation(api.users.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const saveProfileImage = useMutation(api.storage.saveProfileImage);

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to grant permission to access your photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri as any);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required Fields", "Please enter your first and last name");
      return;
    }

    setIsLoading(true);

    try {
      // Get the full phone number with country code
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      console.log("Saving user with phone number:", fullPhoneNumber);

      // Create the user in the database with phone number
      const userId = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: fullPhoneNumber,
      });

      // If a profile image was selected, upload it to Convex storage
      if (profileImage) {
        try {
          // 1. Get an upload URL from Convex
          const uploadUrl = await generateUploadUrl();

          // 2. Upload the image file to the URL
          // Convert the local URI to a blob
          const response = await fetch(profileImage);
          const blob = await response.blob();

          // Upload the blob to the Convex URL
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              "Content-Type": blob.type,
            },
            body: blob,
          });

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload failed with status: ${uploadResponse.status}`
            );
          }

          // Get the storageId from the response
          const { storageId } = await uploadResponse.json();

          if (!storageId) {
            throw new Error("No storageId returned from upload");
          }

          // 3. Save the storage ID to the user's profile
          await saveProfileImage({
            storageId,
            userId,
          });

          console.log("Successfully uploaded profile image for user:", userId);
        } catch (imageError) {
          console.error("Failed to upload profile image:", imageError);
          // Continue even if image upload fails
        }
      }

      // Mark registration as completed and save user info
      try {
        await updateRegistrationStep(RegistrationStep.COMPLETED, {
          firstName: firstName.trim(),
          phoneNumber: phoneNumber as string,
          countryCode: countryCode as string,
        });
        console.log("Registration completed and saved to storage");
      } catch (storageError) {
        console.error("Error saving registration status:", storageError);
        // Continue even if storage fails
      }

      // Show success message
      Alert.alert(
        "Profile Created",
        "Your profile has been created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to the index page
              router.replace("/");
            },
          },
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to save profile. Please try again.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Profile",
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
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handlePickImage}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  {
                    backgroundColor:
                      colorScheme === "light" ? "#EEEEEE" : "#333333",
                  },
                ]}
              >
                <ThemedText style={styles.profileImagePlaceholderText}>
                  Add Photo
                </ThemedText>
                <View style={styles.plusIconContainer}>
                  <MaterialIcons
                    name="add"
                    size={20}
                    color={colorScheme === "light" ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>First Name *</ThemedText>
            <TextInput
              style={[
                styles.input,
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
              placeholder="Enter your first name"
              placeholderTextColor={
                colorScheme === "light" ? "#999999" : "#777777"
              }
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Last Name *</ThemedText>
            <TextInput
              style={[
                styles.input,
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
              placeholder="Enter your last name"
              placeholderTextColor={
                colorScheme === "light" ? "#999999" : "#777777"
              }
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  colorScheme === "light"
                    ? Colors.light.primary
                    : Colors.dark.primary,
                opacity: firstName.trim() && lastName.trim() ? 1 : 0.7,
              },
            ]}
            onPress={handleSave}
            disabled={!firstName.trim() || !lastName.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText
                style={styles.buttonText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Save
              </ThemedText>
            )}
          </TouchableOpacity>
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
    padding: 24,
  },
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 16,
    opacity: 0.7,
  },
  plusIconContainer: {
    position: "absolute",
    bottom: 2,
    right: 8,
    backgroundColor: "#385FFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
