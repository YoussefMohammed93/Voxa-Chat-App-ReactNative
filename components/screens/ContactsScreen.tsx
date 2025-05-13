import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCreateChat } from "@/hooks/useCreateChat";
import { getAvatarSource } from "@/utils/imageUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContactRowProps {
  user: Doc<"users">;
  onPress: (userId: Id<"users">) => void;
}

function ContactRow({ user, onPress }: ContactRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[
        styles.contactRow,
        {
          borderBottomColor:
            colorScheme === "dark" ? colors.border : colors.border,
        },
      ]}
      onPress={() => onPress(user._id)}
      activeOpacity={0.7}
    >
      <Image
        source={getAvatarSource(user.profileImageUrl)}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.contactInfo}>
        <ThemedText style={styles.contactName}>
          {user.firstName} {user.lastName}
        </ThemedText>
        <ThemedText
          style={styles.phoneNumber}
          lightColor={Colors.light.tabIconDefault}
          darkColor={Colors.dark.tabIconDefault}
        >
          {user.phoneNumber || "No phone number"}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export function ContactsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const { userId, userDetails } = useUser();

  // Debug log for authentication state
  console.log("ContactsScreen - Auth state:", {
    userId,
    hasUserDetails: !!userDetails,
  });

  const [searchText, setSearchText] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<Doc<"users">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  // Get contacts from Convex
  const contacts = useQuery(
    api.contacts.getByUserId,
    userId ? { userId } : "skip"
  );

  // Add contact mutation
  const addContact = useMutation(api.contacts.addByPhoneNumber);

  // Add a timeout to ensure loading state doesn't continue indefinitely
  useEffect(() => {
    // Set a timeout to ensure we don't show loading state forever
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, showing empty state");
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Update filtered contacts when contacts change or search text changes
  useEffect(() => {
    // If userId is not available, we can't load contacts
    if (!userId) {
      console.log("No userId available, showing empty state");
      setIsLoading(false);
      setFilteredContacts([]);
      return;
    }

    // If contacts is undefined, it means the query is still loading
    if (contacts === undefined) {
      console.log("Contacts query is loading");
      setIsLoading(true);
      return;
    }

    // Set loading to false once we have a definitive result (even if it's an empty array)
    console.log(
      "Contacts query completed, found:",
      contacts ? contacts.length : 0,
      "contacts"
    );
    setIsLoading(false);

    // If we have contacts, filter them based on search text
    if (contacts && contacts.length > 0) {
      if (searchText) {
        const filtered = contacts.filter((contact) => {
          if (!contact) return false;
          return (
            contact.firstName
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            contact.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
            (contact.phoneNumber && contact.phoneNumber.includes(searchText))
          );
        });
        setFilteredContacts(
          filtered.filter((c): c is Doc<"users"> => c !== null)
        );
      } else {
        setFilteredContacts(
          contacts.filter((c): c is Doc<"users"> => c !== null)
        );
      }
    } else {
      // If there are no contacts, set filtered contacts to an empty array
      setFilteredContacts([]);
    }
  }, [contacts, searchText, userId]);

  // Import the useCreateChat hook
  const { createChatWithUser } = useCreateChat();

  const handleContactPress = async (contactId: Id<"users">) => {
    if (!contacts) return;

    const contact = contacts.find((c) => c && c._id === contactId);
    if (!contact) return;

    try {
      // Create or get existing chat with this contact
      const chatId = await createChatWithUser(contactId);

      if (chatId) {
        // Navigate to the chat screen
        // @ts-ignore - Navigation typing issue
        navigation.navigate("ChatScreen", {
          chatId,
          userId: contactId,
          userName: `${contact.firstName} ${contact.lastName}`,
        });
      }
    } catch (error) {
      console.error("Error navigating to chat:", error);
      Alert.alert("Error", "Failed to open chat. Please try again.");
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
            Contacts
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons
              name="person-add"
              size={24}
              color={colorScheme === "dark" ? colors.text : colors.text}
            />
          </TouchableOpacity>
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
                colorScheme === "dark" ? colors.icon : colors.tabIconDefault
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
              placeholder="Search contacts..."
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

        {isLoading && !filteredContacts.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>
              Loading contacts...
            </ThemedText>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="people-outline"
              size={80}
              color={colors.tabIconDefault}
            />
            <ThemedText style={styles.emptyTitle}>
              {searchText ? "No contacts found" : "No contacts yet"}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchText
                ? "Try a different search term"
                : "Add contacts to start messaging"}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ContactRow user={item} onPress={handleContactPress} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "rgb(25, 25, 25)" : "#FFFFFF",
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add New Contact</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.modalLabel}>
                Enter phone number:
              </ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colorScheme === "dark" ? colors.text : colors.text,
                    },
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "#FFFFFF",
                    },
                  ]}
                  placeholder="+20-101-234-5678"
                  placeholderTextColor={
                    colorScheme === "dark"
                      ? colors.tabIconDefault
                      : colors.tabIconDefault
                  }
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <ThemedText style={styles.modalLabel}>Enter name:</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: colorScheme === "dark" ? colors.text : colors.text,
                    },
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "#FFFFFF",
                    },
                  ]}
                  placeholder="Full Name"
                  placeholderTextColor={
                    colorScheme === "dark"
                      ? colors.tabIconDefault
                      : colors.tabIconDefault
                  }
                  value={newContactName}
                  onChangeText={setNewContactName}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addContactButton,
                  { backgroundColor: colors.primary },
                  addingContact && { opacity: 0.7 },
                ]}
                onPress={handleAddContact}
                disabled={addingContact}
              >
                {addingContact ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText
                    style={styles.addContactButtonText}
                    darkColor="#FFFFFF"
                    lightColor="#FFFFFF"
                  >
                    Add Contact
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );

  async function handleAddContact() {
    if (!userId) {
      console.error(
        "No user ID found in UserContext when trying to add contact"
      );
      Alert.alert(
        "Authentication Error",
        "You must be logged in to add contacts. Please restart the app or log out and log in again if this issue persists."
      );
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    try {
      setAddingContact(true);

      // Format the phone number if needed
      let formattedPhoneNumber = phoneNumber.trim();
      if (!formattedPhoneNumber.startsWith("+")) {
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
      }

      // Call the Convex mutation to add the contact
      await addContact({
        userId,
        phoneNumber: formattedPhoneNumber,
      });

      // Provide haptic feedback on success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset the form and close the modal
      setPhoneNumber("");
      setNewContactName("");
      setModalVisible(false);

      Alert.alert("Success", "Contact added successfully");
    } catch (error) {
      console.error("Error adding contact:", error);

      // Provide haptic feedback on error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Show error message
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to add contact. Please try again."
      );
    } finally {
      setAddingContact(false);
    }
  }
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
  addButton: {
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
  contactRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalLabel: {
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  addContactButton: {
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    minHeight: 48,
  },
  addContactButtonText: {
    fontWeight: "600",
  },
});
