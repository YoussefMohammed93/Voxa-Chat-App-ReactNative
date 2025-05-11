import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Message } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MessageInfoModalProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
}

export function MessageInfoModal({
  visible,
  message,
  onClose,
}: MessageInfoModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  if (!message) return null;

  // Format the date for display
  const getFormattedDate = () => {
    if (!message.createdAt) return message.timestamp;

    return format(message.createdAt, "MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ThemedView
        style={styles.container}
        lightColor={Colors.light.surface}
        darkColor={Colors.dark.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <MaterialIcons
                name="arrow-back-ios-new"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
              Message Info
            </ThemedText>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.content}>
            {/* Message details section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Time</ThemedText>
              <ThemedText style={styles.sectionContent}>
                {getFormattedDate()}
              </ThemedText>
            </View>

            {/* Status section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Status</ThemedText>
              <View style={styles.statusRow}>
                <MaterialIcons
                  name={message.status === "read" ? "done-all" : "done"}
                  size={18}
                  color={message.status === "read" ? colors.primary : "#999999"}
                  style={styles.statusIcon}
                />
                <ThemedText style={styles.sectionContent}>
                  {message.status === "read" ? "Read" : "Delivered"}
                </ThemedText>
              </View>
            </View>

            {/* Message type section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Type</ThemedText>
              <ThemedText style={styles.sectionContent}>
                {message.type === "text" ? "Text Message" : "Image Message"}
                {message.caption ? " with caption" : ""}
              </ThemedText>
            </View>

            {/* Message ID section (for debugging) */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Message ID</ThemedText>
              <ThemedText style={styles.sectionContent}>
                {message.id}
              </ThemedText>
            </View>

            {/* Reply info if applicable */}
            {message.replyTo && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Reply to message
                </ThemedText>
                <ThemedText style={styles.sectionContent}>
                  This message is a reply to another message
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    width: 40, // Balance the header
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 8,
  },
});
