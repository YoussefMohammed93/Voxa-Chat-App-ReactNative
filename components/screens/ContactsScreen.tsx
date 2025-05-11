import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { User, mockAllUsers } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
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
  user: User;
  onPress: (userId: string) => void;
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
      onPress={() => onPress(user.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: user.avatarUrl }}
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
          {user.phoneNumber}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export function ContactsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(mockAllUsers);

  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newContactName, setNewContactName] = useState("");

  // Filter contacts based on search text with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText) {
        const filtered = mockAllUsers.filter(
          (contact) =>
            contact.firstName
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            contact.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
            contact.phoneNumber.includes(searchText)
        );
        setFilteredContacts(filtered);
      } else {
        setFilteredContacts(mockAllUsers);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText]);

  const handleContactPress = (userId: string) => {
    const user = mockAllUsers.find((user) => user.id === userId);
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

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactRow user={item} onPress={handleContactPress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        {/* Add Contact Modal */}
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
                ]}
                onPress={handleAddContact}
              >
                <ThemedText
                  style={styles.addContactButtonText}
                  darkColor="#FFFFFF"
                  lightColor="#FFFFFF"
                >
                  Add Contact
                </ThemedText>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );

  function handleAddContact() {
    if (!phoneNumber.trim() || !newContactName.trim()) {
      Alert.alert("Error", "Please enter both phone number and name");
      return;
    }

    // Split the name into first and last name
    const nameParts = newContactName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Create a new contact
    const newContact: User = {
      id: `user-${Date.now()}`,
      firstName,
      lastName,
      phoneNumber: phoneNumber.trim(),
      avatarUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 100)}.jpg`,
    };

    // Add to the mockAllUsers array (in a real app, this would be a server call)
    mockAllUsers.push(newContact);

    // Reset the form and close the modal
    setPhoneNumber("");
    setNewContactName("");
    setModalVisible(false);

    // Refresh the contacts list
    setFilteredContacts([...mockAllUsers]);

    Alert.alert("Success", "Contact added successfully");
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
  listContent: {
    paddingBottom: 20,
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
  },
  addContactButtonText: {
    fontWeight: "600",
  },
});
