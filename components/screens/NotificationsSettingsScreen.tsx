import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export function NotificationsSettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

  // Mock notification settings - in a real app, these would come from user preferences
  const [notificationOptions, setNotificationOptions] = useState<
    NotificationOption[]
  >([
    {
      id: "message",
      title: "Message Notifications",
      description: "Get notified when you receive new messages",
      enabled: true,
    },
    {
      id: "group",
      title: "Group Notifications",
      description: "Get notified about activity in your groups",
      enabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationOptions(
      notificationOptions.map((option) =>
        option.id === id
          ? { ...option, enabled: !option.enabled }
          : option
      )
    );
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
              value={notificationOptions.some((option) => option.enabled)}
              onValueChange={(value) => {
                setNotificationOptions(
                  notificationOptions.map((option) => ({
                    ...option,
                    enabled: value,
                  }))
                );
              }}
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
              NOTIFICATION TYPES
            </ThemedText>

            {notificationOptions.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                <View style={styles.optionTextContainer}>
                  <ThemedText style={styles.optionTitle}>
                    {option.title}
                  </ThemedText>
                  <ThemedText
                    style={styles.optionDescription}
                    lightColor={Colors.light.tabIconDefault}
                    darkColor={Colors.dark.tabIconDefault}
                  >
                    {option.description}
                  </ThemedText>
                </View>
                <Switch
                  value={option.enabled}
                  onValueChange={() => toggleNotification(option.id)}
                  trackColor={{
                    false: "#767577",
                    true: colorScheme === "dark" ? "#375FFF" : "#385FFF",
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
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
