import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import Constants from "expo-constants";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AboutScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

  // Get app version from app.json via Constants
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const appName = Constants.expoConfig?.name || "Voxa Chat";

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.background}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
            About
          </ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          {/* App Logo and Version */}
          <View style={styles.appInfoContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.appLogo}
              contentFit="contain"
            />
            <ThemedText style={styles.appName}>{appName}</ThemedText>
            <ThemedText
              style={styles.appVersion}
              lightColor={Colors.light.tabIconDefault}
              darkColor={Colors.dark.tabIconDefault}
            >
              Version {appVersion}
            </ThemedText>
          </View>

          {/* About Information */}
          <View style={styles.infoSection}>
            <ThemedText style={styles.aboutText}>
              Voxa Chat is a modern messaging app designed to help you stay
              connected with friends and family. With features like instant
              messaging, voice messages, and media sharing, Voxa Chat makes
              communication simple and enjoyable.
            </ThemedText>
          </View>

          {/* Legal Links */}
          <View style={styles.legalSection}>
            <ThemedText
              style={styles.sectionTitle}
              lightColor={Colors.light.tabIconDefault}
              darkColor={Colors.dark.tabIconDefault}
            >
              LEGAL
            </ThemedText>

            <TouchableOpacity style={styles.legalItem}>
              <ExternalLink
                href="https://example.com/terms"
                style={styles.legalLink}
              >
                <View style={styles.legalLinkContent}>
                  <MaterialIcons
                    name="description"
                    size={24}
                    color={colors.text}
                    style={styles.legalIcon}
                  />
                  <ThemedText style={styles.legalText}>
                    Terms of Service
                  </ThemedText>
                </View>
                <MaterialIcons
                  name="open-in-new"
                  size={20}
                  color={colors.tabIconDefault}
                />
              </ExternalLink>
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <ExternalLink
                href="https://example.com/privacy"
                style={styles.legalLink}
              >
                <View style={styles.legalLinkContent}>
                  <MaterialIcons
                    name="privacy-tip"
                    size={24}
                    color={colors.text}
                    style={styles.legalIcon}
                  />
                  <ThemedText style={styles.legalText}>
                    Privacy Policy
                  </ThemedText>
                </View>
                <MaterialIcons
                  name="open-in-new"
                  size={20}
                  color={colors.tabIconDefault}
                />
              </ExternalLink>
            </TouchableOpacity>

            <TouchableOpacity style={styles.legalItem}>
              <ExternalLink
                href="https://example.com/licenses"
                style={styles.legalLink}
              >
                <View style={styles.legalLinkContent}>
                  <MaterialIcons
                    name="gavel"
                    size={24}
                    color={colors.text}
                    style={styles.legalIcon}
                  />
                  <ThemedText style={styles.legalText}>
                    Licenses
                  </ThemedText>
                </View>
                <MaterialIcons
                  name="open-in-new"
                  size={20}
                  color={colors.tabIconDefault}
                />
              </ExternalLink>
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <ThemedText
              style={styles.sectionTitle}
              lightColor={Colors.light.tabIconDefault}
              darkColor={Colors.dark.tabIconDefault}
            >
              CONTACT
            </ThemedText>

            <TouchableOpacity style={styles.contactItem}>
              <ExternalLink
                href="mailto:support@voxachat.com"
                style={styles.contactLink}
              >
                <View style={styles.contactLinkContent}>
                  <MaterialIcons
                    name="email"
                    size={24}
                    color={colors.text}
                    style={styles.contactIcon}
                  />
                  <ThemedText style={styles.contactText}>
                    support@voxachat.com
                  </ThemedText>
                </View>
              </ExternalLink>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <ExternalLink
                href="https://example.com/support"
                style={styles.contactLink}
              >
                <View style={styles.contactLinkContent}>
                  <MaterialIcons
                    name="help-outline"
                    size={24}
                    color={colors.text}
                    style={styles.contactIcon}
                  />
                  <ThemedText style={styles.contactText}>
                    Help Center
                  </ThemedText>
                </View>
                <MaterialIcons
                  name="open-in-new"
                  size={20}
                  color={colors.tabIconDefault}
                />
              </ExternalLink>
            </TouchableOpacity>
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
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  appInfoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  appLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
  },
  infoSection: {
    marginBottom: 32,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  legalSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  legalItem: {
    marginBottom: 16,
  },
  legalLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legalLinkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  legalIcon: {
    marginRight: 16,
  },
  legalText: {
    fontSize: 16,
  },
  contactSection: {
    marginBottom: 32,
  },
  contactItem: {
    marginBottom: 16,
  },
  contactLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactLinkContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    marginRight: 16,
  },
  contactText: {
    fontSize: 16,
  },
});
