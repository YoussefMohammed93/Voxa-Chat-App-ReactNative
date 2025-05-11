import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ChatUser } from "@/models/mockData";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface ChatRowProps {
  user: ChatUser;
  onPress: (userId: string) => void;
}

export function ChatRow({ user, onPress }: ChatRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={() => onPress(user.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatarUrl }}
          style={styles.avatar}
          contentFit="cover"
        />
        {user.isOnline && (
          <View
            style={[
              styles.onlineIndicator,
              { backgroundColor: colors.success },
            ]}
          />
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText style={styles.name}>
            {user.firstName} {user.lastName}
          </ThemedText>
          <ThemedText
            style={styles.lastSeen}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            {user.lastSeen}
          </ThemedText>
        </View>
        <ThemedText
          style={styles.lastMessage}
          lightColor={Colors.light.tabIconDefault}
          darkColor={Colors.dark.tabIconDefault}
          numberOfLines={1}
        >
          {user.lastMessage}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "white",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  lastSeen: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
  },
});
