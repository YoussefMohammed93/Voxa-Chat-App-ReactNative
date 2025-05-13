import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Message } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface MessageContextMenuProps {
  visible: boolean;
  message: Message | null;
  isOutgoing: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  selectedMessageId?: string; // ID of the selected message for highlighting
  onClose: () => void;
  onReply: (message: Message) => void;
  onInfo: (message: Message) => void;
  onDelete: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onStar?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onImagePress?: (imageUrl: string) => void; // Callback for viewing images
}

export function MessageContextMenu({
  visible,
  message,
  isOutgoing,
  position,
  onClose,
  onReply,
  onInfo,
  onDelete,
  onCopy,
  onForward,
  onStar,
  onPin,
  onImagePress,
}: MessageContextMenuProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const screenWidth = Dimensions.get("window").width;

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const messageScale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Track menu mode (inline or fixedTop)
  const [menuMode, setMenuMode] = useState<"inline" | "fixedTop">("inline");

  // Menu height (approximate based on number of items and message type)
  const MENU_HEIGHT =
    message?.type === "image"
      ? isOutgoing
        ? 240
        : 160 // Fewer options for image messages
      : 360; // Full height for text messages

  // Define a consistent vertical gap between message and menu
  const verticalGap = 25; // Consistent spacing for both sender and receiver messages

  // Calculate menu position based on who sent the message
  const getMenuPosition = () => {
    if (!position) return { top: 0, left: 0 };

    const screenHeight = Dimensions.get("window").height;
    const spaceBelow = screenHeight - (position.y + position.height);
    const menuWidth = 240; // Width of the menu

    // Check if there's enough space below the message for the menu
    if (spaceBelow < MENU_HEIGHT + verticalGap) {
      // Not enough space below, set mode to fixedTop
      if (menuMode !== "fixedTop") {
        setMenuMode("fixedTop");
      }

      // Position at the top of the screen with some padding
      return {
        top: 80 + position.height + verticalGap, // Fixed position from top + message height + consistent gap
        // Align based on who sent the message
        left: isOutgoing
          ? Math.min(
              position.x + position.width - menuWidth,
              screenWidth - menuWidth - 16
            )
          : Math.max(position.x, 16),
      };
    } else {
      // Enough space below, set mode to inline
      if (menuMode !== "inline") {
        setMenuMode("inline");
      }

      // Position the menu below the message bubble with consistent spacing
      let top = position.y + position.height + verticalGap; // Apply consistent vertical gap

      // Align the menu based on who sent the message
      let left;
      if (isOutgoing) {
        // For outgoing messages (right side), align menu to the right edge of the message
        left = position.x + position.width - menuWidth;
        // Ensure it doesn't go off-screen
        if (left < 20) left = 20;
      } else {
        // For incoming messages (left side), align menu to the left edge of the message
        left = position.x;
        // Ensure it doesn't go off-screen
        if (left + menuWidth > screenWidth - 20)
          left = screenWidth - menuWidth - 20;
      }

      return { top, left };
    }
  };

  // Animate menu appearance
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 120 });
      scale.value = withSpring(1, { damping: 25, stiffness: 250 });
      messageScale.value = withTiming(1.03, { duration: 120 }); // Scale up the message slightly

      // Handle vertical translation based on menu mode
      if (menuMode === "fixedTop") {
        // Move message to top of screen with animation
        translateY.value = withTiming(-position.y + 80, { duration: 200 });
      } else {
        // Keep message in place
        translateY.value = withTiming(0, { duration: 200 });
      }
    } else {
      opacity.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(0.9, { duration: 120 });
      messageScale.value = withTiming(1, { duration: 120 }); // Scale back to normal
      translateY.value = withTiming(0, { duration: 200 }); // Reset position
    }
  }, [visible, opacity, scale, messageScale, translateY, menuMode, position]);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value, // Full opacity based on animation value
    };
  });

  const menuStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  // Animated style for the selected message
  const messageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: messageScale.value },
        { translateY: translateY.value },
      ],
      zIndex: 1000, // Keep selected message on top
    };
  });

  // Handle menu item press
  const handleMenuItemPress = (
    action:
      | "reply"
      | "info"
      | "delete"
      | "copy"
      | "forward"
      | "star"
      | "pin"
      | "view"
  ) => {
    if (!message) return;

    // Close menu first
    onClose();

    // Don't allow certain actions on deleted messages
    if (
      message.isDeleted &&
      ["reply", "copy", "forward", "delete"].includes(action)
    ) {
      return; // Silently ignore these actions on deleted messages
    }

    // Slight delay to allow animation to complete (WhatsApp-like behavior)
    setTimeout(() => {
      switch (action) {
        case "reply":
          onReply(message);
          break;
        case "info":
          onInfo(message);
          break;
        case "delete":
          onDelete(message);
          break;
        case "copy":
          onCopy && onCopy(message);
          break;
        case "forward":
          onForward && onForward(message);
          break;
        case "star":
          onStar && onStar(message);
          break;
        case "pin":
          onPin && onPin(message);
          break;
        case "view":
          // For image messages, open the image viewer
          if (message.type === "image" && onImagePress) {
            onImagePress(message.content);
          }
          break;
      }
    }, 150); // Add a small delay for better UX
  };

  if (!message) return null;

  const menuPosition = getMenuPosition();

  // Render the selected message with animation
  const renderSelectedMessage = () => {
    if (!message || !visible) return null;

    // Create a placeholder that matches the message's appearance
    const isTextMessage = message.type === "text";

    // Determine background color based on message state (deleted or normal)
    const backgroundColor = message.isDeleted
      ? isOutgoing
        ? colorScheme === "dark"
          ? "rgba(0, 92, 175, 0.5)" // Lighter color for deleted outgoing messages
          : "rgba(0, 92, 175, 0.5)"
        : colorScheme === "dark"
          ? "rgba(255,255,255,0.05)" // Lighter color for deleted incoming messages
          : "rgba(240,240,240,0.7)"
      : isOutgoing
        ? colorScheme === "dark"
          ? colors.primary // Use theme primary color
          : colors.primary
        : colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "#FFFFFF";

    // Determine text color
    const textColor = message.isDeleted
      ? colorScheme === "dark"
        ? "#999999"
        : "#666666"
      : isOutgoing
        ? "#FFFFFF"
        : colorScheme === "dark"
          ? "#FFFFFF"
          : "#000000";

    return (
      <Animated.View
        style={[
          styles.selectedMessageContainer,
          messageStyle,
          {
            position: "absolute",
            top: position.y,
            left: position.x,
            width: position.width,
            backgroundColor,
            borderRadius: 16,
            padding: 12,
            borderBottomLeftRadius: !isOutgoing ? 4 : 16,
            borderBottomRightRadius: isOutgoing ? 4 : 16,
            zIndex: 1001,
          },
        ]}
      >
        {message.isDeleted ? (
          // Render deleted message placeholder
          <View>
            <ThemedText
              style={{
                fontSize: 16,
                color: textColor,
                marginBottom: 14,
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              This message was deleted
            </ThemedText>
          </View>
        ) : isTextMessage ? (
          // Render normal text message
          <View>
            <ThemedText
              style={{ fontSize: 16, color: textColor, marginBottom: 14 }}
            >
              {message.content}
            </ThemedText>
          </View>
        ) : (
          // Render image message
          <View
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: 12,
              backgroundColor: "rgba(200,200,200,0.2)",
              marginBottom: 14,
              overflow: "hidden",
            }}
          >
            {message.content && (
              <Image
                source={{ uri: message.content }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </View>
        )}

        {/* Message timestamp */}
        <View
          style={{
            position: "absolute",
            bottom: 6,
            right: isOutgoing ? 12 : undefined,
            left: !isOutgoing ? 12 : undefined,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: isOutgoing
                ? "rgba(255,255,255,0.8)"
                : "rgba(96, 96, 96, 0.8)",
              fontWeight: "500",
            }}
          >
            {message.timestamp}
          </ThemedText>
          {isOutgoing && !message.isDeleted && (
            <MaterialIcons
              name={message.status === "read" ? "done-all" : "done"}
              size={14}
              color={
                message.status === "read"
                  ? colors.primary
                  : "rgba(255,255,255,0.8)"
              }
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.container}>
          {/* Blurred backdrop */}
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <BlurView
              intensity={colorScheme === "dark" ? 100 : 60}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Render the selected message with animation */}
          {renderSelectedMessage()}

          {/* Animated menu */}
          <Animated.View
            style={[
              styles.menuContainer,
              menuStyle,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(40, 40, 40, 0.8)"
                    : colors.surface,
              },
            ]}
          >
            {/* Different menu options based on message type */}
            {message.isDeleted ? (
              // Deleted message menu options (limited)
              <>
                {/* Info option (only for outgoing messages) */}
                {isOutgoing && (
                  <TouchableOpacity
                    style={[styles.menuItem, styles.lastMenuItem]}
                    onPress={() => handleMenuItemPress("info")}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={22}
                      color={colors.text}
                      style={styles.menuIcon}
                    />
                    <ThemedText style={styles.menuText}>Info</ThemedText>
                  </TouchableOpacity>
                )}
              </>
            ) : message.type === "image" ? (
              // Image message menu options
              <>
                {/* View option (for image messages) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("view")}
                >
                  <MaterialIcons
                    name="visibility"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>View</ThemedText>
                </TouchableOpacity>

                {/* Reply option (always available) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("reply")}
                >
                  <MaterialIcons
                    name="reply"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Reply</ThemedText>
                </TouchableOpacity>

                {/* Info option (only for outgoing messages) */}
                {isOutgoing && (
                  <TouchableOpacity
                    style={[styles.menuItem]}
                    onPress={() => handleMenuItemPress("info")}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={22}
                      color={colors.text}
                      style={styles.menuIcon}
                    />
                    <ThemedText style={styles.menuText}>Info</ThemedText>
                  </TouchableOpacity>
                )}

                {/* Delete option (only for outgoing messages) */}
                {isOutgoing && (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.lastMenuItem, // Apply lastMenuItem style to remove bottom border
                    ]}
                    onPress={() => handleMenuItemPress("delete")}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color="#FF3B30"
                      style={styles.menuIcon}
                    />
                    <ThemedText style={[styles.menuText, { color: "#FF3B30" }]}>
                      Delete
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              // Text message menu options
              <>
                {/* Reply option (always available) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("reply")}
                >
                  <MaterialIcons
                    name="reply"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Reply</ThemedText>
                </TouchableOpacity>

                {/* Forward option (always available) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("forward")}
                >
                  <MaterialIcons
                    name="forward"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Forward</ThemedText>
                </TouchableOpacity>

                {/* Copy option (always available) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("copy")}
                >
                  <MaterialIcons
                    name="content-copy"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Copy</ThemedText>
                </TouchableOpacity>

                {/* Info option (only for outgoing messages) */}
                {isOutgoing && (
                  <TouchableOpacity
                    style={[styles.menuItem]}
                    onPress={() => handleMenuItemPress("info")}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={22}
                      color={colors.text}
                      style={styles.menuIcon}
                    />
                    <ThemedText style={styles.menuText}>Info</ThemedText>
                  </TouchableOpacity>
                )}

                {/* Star option (always available) */}
                <TouchableOpacity
                  style={[styles.menuItem]}
                  onPress={() => handleMenuItemPress("star")}
                >
                  <MaterialIcons
                    name="star-outline"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Star</ThemedText>
                </TouchableOpacity>

                {/* Pin option (always available) */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    !isOutgoing && styles.lastMenuItem, // Apply lastMenuItem style when it's the last item (no Delete option)
                  ]}
                  onPress={() => handleMenuItemPress("pin")}
                >
                  <MaterialIcons
                    name="push-pin"
                    size={22}
                    color={colors.text}
                    style={styles.menuIcon}
                  />
                  <ThemedText style={styles.menuText}>Pin</ThemedText>
                </TouchableOpacity>

                {/* Delete option (only for outgoing messages) */}
                {isOutgoing && (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      styles.deleteItem,
                      styles.lastMenuItem, // Apply lastMenuItem style to remove bottom border
                    ]}
                    onPress={() => handleMenuItemPress("delete")}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={22}
                      color="#FF3B30"
                      style={styles.menuIcon}
                    />
                    <ThemedText style={[styles.menuText, { color: "#FF3B30" }]}>
                      Delete
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: "absolute",
    width: 240,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(153, 153, 153, 0.15)",
  },
  menuItemSelected: {
    backgroundColor: "rgba(56, 95, 255, 0.1)", // Light blue highlight for light mode
  },
  lastMenuItem: {
    borderBottomWidth: 0, // Remove bottom border for last item
  },
  deleteItem: {
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  selectedMessageContainer: {
    position: "absolute",
    zIndex: 1000,
  },
});
