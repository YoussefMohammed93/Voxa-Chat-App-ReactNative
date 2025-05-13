import { ChatRow } from "@/components/ChatRow";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ChatsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { userId } = useUser();

  const [searchText, setSearchText] = useState("");
  const [filteredChats, setFilteredChats] = useState<ChatWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the chat type
  type ChatParticipant = {
    _id: Id<"users">;
    _creationTime: number;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    createdAt: number;
  } | null;

  type ChatWithDetails = {
    _id: Id<"chats">;
    _creationTime: number;
    participants: Id<"users">[];
    lastMessageText?: string;
    lastMessageTime?: number;
    createdAt: number;
    otherParticipants: ChatParticipant[];
  };

  // Get chats from Convex
  const chats = useQuery(api.chats.getByUserId, userId ? { userId } : "skip");

  // Add a timeout to ensure loading state doesn't continue indefinitely
  useEffect(() => {
    // Set a timeout to ensure we don't show loading state forever
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, showing empty state for chats");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Update filtered chats when chats change or search text changes
  useEffect(() => {
    // If userId is not available, we can't load chats
    if (!userId) {
      console.log("No userId available, showing empty state for chats");
      setIsLoading(false);
      setFilteredChats([]);
      return;
    }

    // If chats is undefined, it means the query is still loading
    if (chats === undefined) {
      console.log("Chats query is loading");
      setIsLoading(true);
      return;
    }

    // Set loading to false once we have a definitive result (even if it's an empty array)
    console.log(
      "Chats query completed, found:",
      chats ? chats.length : 0,
      "chats"
    );
    setIsLoading(false);

    // If we have chats, filter them based on search text
    if (chats && chats.length > 0) {
      if (searchText) {
        const filtered = chats.filter((chat: ChatWithDetails) => {
          // Search in other participants' names
          return chat.otherParticipants.some((participant) => {
            if (!participant) return false;

            return (
              participant.firstName
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              participant.lastName
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              (participant.phoneNumber &&
                participant.phoneNumber.includes(searchText))
            );
          });
        });
        setFilteredChats(filtered as ChatWithDetails[]);
      } else {
        setFilteredChats(chats as ChatWithDetails[]);
      }
    } else {
      // If there are no chats, set filtered chats to an empty array
      setFilteredChats([]);
    }
  }, [chats, searchText, userId]);

  const handleChatPress = (chatId: Id<"chats">) => {
    if (!chats) return;

    const chat = chats.find((c) => c._id === chatId);
    if (!chat) return;

    // Find the first non-null participant
    const otherUser = chat.otherParticipants.find(
      (participant) => participant !== null
    );
    if (!otherUser) return;

    // @ts-ignore - Navigation typing issue
    navigation.navigate("ChatScreen", {
      chatId,
      userId: otherUser._id,
      userName: `${otherUser.firstName} ${otherUser.lastName}`,
    });
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
            Chats
          </ThemedText>
        </View>

        <View
          style={[styles.searchContainer, { borderBottomColor: colors.border }]}
        >
          <View
            style={[
              styles.searchInputContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          >
            <MaterialIcons
              name="search"
              size={24}
              color={
                colorScheme === "dark"
                  ? colors.tabIconDefault
                  : colors.tabIconDefault
              }
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colorScheme === "dark" ? colors.text : colors.text,
                  backgroundColor: "transparent",
                },
              ]}
              placeholder="Search chats..."
              placeholderTextColor={
                colorScheme === "dark" ? colors.icon : colors.tabIconDefault
              }
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={
                    colorScheme === "dark" ? colors.icon : colors.tabIconDefault
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading && !filteredChats.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading chats...</ThemedText>
          </View>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={80}
              color={colors.tabIconDefault}
            />
            <ThemedText style={styles.emptyTitle}>
              {searchText ? "No chats found" : "No chats yet"}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchText
                ? "Try a different search term"
                : "Add contacts to start chatting"}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatRow chat={item} onPress={handleChatPress} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
    paddingHorizontal: 20,
  },
});
