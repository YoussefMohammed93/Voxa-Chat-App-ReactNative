import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Message, mockChats, mockMessages } from "@/models/mockData";
import { formatMessageDate, isSameDay } from "@/utils/dateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
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
}

function MessageBubble({
  message,
  isOutgoing,
  replyToMessage,
  userName = "User",
  onImagePress,
  onReply,
  onShowContextMenu,
  onMessageInfo,
  onDeleteMessage,
  selectedMessageId,
  isContextMenuVisible,
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
    if (message.type !== "text") {
      // For non-text messages, use default width
      return { maxWidth: "80%" as const };
    }

    const contentLength = message.content.length;
    const lineBreaks = (message.content.match(/\n/g) || []).length;

    // Short messages: fit content naturally (minimum width)
    if (contentLength < 20 && lineBreaks === 0) {
      return {
        maxWidth: "auto" as const,
      }; // Use natural width with minWidth from styles
    }

    // Medium to long messages: max out at 80% of screen width
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

  const bubbleStyle = isOutgoing
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

  const textColor = isOutgoing
    ? { color: "#FFFFFF" }
    : { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" };

  const renderContent = () => {
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

    const isReplyOutgoing = replyToMessage.senderId === "me";
    const replyPreviewStyle = isOutgoing
      ? [
          styles.replyPreviewBubble,
          { backgroundColor: "rgba(255, 255, 255, 0.2)" },
        ]
      : [styles.replyPreviewBubble, { backgroundColor: "rgba(0, 0, 0, 0.1)" }];

    const replyTextColor = isOutgoing
      ? { color: "rgba(255, 255, 255, 0.9)" }
      : {
          color:
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)",
        };

    const replyBarColor = isOutgoing
      ? { backgroundColor: "rgba(255, 255, 255, 0.6)" }
      : { backgroundColor: colors.primary };

    return (
      <View style={replyPreviewStyle}>
        <View style={[styles.replyPreviewBar, replyBarColor]} />
        <View style={styles.replyPreviewContent}>
          <ThemedText style={[styles.replyPreviewName, replyTextColor]}>
            {isReplyOutgoing ? "You" : userName}
          </ThemedText>

          {replyToMessage.type === "text" ? (
            <ThemedText
              style={[styles.replyPreviewText, replyTextColor]}
              numberOfLines={1}
            >
              {replyToMessage.content.length > 30
                ? replyToMessage.content.substring(0, 30) + "..."
                : replyToMessage.content}
            </ThemedText>
          ) : (
            <View style={styles.replyPreviewRow}>
              <Image
                source={{ uri: replyToMessage.content }}
                style={styles.replyPreviewThumbnail}
                contentFit="cover"
              />
              <ThemedText style={[styles.replyPreviewText, replyTextColor]}>
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
        {replyToMessage && renderReplyPreview()}
        {renderContent()}
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

  // @ts-ignore - Route params typing
  const { userId, userName } = route.params || {};
  const [inputText, setInputText] = useState("");
  const [rawMessages, setRawMessages] = useState<Message[]>(
    mockMessages[userId] || []
  );
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Process messages to add date separators and createdAt dates
  useEffect(() => {
    // Add createdAt dates to messages if they don't have them
    const messagesWithDates = rawMessages.map((message, index) => {
      if (message.createdAt) return message;

      // For mock data, create dates based on index to simulate different days
      const date = new Date();

      // Distribute messages across different days for demo purposes
      // First 3 messages: 2 days ago, next 3: yesterday, rest: today
      if (index < 3) {
        date.setDate(date.getDate() - 2);
      } else if (index < 6) {
        date.setDate(date.getDate() - 1);
      }

      // Set hours based on the timestamp
      const timeParts = message.timestamp.split(":");
      if (timeParts.length === 2) {
        date.setHours(parseInt(timeParts[0], 10));
        date.setMinutes(parseInt(timeParts[1], 10));
      }

      return { ...message, createdAt: date };
    });

    // Add date separators
    const messagesWithSeparators: Message[] = [];
    let currentDate: Date | null = null;

    messagesWithDates.forEach((message) => {
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
  }, [rawMessages, scrollToBottom]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const newMessage: Message = {
      id: `${userId}-${Date.now()}`,
      senderId: "me",
      type: "text",
      content: inputText.trim(),
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      replyTo: replyingTo ? replyingTo.id : undefined,
      createdAt: now,
    };

    // Add to raw messages which will trigger the useEffect to process date separators
    setRawMessages([...rawMessages, newMessage]);
    setInputText("");
    setReplyingTo(null);
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
  const sendImageWithCaption = (imageUri: string, caption?: string) => {
    setIsUploading(true);

    // Create a temporary message with isUploading flag
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    const tempMessage: Message = {
      id: tempId,
      senderId: "me",
      type: "image",
      content: imageUri,
      caption: caption, // Add the caption if provided
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      replyTo: replyingTo ? replyingTo.id : undefined,
      createdAt: now,
      isUploading: true, // Mark as uploading
    };

    // Add the temporary message to show loading state
    setRawMessages([...rawMessages, tempMessage]);

    // In a real app, you would upload the image to a server here
    // For now, we'll simulate a short delay
    setTimeout(() => {
      // Replace the temporary message with the final one
      const finalMessage: Message = {
        ...tempMessage,
        id: `${userId}-${Date.now()}`,
        isUploading: false, // No longer uploading
      };

      // Update the messages array by replacing the temp message
      const updatedMessages = rawMessages.map((msg) =>
        msg.id === tempId ? finalMessage : msg
      );

      // Add to raw messages which will trigger the useEffect to process date separators
      setRawMessages(updatedMessages);
      setReplyingTo(null);
      setIsUploading(false);
    }, 2000); // Simulate 2 second upload time
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
            onPress: () => {
              // Remove the message from the list
              const updatedMessages = rawMessages.filter(
                (msg) => msg.id !== message.id
              );
              setRawMessages(updatedMessages);

              // Provide haptic feedback
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            },
          },
        ]
      );
    },
    [rawMessages]
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
              // Get the current user data
              const currentUser = mockChats.find((chat) => chat.id === userId);
              // Get all media messages for this chat
              const mediaMessages =
                mockMessages[userId]?.filter(
                  (message) => message.type === "image"
                ) || [];

              // Navigate to profile screen with complete user data
              navigation.navigate("ProfileScreen", {
                userId,
                userName,
                avatarUrl: currentUser?.avatarUrl,
                phoneNumber: currentUser?.phoneNumber,
                mediaMessages: mediaMessages,
              });
            }}
          >
            <Image
              source={{
                uri: mockChats.find((chat) => chat.id === userId)?.avatarUrl,
              }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            <View style={styles.headerUserTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                {userName}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {mockChats.find((chat) => chat.id === userId)?.isOnline
                  ? "Online"
                  : mockChats.find((chat) => chat.id === userId)?.lastSeen}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                // Get the current user data
                const currentUser = mockChats.find(
                  (chat) => chat.id === userId
                );
                // Get all media messages for this chat
                const mediaMessages =
                  mockMessages[userId]?.filter(
                    (message) => message.type === "image"
                  ) || [];

                // Navigate to profile screen with complete user data
                navigation.navigate("ProfileScreen", {
                  userId,
                  userName,
                  avatarUrl: currentUser?.avatarUrl,
                  phoneNumber: currentUser?.phoneNumber,
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
                isOutgoing={item.senderId === "me"}
                userName={userName}
              >
                <MessageBubble
                  message={item}
                  isOutgoing={item.senderId === "me"}
                  replyToMessage={replyToMessage}
                  userName={userName}
                  onImagePress={setSelectedImage}
                  onReply={handleReply}
                  onShowContextMenu={handleShowContextMenu}
                  onMessageInfo={handleMessageInfo}
                  onDeleteMessage={handleDeleteMessage}
                  selectedMessageId={selectedMessage?.id}
                  isContextMenuVisible={contextMenuVisible}
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
          isOutgoing={selectedMessage?.senderId === "me"}
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
                <View style={styles.replyTextContainer}>
                  <ThemedText
                    style={styles.replyingToText}
                    lightColor={colors.primary}
                    darkColor={colors.primary}
                  >
                    {replyingTo.senderId === "me" ? "You" : userName}
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
    marginBottom: 16,
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
    minWidth: 80,
    // Don't set maxWidth here, it's handled dynamically in getMessageWidth
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
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  replyPreviewBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginRight: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 12,
  },
  replyPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyPreviewThumbnail: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 4,
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
  replyTextContainer: {
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
});
