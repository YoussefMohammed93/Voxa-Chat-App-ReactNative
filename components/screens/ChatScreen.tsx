import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNotification } from "@/src/contexts/NotificationContext";
import { ConvexMessage, Message, convertConvexMessage } from "@/types/Message";
import { formatMessageDate, isSameDay } from "@/utils/dateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAvatarSource } from "../../utils/imageUtils";
import { DateSeparator } from "../DateSeparator";
import { MessageContextMenu } from "../MessageContextMenu";
import { MessageInfoModal } from "../MessageInfoModal";
import { SwipeableMessage } from "../SwipeableMessage";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  replyToMessage?: Message | null;
  userName?: string;
  onImagePress?: (imageUrl: string) => void;
  onReply?: (message: Message) => void;
  onShowContextMenu?: (
    message: Message,
    position: { x: number; y: number; width: number; height: number }
  ) => void;
  onMessageInfo?: (message: Message) => void;
  onDeleteMessage?: (message: Message) => void;
  selectedMessageId?: string; // ID of the selected message for highlighting
  isContextMenuVisible?: boolean; // Whether the context menu is visible
  currentUserId?: Id<"users"> | null; // Current user ID for determining if a message is outgoing
}

function MessageBubble({
  message,
  isOutgoing,
  replyToMessage,
  userName = "User",
  onImagePress,
  onReply: _onReply,
  onShowContextMenu,
  onMessageInfo: _onMessageInfo,
  onDeleteMessage: _onDeleteMessage,
  selectedMessageId,
  isContextMenuVisible,
  currentUserId,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const windowWidth = Dimensions.get("window").width;
  const bubbleRef = useRef<View>(null);

  // Function to handle long press
  const handleLongPress = () => {
    if (!onShowContextMenu) return;

    // Measure the position of the message bubble
    if (bubbleRef.current) {
      bubbleRef.current.measureInWindow((x, y, width, height) => {
        onShowContextMenu(message, {
          x,
          y,
          width,
          height,
        });
      });
    }
  };

  // Determine message width based on content length
  const getMessageWidth = () => {
    // Get the content to measure (either the message content or reply content)
    const contentToMeasure = message.content;
    const contentLength = contentToMeasure.length;
    const lineBreaks = (contentToMeasure.match(/\n/g) || []).length;

    // For non-text messages, use a fixed width
    if (message.type !== "text") {
      return {
        maxWidth: "80%" as const,
        minWidth: 200, // Ensure images have a reasonable minimum width
      };
    }

    // For messages with replies, we need to be more careful with sizing
    if (replyToMessage) {
      // Very short messages with replies (like "OK", "Yes", etc.)
      if (contentLength <= 5 && lineBreaks === 0) {
        return {
          maxWidth: "auto" as const,
          minWidth: Math.min(150, windowWidth * 0.3), // Narrow but not too narrow
        };
      }

      // Short messages with replies
      if (contentLength < 20 && lineBreaks === 0) {
        return {
          maxWidth: "auto" as const,
          minWidth: Math.min(200, windowWidth * 0.4), // Wider than very short messages
        };
      }

      // Medium messages with replies
      if (contentLength < 50) {
        return {
          maxWidth: "60%" as const, // Slightly narrower than standard
          minWidth: Math.min(250, windowWidth * 0.5),
        };
      }

      // Longer messages with replies
      return {
        maxWidth: "80%" as const,
        minWidth: Math.min(300, windowWidth * 0.6),
      };
    }

    // For messages without replies, use a more natural sizing approach

    // Very short messages (like "OK", "Yes", etc.)
    if (contentLength <= 5 && lineBreaks === 0) {
      return {
        maxWidth: "auto" as const,
        minWidth: 60, // Just enough for very short text
      };
    }

    // Short messages
    if (contentLength < 20 && lineBreaks === 0) {
      return {
        maxWidth: "auto" as const,
        minWidth: 80, // Ensure a minimum width for short messages
      };
    }

    // Medium-length messages
    if (contentLength < 50) {
      return {
        maxWidth: "60%" as const, // Narrower than long messages
      };
    }

    // Long messages
    if (contentLength < 100) {
      return {
        maxWidth: "80%" as const,
      };
    }

    // Very long messages: expand to 95% for readability
    return {
      maxWidth: "95%" as const,
      width: windowWidth * 0.95 - 32, // 32px for padding
    };
  };

  // Check if this message is the selected one for the context menu
  const isSelected = selectedMessageId === message.id && isContextMenuVisible;

  // Determine bubble style based on message state (deleted or normal)
  const bubbleStyle = (() => {
    // For deleted messages, use a lighter background color
    if (message.isDeleted) {
      return isOutgoing
        ? [
            styles.messageBubble,
            styles.outgoingBubble,
            {
              backgroundColor: isSelected
                ? colorScheme === "dark"
                  ? "rgba(0, 92, 175, 0.9)" // Highlight color for selected
                  : "rgba(0, 92, 175, 0.9)"
                : colorScheme === "dark"
                  ? "rgba(0, 92, 175, 0.5)" // Lighter color for deleted outgoing messages
                  : "rgba(0, 92, 175, 0.5)",
            },
            getMessageWidth(),
          ]
        : [
            styles.messageBubble,
            styles.incomingBubble,
            {
              backgroundColor: isSelected
                ? colorScheme === "dark"
                  ? "rgba(70, 70, 70, 0.9)"
                  : "rgba(180, 180, 180, 0.9)"
                : colorScheme === "dark"
                  ? "rgba(255,255,255,0.05)" // Lighter color for deleted incoming messages
                  : "rgba(240,240,240,0.7)",
            },
            getMessageWidth(),
          ];
    }

    // Normal message styling
    return isOutgoing
      ? [
          styles.messageBubble,
          styles.outgoingBubble,
          {
            backgroundColor: isSelected
              ? colorScheme === "dark"
                ? "rgba(0, 92, 175, 0.9)" // Darker highlight for dark mode (WhatsApp style)
                : "rgba(0, 92, 175, 0.9)" // WhatsApp green highlight for light mode
              : colors.primary,
          },
          getMessageWidth(),
        ]
      : [
          styles.messageBubble,
          styles.incomingBubble,
          {
            backgroundColor: isSelected
              ? colorScheme === "dark"
                ? "rgba(70, 70, 70, 0.9)" // Darker highlight for dark mode (WhatsApp style)
                : "rgba(180, 180, 180, 0.9)" // WhatsApp gray highlight for light mode
              : colorScheme === "dark"
                ? "rgba(255,255,255,0.1)"
                : "#F0F0F0",
          },
          getMessageWidth(),
        ];
  })();

  const textColor = isOutgoing
    ? { color: "#FFFFFF" }
    : { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" };

  const renderContent = () => {
    // Special handling for deleted messages
    if (message.isDeleted) {
      // Use italicized gray text for deleted messages
      return (
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={handleLongPress}
          delayLongPress={150}
        >
          <View>
            <ThemedText
              style={[
                styles.messageText,
                styles.deletedMessageText,
                {
                  color: colorScheme === "dark" ? "#999999" : "#666666",
                  fontStyle: "italic",
                },
              ]}
            >
              This message was deleted
            </ThemedText>
          </View>
        </TouchableOpacity>
      );
    }

    // Normal message rendering
    const content = (() => {
      switch (message.type) {
        case "text":
          return (
            <ThemedText style={[styles.messageText, textColor]}>
              {message.content}
            </ThemedText>
          );
        case "image":
          return (
            <View>
              <TouchableWithoutFeedback
                onPress={() => onImagePress && onImagePress(message.content)}
                onLongPress={handleLongPress}
              >
                <View style={{ position: "relative" }}>
                  <Image
                    source={{ uri: message.content }}
                    style={[styles.imageMessage, { borderRadius: 12 }]}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Loading overlay for images that are being uploaded */}
                  {message.isUploading && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>

              {/* Display caption if available */}
              {message.caption && (
                <ThemedText style={[styles.imageCaption, textColor]}>
                  {message.caption}
                </ThemedText>
              )}
            </View>
          );

        default:
          return null;
      }
    })();

    // For text messages, use TouchableOpacity with onLongPress
    // Image messages already have their own TouchableWithoutFeedback with onLongPress
    if (message.type === "text") {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={handleLongPress}
          delayLongPress={150} // Shorter delay for WhatsApp-like experience
        >
          <View>{content}</View>
        </TouchableOpacity>
      );
    }

    // For image messages, just return the content (which already has touch handlers)
    return content;
  };

  // Function to render reply preview
  const renderReplyPreview = () => {
    if (!replyToMessage) return null;

    // Check if the reply is from the current user
    const isReplyOutgoing = currentUserId
      ? replyToMessage.senderId === currentUserId
      : false;

    // Determine the appropriate background color based on message type and theme
    const replyBgColor = isOutgoing
      ? "rgba(255, 255, 255, 0.2)" // Lighter background for outgoing messages
      : colorScheme === "dark"
        ? "rgba(50, 50, 50, 0.5)" // Darker background for dark mode
        : "rgba(0, 0, 0, 0.08)"; // Light gray for light mode

    const replyPreviewStyle = [
      styles.replyPreviewBubble,
      { backgroundColor: replyBgColor },
    ];

    // Determine text color based on message type and theme
    const replyTextColor = isOutgoing
      ? { color: "rgba(255, 255, 255, 0.9)" } // White text for outgoing messages
      : {
          color:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.8)" // Brighter text for dark mode
              : "rgba(0, 0, 0, 0.8)", // Darker text for light mode
        };

    // Determine the color of the vertical bar
    const replyBarColor = isOutgoing
      ? { backgroundColor: "rgba(255, 255, 255, 0.7)" } // Brighter bar for outgoing
      : { backgroundColor: colors.primary }; // Primary color for incoming

    // Determine preview text length based on message content length
    const getPreviewText = () => {
      if (replyToMessage.type !== "text") return "Photo";

      const content = replyToMessage.content;
      // For very short content, show it all
      if (content.length <= 30) return content;

      // For medium content, truncate with ellipsis
      if (content.length <= 100) return content.substring(0, 30) + "...";

      // For very long content, show beginning and indicate length
      return content.substring(0, 25) + "...";
    };

    return (
      <View style={replyPreviewStyle}>
        {/* Vertical indicator bar */}
        <View style={[styles.replyPreviewBar, replyBarColor]} />

        {/* Content container */}
        <View style={styles.replyPreviewContent}>
          {/* Username with appropriate styling */}
          <ThemedText
            style={[
              styles.replyPreviewName,
              replyTextColor,
              { fontWeight: "700" }, // Make username more prominent
            ]}
            numberOfLines={1}
          >
            {isReplyOutgoing ? "You" : userName}
          </ThemedText>

          {/* Message content preview */}
          {replyToMessage.type === "text" ? (
            <View style={styles.replyTextContainer}>
              <ThemedText
                style={[styles.replyPreviewText, replyTextColor]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getPreviewText()}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.replyPreviewRow}>
              <Image
                source={{ uri: replyToMessage.content }}
                style={styles.replyPreviewThumbnail}
                contentFit="cover"
              />
              <ThemedText
                style={[styles.replyPreviewText, replyTextColor]}
                numberOfLines={1}
              >
                Photo
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
      ]}
    >
      <View ref={bubbleRef} style={bubbleStyle}>
        {/* Render reply preview if this message is a reply */}
        {replyToMessage && renderReplyPreview()}

        {/* Add a small wrapper for the message content with proper spacing */}
        <View style={replyToMessage ? { marginTop: 2 } : undefined}>
          {renderContent()}
        </View>
      </View>
      <View style={styles.messageFooter}>
        <ThemedText
          style={[
            styles.timestamp,
            { color: colorScheme === "dark" ? "#999999" : "#666666" },
          ]}
        >
          {message.timestamp}
        </ThemedText>
        {isOutgoing && (
          <MaterialIcons
            name={message.status === "read" ? "done-all" : "done"}
            size={16}
            color={message.status === "read" ? colors.primary : "#999999"}
            style={styles.statusIcon}
          />
        )}
      </View>
    </View>
  );
}

export function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const route = useRoute();
  const navigation = useNavigation<any>(); // Using any for now to fix navigation type issues
  const flatListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const { userId: currentUserId } = useUser();
  const { setActiveChatId } = useNotification();

  // @ts-ignore - Route params typing
  const { chatId, userId: otherUserId, userName } = route.params || {};
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get the other user's details
  const otherUser = useQuery(
    api.users.getById,
    otherUserId ? { id: otherUserId } : "skip"
  );

  // Get messages for this chat
  const convexMessages = useQuery(
    api.chats.getMessages,
    chatId ? { chatId } : "skip"
  );

  // Send message mutation
  const sendMessage = useMutation(api.chats.sendMessage);

  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messagePosition, setMessagePosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Message info modal state
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated });
      }
    }, 100);
  }, []);

  // Add a timeout to ensure loading state doesn't continue indefinitely
  useEffect(() => {
    // Set a timeout to ensure we don't show loading state forever
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log(
          "Loading timeout reached, showing empty state for messages"
        );
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Update active chat ID when entering this screen
  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
    }

    // Clear active chat ID when leaving the screen
    return () => {
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId]);

  // Process messages from Convex to add date separators
  useEffect(() => {
    // If chatId is not available, we can't load messages
    if (!chatId) {
      console.log("No chatId available, showing empty state for messages");
      setIsLoading(false);
      setChatMessages([]);
      return;
    }

    if (!currentUserId) {
      console.log(
        "No currentUserId available, showing empty state for messages"
      );
      setIsLoading(false);
      setChatMessages([]);
      return;
    }

    if (convexMessages === undefined) {
      // Still loading
      console.log("Messages query is loading");
      setIsLoading(true);
      return;
    }

    // Set loading to false once we have a definitive result
    console.log(
      "Messages query completed, found:",
      convexMessages ? convexMessages.length : 0,
      "messages"
    );
    setIsLoading(false);

    // If there are no messages, set an empty array
    if (!convexMessages || convexMessages.length === 0) {
      setChatMessages([]);
      return;
    }

    // Convert Convex messages to UI messages
    const uiMessages: Message[] = convexMessages.map((message: ConvexMessage) =>
      convertConvexMessage(message, currentUserId)
    );

    // Reverse the messages to get chronological order (oldest first)
    // This is necessary because Convex returns messages in descending order (newest first)
    const chronologicalMessages = [...uiMessages].reverse();

    // Add date separators
    const messagesWithSeparators: Message[] = [];
    let currentDate: Date | null = null;

    chronologicalMessages.forEach((message) => {
      if (!message.createdAt) return;

      // If this is a new date or the first message, add a date separator
      if (!currentDate || !isSameDay(currentDate, message.createdAt)) {
        currentDate = message.createdAt;

        // Create a date separator message
        const dateSeparator: Message = {
          id: `date-${message.createdAt.getTime()}`,
          senderId: "system",
          type: "text",
          content: formatMessageDate(message.createdAt),
          timestamp: "",
          status: "read",
          createdAt: new Date(message.createdAt),
          isDateSeparator: true,
        };

        messagesWithSeparators.push(dateSeparator);
      }

      messagesWithSeparators.push(message);
    });

    setChatMessages(messagesWithSeparators);

    // Scroll to bottom whenever messages change
    // This ensures scrolling works for both sent and received messages
    scrollToBottom(true);
  }, [convexMessages, currentUserId, chatId, scrollToBottom]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatId || !currentUserId) return;

    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Send the message to Convex
      await sendMessage({
        chatId,
        senderId: currentUserId,
        content: inputText.trim(),
        type: "text",
        replyToId: replyingTo ? (replyingTo.id as Id<"messages">) : undefined,
      });

      // Clear the input and reply state
      setInputText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  // Function to pick an image from the gallery
  const handlePickImage = async () => {
    try {
      // Request permission to access the photo library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Provide haptic feedback on successful selection
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Show caption input dialog or directly send the image
        if (inputText.trim()) {
          // If there's already text in the input, use it as caption
          sendImageWithCaption(result.assets[0].uri, inputText.trim());
          setInputText("");
        } else {
          // Otherwise, just send the image
          sendImageWithCaption(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Function to send an image with optional caption
  const sendImageWithCaption = async (imageUri: string, caption?: string) => {
    if (!chatId || !currentUserId) return;

    setIsUploading(true);

    try {
      // In a real implementation, you would upload the image to storage first
      // and then use the URL in the message
      // For now, we'll just send the local URI

      // Send the message to Convex
      await sendMessage({
        chatId,
        senderId: currentUserId,
        content: caption ? `${imageUri}|${caption}` : imageUri, // Store caption with image
        type: "image",
        replyToId: replyingTo ? (replyingTo.id as Id<"messages">) : undefined,
      });

      // Clear the reply state
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending image:", error);
      Alert.alert("Error", "Failed to send image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle reply to a message
  const handleReply = useCallback((message: Message) => {
    // Add haptic feedback
    Vibration.vibrate(50);
    setReplyingTo(message);
  }, []);

  // Function to cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Function to get preview text for reply
  const getReplyPreview = useCallback((message: Message) => {
    switch (message.type) {
      case "text":
        return message.content.length > 30
          ? message.content.substring(0, 30) + "..."
          : message.content;
      case "image":
        return "Photo";

      default:
        return "Message";
    }
  }, []);

  // Function to show context menu
  const handleShowContextMenu = useCallback(
    (
      message: Message,
      position: { x: number; y: number; width: number; height: number }
    ) => {
      // Provide haptic feedback for WhatsApp-like experience
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Show context menu for all message types (text and images)
      setSelectedMessage(message);
      setMessagePosition(position);
      setContextMenuVisible(true);
    },
    []
  );

  // Function to close context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuVisible(false);
  }, []);

  // Function to show message info
  const handleMessageInfo = useCallback((message: Message) => {
    setSelectedMessage(message);
    setInfoModalVisible(true);
  }, []);

  // Delete message mutation
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);

  // Function to delete a message
  const handleDeleteMessage = useCallback(
    (message: Message) => {
      // Show confirmation alert
      Alert.alert(
        "Delete Message",
        "Are you sure you want to delete this message?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              if (!currentUserId) {
                Alert.alert(
                  "Error",
                  "You must be logged in to delete messages."
                );
                return;
              }

              try {
                // Call the Convex mutation to delete the message
                await deleteMessageMutation({
                  messageId: message.id as Id<"messages">,
                  userId: currentUserId,
                });

                // Provide haptic feedback on success
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              } catch (error) {
                console.error("Error deleting message:", error);

                // Show error message to the user
                Alert.alert(
                  "Error",
                  "Failed to delete message. You can only delete your own messages."
                );

                // Provide error haptic feedback
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
              }
            },
          },
        ]
      );
    },
    [currentUserId, deleteMessageMutation]
  );

  return (
    <ThemedView
      style={styles.container}
      lightColor={Colors.light.surface}
      darkColor={Colors.dark.background}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header - WhatsApp Style */}
        <View
          style={[
            styles.header,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(0, 0, 0, 0.25)"
                  : "rgba(255, 255, 255, 0.1)",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          {/* User info section with avatar and name */}
          <TouchableOpacity
            style={styles.headerUserInfo}
            onPress={() => {
              if (!otherUser) return;

              // Get all media messages for this chat
              const mediaMessages = chatMessages.filter(
                (message) =>
                  message.type === "image" && !message.isDateSeparator
              );

              // Navigate to profile screen with complete user data
              navigation.navigate("ProfileScreen", {
                userId: otherUserId,
                userName,
                avatarUrl: otherUser.profileImageUrl,
                phoneNumber: otherUser.phoneNumber,
                mediaMessages: mediaMessages,
              });
            }}
          >
            <Image
              source={getAvatarSource(otherUser?.profileImageUrl)}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            <View style={styles.headerUserTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                {userName}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {/* We don't have online status yet */}
                {otherUser ? "Last seen recently" : "Loading..."}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                if (!otherUser) return;

                // Get all media messages for this chat
                const mediaMessages = chatMessages.filter(
                  (message) =>
                    message.type === "image" && !message.isDateSeparator
                );

                // Navigate to profile screen with complete user data
                navigation.navigate("ProfileScreen", {
                  userId: otherUserId,
                  userName,
                  avatarUrl: otherUser.profileImageUrl,
                  phoneNumber: otherUser.phoneNumber,
                  mediaMessages: mediaMessages,
                });
              }}
            >
              <MaterialIcons
                name="info-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {isLoading && !chatMessages.length ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.emptyTitle}>
              Loading messages...
            </ThemedText>
          </View>
        ) : chatMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={80}
              color={colors.tabIconDefault}
            />
            <ThemedText style={styles.emptyTitle}>No messages yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Start a conversation by typing a message below
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // If this is a date separator, render the DateSeparator component
              if (item.isDateSeparator) {
                return <DateSeparator date={item.content} />;
              }

              // Find the message being replied to, if any
              const replyToMessage = item.replyTo
                ? chatMessages.find(
                    (msg) => msg.id === item.replyTo && !msg.isDateSeparator
                  )
                : null;

              return (
                <SwipeableMessage
                  message={item}
                  onReply={handleReply}
                  isOutgoing={item.senderId === currentUserId}
                  userName={userName}
                >
                  <MessageBubble
                    message={item}
                    isOutgoing={item.senderId === currentUserId}
                    replyToMessage={replyToMessage}
                    userName={userName}
                    onImagePress={setSelectedImage}
                    onReply={handleReply}
                    onShowContextMenu={handleShowContextMenu}
                    onMessageInfo={handleMessageInfo}
                    onDeleteMessage={handleDeleteMessage}
                    selectedMessageId={selectedMessage?.id}
                    isContextMenuVisible={contextMenuVisible}
                    currentUserId={currentUserId}
                  />
                </SwipeableMessage>
              );
            }}
            contentContainerStyle={styles.messagesList}
            onLayout={() => {
              // Scroll to bottom when the component first renders
              scrollToBottom(false);
            }}
            onContentSizeChange={() => {
              // Scroll to bottom when content size changes (new messages)
              scrollToBottom(true);
            }}
            // Always maintain scroll position at the end when data changes
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            // Improve scrolling performance
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={20}
            // Make sure scrolling is smooth
            scrollEventThrottle={16}
            // Ensure gesture handling works properly
            directionalLockEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        )}

        {/* Image Viewer Modal */}
        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.imageModalContainer}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.8,
                }}
                contentFit="contain"
              />
            )}
          </View>
        </Modal>

        {/* Message Context Menu with Blur */}
        <MessageContextMenu
          visible={contextMenuVisible}
          message={selectedMessage}
          isOutgoing={selectedMessage?.senderId === currentUserId}
          position={messagePosition}
          selectedMessageId={selectedMessage?.id}
          onClose={handleCloseContextMenu}
          onReply={handleReply}
          onInfo={handleMessageInfo}
          onDelete={handleDeleteMessage}
          onImagePress={setSelectedImage}
          onCopy={(message: Message) => {
            // Handle copy action
            if (message.type === "text") {
              // In a real app, you would use Clipboard API
              console.log("Copying text:", message.content);
            }
          }}
          onForward={(message: Message) => {
            // Handle forward action
            console.log("Forwarding message:", message.id);
          }}
          onStar={(message: Message) => {
            // Handle star action
            console.log("Starring message:", message.id);
          }}
          onPin={(message: Message) => {
            // Handle pin action
            console.log("Pinning message:", message.id);
          }}
        />

        {/* Message Info Modal */}
        <MessageInfoModal
          visible={infoModalVisible}
          message={selectedMessage}
          onClose={() => setInfoModalVisible(false)}
        />

        {/* Input Box */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {replyingTo && (
            <View
              style={[
                styles.replyContainer,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(30, 30, 30, 0.9)"
                      : "rgba(240, 240, 240, 0.9)",
                },
              ]}
            >
              <View style={styles.replyContent}>
                <View
                  style={[styles.replyBar, { backgroundColor: colors.primary }]}
                />
                <View style={styles.replyInputTextContainer}>
                  <ThemedText
                    style={styles.replyingToText}
                    lightColor={colors.primary}
                    darkColor={colors.primary}
                  >
                    {replyingTo.senderId === currentUserId ? "You" : userName}
                  </ThemedText>

                  {replyingTo.type === "text" ? (
                    <ThemedText style={styles.replyPreview} numberOfLines={1}>
                      {getReplyPreview(replyingTo)}
                    </ThemedText>
                  ) : (
                    <View style={styles.replyPreviewRow}>
                      <Image
                        source={{ uri: replyingTo.content }}
                        style={styles.replyThumbnail}
                        contentFit="cover"
                      />
                      <ThemedText style={styles.replyPreview}>Photo</ThemedText>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={cancelReply}
                style={styles.cancelReplyButton}
              >
                <MaterialIcons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0, 0, 0, 0.25)"
                    : "rgba(255, 255, 255, 0.1)",
              },
            ]}
          >
            <View style={styles.inputActions}>
              {isUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.attachButton}
                    onPress={handlePickImage}
                    disabled={isUploading}
                  >
                    <MaterialIcons name="photo" size={24} color={colors.text} />
                  </TouchableOpacity>
                </>
              )}
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? colors.text : colors.text,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "#F0F0F0",
                },
              ]}
              placeholder={
                replyingTo ? "Reply to message..." : "Type a message..."
              }
              placeholderTextColor={
                colorScheme === "dark" ? "#999999" : "#666666"
              }
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!isUploading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim()
                    ? colors.primary
                    : "rgba(0,0,0,0.1)",
                  opacity: inputText.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isUploading}
            >
              <MaterialIcons
                name="send"
                size={20}
                color={inputText.trim() && !isUploading ? "#FFFFFF" : "#999999"}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  deletedMessageText: {
    opacity: 0.8,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.5,
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerUserTextContainer: {
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12, // Slightly reduced for better spacing between messages
    maxWidth: "95%", // Increased from 80% to allow very long messages
  },
  incomingContainer: {
    alignSelf: "flex-start",
  },
  outgoingContainer: {
    alignSelf: "flex-end",
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingTop: 10, // Slightly reduced top padding for better spacing with reply
    minWidth: 60, // Reduced minimum width for very short messages
    // Don't set maxWidth here, it's handled dynamically in getMessageWidth
    overflow: "hidden", // Prevent content from overflowing
  },
  incomingBubble: {
    borderBottomLeftRadius: 4,
  },
  outgoingBubble: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  imageMessage: {
    width: 240,
    height: 180,
    borderRadius: 8,
    marginVertical: 4,
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 6,
    marginHorizontal: 4,
  },
  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  imageIcon: {
    opacity: 0.9,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  loadingContainer: {
    padding: 8,
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    maxHeight: 48,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Reply preview in message bubble
  replyPreviewBubble: {
    flexDirection: "row",
    borderRadius: 6,
    padding: 6,
    paddingVertical: 8,
    marginBottom: 6, // Reduced space between reply and actual message
    width: "100%", // Make sure the reply preview takes the full width of the parent bubble
    alignItems: "stretch", // Stretch items to fill the container height
    minHeight: 40, // Minimum height for the reply bubble
  },
  replyPreviewBar: {
    width: 2.5, // Slightly thinner for a more refined look
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginRight: 8,
    flexShrink: 0, // Prevent the bar from shrinking
    alignSelf: "stretch", // Make the bar stretch to match content height
    // Remove minHeight to let it naturally stretch with the container
  },
  replyPreviewContent: {
    flex: 1,
    flexShrink: 1, // Allow content to shrink if needed
    overflow: "hidden", // Prevent content from overflowing
    justifyContent: "center", // Center content vertically
    minHeight: 24, // Ensure minimum height for content
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3, // Increased spacing between name and preview text
    flexShrink: 0, // Don't allow the name to shrink
    lineHeight: 14, // Control line height for better vertical spacing
  },
  replyPreviewText: {
    fontSize: 12,
    flexShrink: 1, // Allow text to shrink if needed
    opacity: 0.9, // Slightly dimmed for better contrast with the name
    lineHeight: 16, // Control line height for better vertical spacing
  },
  replyTextContainer: {
    width: "100%", // Take full width of parent
    flexDirection: "row", // Allow for horizontal layout
    alignItems: "center", // Center items vertically
    minHeight: 16, // Minimum height to ensure proper spacing
  },
  replyPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "nowrap", // Prevent wrapping
    minHeight: 20, // Minimum height for image preview rows
  },
  replyPreviewThumbnail: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 4,
    flexShrink: 0, // Prevent thumbnail from shrinking
  },
  // Reply container in input box
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  replyContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  replyBar: {
    width: 3,
    height: "100%",
    backgroundColor: "#385FFF",
    borderRadius: 1.5,
    marginRight: 10,
  },
  replyInputTextContainer: {
    flex: 1,
  },
  replyingToText: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
  },
  replyPreview: {
    fontSize: 12,
    opacity: 0.7,
  },
  replyThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelReplyButton: {
    padding: 8,
  },
  // Image modal
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 30,
    right: 5,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  downloadButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  // Empty state styles
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
