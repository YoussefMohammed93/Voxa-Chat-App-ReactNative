import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { ThemeMode, useTheme } from "@/contexts/ThemeContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme as useDeviceColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ThemeSettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const deviceTheme = useDeviceColorScheme();

  // Use the theme context
  const { themeMode, setThemeMode } = useTheme();

  const handleThemeChange = (theme: ThemeMode) => {
    setThemeMode(theme);
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
            Theme
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <ThemedText
            style={styles.sectionTitle}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            APPEARANCE
          </ThemedText>

          {/* System Default Option */}
          <TouchableOpacity
            style={[styles.themeOption, { borderBottomColor: colors.border }]}
            onPress={() => handleThemeChange("system")}
          >
            <View style={styles.themeOptionContent}>
              <MaterialIcons
                name="settings-suggest"
                size={24}
                color={colors.text}
                style={styles.themeIcon}
              />
              <View style={styles.themeTextContainer}>
                <ThemedText style={styles.themeTitle}>
                  System Default
                </ThemedText>
                <ThemedText
                  style={styles.themeDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Follow system theme ({deviceTheme || "light"})
                </ThemedText>
              </View>
            </View>
            {themeMode === "system" && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Light Theme Option */}
          <TouchableOpacity
            style={[styles.themeOption, { borderBottomColor: colors.border }]}
            onPress={() => handleThemeChange("light")}
          >
            <View style={styles.themeOptionContent}>
              <MaterialIcons
                name="light-mode"
                size={24}
                color={colors.text}
                style={styles.themeIcon}
              />
              <View style={styles.themeTextContainer}>
                <ThemedText style={styles.themeTitle}>Light</ThemedText>
                <ThemedText
                  style={styles.themeDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Always use light theme
                </ThemedText>
              </View>
            </View>
            {themeMode === "light" && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Dark Theme Option */}
          <TouchableOpacity
            style={[styles.themeOption, { borderBottomColor: colors.border }]}
            onPress={() => handleThemeChange("dark")}
          >
            <View style={styles.themeOptionContent}>
              <MaterialIcons
                name="dark-mode"
                size={24}
                color={colors.text}
                style={styles.themeIcon}
              />
              <View style={styles.themeTextContainer}>
                <ThemedText style={styles.themeTitle}>Dark</ThemedText>
                <ThemedText
                  style={styles.themeDescription}
                  lightColor={Colors.light.tabIconDefault}
                  darkColor={Colors.dark.tabIconDefault}
                >
                  Always use dark theme
                </ThemedText>
              </View>
            </View>
            {themeMode === "dark" && (
              <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          {/* Theme Preview */}
          <View style={styles.previewContainer}>
            <ThemedText
              style={styles.previewTitle}
              lightColor={Colors.light.tabIconDefault}
              darkColor={Colors.dark.tabIconDefault}
            >
              PREVIEW
            </ThemedText>
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? Colors.dark.surface
                      : Colors.light.surface,
                  borderColor:
                    colorScheme === "dark"
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                },
              ]}
            >
              <View style={styles.previewHeader}>
                <View style={styles.previewHeaderDot} />
                <View style={styles.previewHeaderDot} />
                <View style={styles.previewHeaderDot} />
              </View>
              <View style={styles.previewContent}>
                <View
                  style={[
                    styles.previewMessage,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.previewMessage,
                    styles.previewMessageRight,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.previewMessage,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                    },
                  ]}
                />
              </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  themeOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  themeIcon: {
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  previewContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  previewBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  previewHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(150, 150, 150, 0.5)",
    marginRight: 4,
  },
  previewContent: {
    padding: 12,
  },
  previewMessage: {
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
    width: "70%",
  },
  previewMessageRight: {
    alignSelf: "flex-end",
  },
});
