import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNotification } from "@/src/contexts/NotificationContext";
import { NotificationPreferences } from "@/src/services/NotificationManager";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function NotificationsSettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

  // Get notification preferences from context
  const { preferences, savePreferences } = useNotification();

  // Local state for notification options
  const [notificationOptions, setNotificationOptions] = useState({
    showInAppNotifications: true,
    playNotificationSounds: true,
    vibrateOnNotification: true,
  });

  // Initialize local state from preferences
  useEffect(() => {
    setNotificationOptions({
      showInAppNotifications: preferences.showInAppNotifications,
      playNotificationSounds: preferences.playNotificationSounds,
      vibrateOnNotification: preferences.vibrateOnNotification,
    });
  }, [preferences]);

  // Check if any notification is enabled
  const isAnyNotificationEnabled =
    notificationOptions.showInAppNotifications ||
    notificationOptions.playNotificationSounds ||
    notificationOptions.vibrateOnNotification;

  // Toggle all notifications
  const toggleAllNotifications = (value: boolean) => {
    const newOptions = {
      showInAppNotifications: value,
      playNotificationSounds: value,
      vibrateOnNotification: value,
    };

    setNotificationOptions(newOptions);
    savePreferences(newOptions);
  };

  // Toggle individual notification option
  const toggleOption = (key: keyof NotificationPreferences) => {
    const newOptions = {
      ...notificationOptions,
      [key]: !notificationOptions[key],
    };

    setNotificationOptions(newOptions);
    savePreferences(newOptions);
  };

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.background}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            Notifications
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {/* Main toggle for all notifications */}
          <View style={styles.mainToggleContainer}>
            <View style={styles.mainToggleContent}>
              <MaterialIcons
                name="notifications"
                size={24}
                color={colors.primary}
                style={styles.mainToggleIcon}
              />
              <View style={styles.mainToggleTextContainer}>
                <ThemedText style={styles.mainToggleTitle}>
                  All Notifications
                </ThemedText>
                <ThemedText
                  style={styles.mainToggleDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Turn on/off all notifications
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isAnyNotificationEnabled}
              onValueChange={toggleAllNotifications}
              trackColor={{
                false: "#767577",
                true: colorScheme === "dark" ? "#375FFF" : "#385FFF",
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          />

          {/* Individual notification options */}
          <View style={styles.optionsContainer}>
            <ThemedText
              style={styles.sectionTitle}
              lightColor={Colors.light.tabIconDefault}
              darkColor={Colors.dark.tabIconDefault}
            >
              NOTIFICATION SETTINGS
            </ThemedText>

            {/* In-app notifications */}
            <View style={styles.optionItem}>
              <View style={styles.optionTextContainer}>
                <ThemedText style={styles.optionTitle}>
                  In-app Notifications
                </ThemedText>
                <ThemedText
                  style={styles.optionDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Show notifications while using the app
                </ThemedText>
              </View>
              <Switch
                value={notificationOptions.showInAppNotifications}
                onValueChange={() => toggleOption("showInAppNotifications")}
                trackColor={{
                  false: "#767577",
                  true: colorScheme === "dark" ? "#375FFF" : "#385FFF",
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Sound notifications */}
            <View style={styles.optionItem}>
              <View style={styles.optionTextContainer}>
                <ThemedText style={styles.optionTitle}>
                  Notification Sounds
                </ThemedText>
                <ThemedText
                  style={styles.optionDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Play sounds for new notifications
                </ThemedText>
              </View>
              <Switch
                value={notificationOptions.playNotificationSounds}
                onValueChange={() => toggleOption("playNotificationSounds")}
                trackColor={{
                  false: "#767577",
                  true: colorScheme === "dark" ? "#375FFF" : "#385FFF",
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Vibration notifications */}
            <View style={[styles.optionItem, { borderBottomWidth: 0 }]}>
              <View style={styles.optionTextContainer}>
                <ThemedText style={styles.optionTitle}>Vibration</ThemedText>
                <ThemedText
                  style={styles.optionDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Vibrate when receiving notifications
                </ThemedText>
              </View>
              <Switch
                value={notificationOptions.vibrateOnNotification}
                onValueChange={() => toggleOption("vibrateOnNotification")}
                trackColor={{
                  false: "#767577",
                  true: colorScheme === "dark" ? "#375FFF" : "#385FFF",
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
  },
  headerRight: {
    width: 40, // To balance the header
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  mainToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginRight: 50,
    paddingVertical: 12,
  },
  mainToggleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainToggleIcon: {
    marginRight: 16,
  },
  mainToggleTextContainer: {
    flex: 1,
  },
  mainToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  mainToggleDescription: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  optionsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 12,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
});
