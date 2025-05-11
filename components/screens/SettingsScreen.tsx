import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingsItemProps {
  icon: string;
  title: string;
  onPress: () => void;
}

function SettingsItem({ icon, title, onPress }: SettingsItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <MaterialIcons
        name={icon as any}
        size={24}
        color={colors.text}
        style={styles.itemIcon}
      />
      <ThemedText style={styles.itemTitle}>{title}</ThemedText>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={colors.tabIconDefault}
      />
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const handleSettingsPress = (setting: string) => {
    switch (setting) {
      case "Profile":
        router.push("/ProfileSettingsScreen");
        break;
      case "Notifications":
        router.push("/NotificationsSettingsScreen");
        break;
      case "Theme":
        router.push("/ThemeSettingsScreen");
        break;
      case "About":
        router.push("/AboutScreen");
        break;
      default:
        console.log(`${setting} pressed`);
    }
  };

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText type="title" style={styles.headerTitle}>
            Settings
          </ThemedText>
        </View>

        <View
          style={[
            styles.settingsSection,
            { borderBottomColor: colors.border, borderBottomWidth: 1 },
          ]}
        >
          <ThemedText
            style={styles.sectionTitle}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            Account
          </ThemedText>
          <SettingsItem
            icon="person"
            title="Profile"
            onPress={() => handleSettingsPress("Profile")}
          />
          <SettingsItem
            icon="notifications"
            title="Notifications"
            onPress={() => handleSettingsPress("Notifications")}
          />
        </View>

        <View
          style={[
            styles.settingsSection,
            { borderBottomColor: colors.border },
            { borderBottomWidth: 1 },
          ]}
        >
          <ThemedText
            style={styles.sectionTitle}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            Appearance
          </ThemedText>
          <SettingsItem
            icon="color-lens"
            title="Theme"
            onPress={() => handleSettingsPress("Theme")}
          />
        </View>

        <View style={styles.settingsSection}>
          <ThemedText
            style={styles.sectionTitle}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            Support
          </ThemedText>
          <SettingsItem
            icon="info"
            title="About"
            onPress={() => handleSettingsPress("About")}
          />
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
  headerTitle: {
    fontSize: 28,
  },
  settingsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 8,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  itemIcon: {
    marginRight: 16,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
  },
});
