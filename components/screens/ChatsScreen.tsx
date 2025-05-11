import { ChatRow } from "@/components/ChatRow";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { mockChats } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
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

  const [searchText, setSearchText] = useState("");
  const [filteredChats, setFilteredChats] = useState(mockChats);

  // Filter chats based on search text with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText) {
        const filtered = mockChats.filter(
          (chat) =>
            chat.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
            chat.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
            chat.phoneNumber.includes(searchText)
        );
        setFilteredChats(filtered);
      } else {
        setFilteredChats(mockChats);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText]);

  const handleChatPress = (userId: string) => {
    console.log("Chat pressed:", userId);
    // Find the user
    const user = mockChats.find((chat) => chat.id === userId);
    if (user) {
      // @ts-ignore - Navigation typing issue
      navigation.navigate("ChatScreen", {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
      });
    }
  };

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Chats
          </ThemedText>
        </View>

        <View style={styles.searchContainer}>
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
                colorScheme === "dark"
                  ? colors.tabIconDefault
                  : colors.tabIconDefault
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
                    colorScheme === "dark"
                      ? colors.tabIconDefault
                      : colors.tabIconDefault
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatRow user={item} onPress={handleChatPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
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
  listContent: {
    paddingBottom: 20,
  },
});
