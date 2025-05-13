import { Colors } from "@/constants/Colors";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAvatarSource } from "@/utils/imageUtils";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface ChatRowProps {
  chat: {
    _id: Id<"chats">;
    _creationTime: number;
    participants: Id<"users">[];
    lastMessageText?: string;
    lastMessageTime?: number;
    createdAt: number;
    otherParticipants: (Doc<"users"> | null)[];
  };
  onPress: (chatId: Id<"chats">) => void;
}

export function ChatRow({ chat, onPress }: ChatRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Get the other participant (assuming 1-on-1 chats for now)
  const otherUser = chat.otherParticipants[0];

  if (!otherUser) {
    return null;
  }

  // Format the last message time
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this week, show day name
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={() => onPress(chat._id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={getAvatarSource(otherUser.profileImageUrl)}
          style={styles.avatar}
          contentFit="cover"
        />
        {/* We don't have online status yet, so hiding this for now */}
        {/* {isOnline && (
          <View
            style={[
              styles.onlineIndicator,
              { backgroundColor: colors.success },
            ]}
          />
        )} */}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <ThemedText style={styles.name}>
            {otherUser.firstName} {otherUser.lastName}
          </ThemedText>
          <ThemedText
            style={styles.lastSeen}
            lightColor={Colors.light.tabIconDefault}
            darkColor={Colors.dark.tabIconDefault}
          >
            {formatTime(chat.lastMessageTime)}
          </ThemedText>
        </View>
        <ThemedText
          style={styles.lastMessage}
          lightColor={Colors.light.tabIconDefault}
          darkColor={Colors.dark.tabIconDefault}
          numberOfLines={1}
        >
          {chat.lastMessageText || "No messages yet"}
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
