import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Message } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the type for the route params
type RootStackParamList = {
  ProfileScreen: {
    userId: string;
    userName: string;
    avatarUrl: string;
    phoneNumber: string;
    mediaMessages: Message[];
  };
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, "ProfileScreen">;
type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileScreen"
>;

export function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const screenWidth = Dimensions.get("window").width;

  // State for profile image viewer
  const [isProfileImageViewerVisible, setIsProfileImageViewerVisible] =
    useState(false);

  // State for media image viewer
  const [isMediaViewerVisible, setIsMediaViewerVisible] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Get route params with proper typing
  const { userName, avatarUrl, phoneNumber, mediaMessages = [] } = route.params;

  // Format profile image for the viewer
  const profileImage = [{ uri: avatarUrl }];

  // Format media images for the viewer
  const mediaImages = mediaMessages.map((message: Message) => ({
    uri: message.content,
  }));

  // Function to open the profile image viewer
  const openProfileImageViewer = useCallback(() => {
    setIsProfileImageViewerVisible(true);
  }, []);

  // Function to open the media image viewer
  const openMediaImageViewer = useCallback((index: number) => {
    setCurrentMediaIndex(index);
    setIsMediaViewerVisible(true);
  }, []);

  // Function to render media grid item
  const renderMediaItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <TouchableOpacity
        style={[
          styles.mediaItem,
          { width: screenWidth / 3 - 12 }, // 3 columns with spacing
        ]}
        onPress={() => openMediaImageViewer(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.content }}
          style={styles.mediaImage}
          contentFit="cover"
        />
      </TouchableOpacity>
    ),
    [screenWidth, openMediaImageViewer]
  );

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
            Profile
          </ThemedText>
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={openProfileImageViewer}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileImage}
              contentFit="cover"
            />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.userName}>
            {userName}
          </ThemedText>
          <ThemedText style={styles.phoneNumber}>{phoneNumber}</ThemedText>
        </View>

        {/* Media Section Title */}
        <View style={styles.sectionTitleContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Media
          </ThemedText>
        </View>

        {/* Media Grid */}
        <FlatList
          data={mediaMessages}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.mediaGrid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No media found</ThemedText>
            </View>
          }
        />

        {/* Profile Image Viewer */}
        <ImageView
          images={profileImage}
          imageIndex={0}
          visible={isProfileImageViewerVisible}
          onRequestClose={() => setIsProfileImageViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen"
          animationType="fade"
        />

        {/* Media Image Viewer */}
        <ImageView
          images={mediaImages}
          imageIndex={currentMediaIndex}
          visible={isMediaViewerVisible}
          onRequestClose={() => setIsMediaViewerVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
          presentationStyle="overFullScreen"
          animationType="fade"
          FooterComponent={({ imageIndex }) => (
            <View style={styles.imageViewerFooter}>
              <ThemedText style={styles.imageViewerCounter}>
                {imageIndex + 1} / {mediaImages.length}
              </ThemedText>
            </View>
          )}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  infoText: {
    marginLeft: 16,
    fontSize: 16,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  mediaGrid: {
    padding: 4,
  },
  mediaItem: {
    margin: 4,
    aspectRatio: 1,
  },
  mediaImage: {
    flex: 1,
    borderRadius: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.7,
  },
  imageViewerFooter: {
    height: 64,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCounter: {
    color: "#FFF",
    fontSize: 16,
  },
});
