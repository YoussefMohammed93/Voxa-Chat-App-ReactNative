import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Message } from "@/models/mockData";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
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

interface MessageActionMenuProps {
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
}

export function MessageActionMenu({
  visible,
  message,
  isOutgoing,
  position,
  selectedMessageId,
  onClose,
  onReply,
  onInfo,
  onDelete,
  onCopy,
  onForward,
  onStar,
  onPin,
}: MessageActionMenuProps) {
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

  // Menu height (approximate based on number of items)
  const MENU_HEIGHT = 350; // Height of menu with all options

  // Calculate menu position
  const getMenuPosition = () => {
    if (!position) return { top: 0, left: 0 };

    const screenHeight = Dimensions.get("window").height;
    const spaceBelow = screenHeight - (position.y + position.height);

    // Check if there's enough space below the message for the menu
    if (spaceBelow < MENU_HEIGHT + 20) {
      // Not enough space below, set mode to fixedTop
      if (menuMode !== "fixedTop") {
        setMenuMode("fixedTop");
      }

      // Position at the top of the screen with some padding
      return {
        top: 80 + position.height + 10, // Fixed position from top + message height + padding
        left: 20, // Left edge padding
      };
    } else {
      // Enough space below, set mode to inline
      if (menuMode !== "inline") {
        setMenuMode("inline");
      }

      // Position the menu below the message bubble
      let top = position.y + position.height + 10; // Position below the bubble

      // Center the menu horizontally under the message
      let left = position.x + position.width / 2 - 95; // 95 is half the menu width (190/2)

      // Ensure menu stays within screen bounds
      if (left < 20) left = 20; // Left edge padding
      if (left > screenWidth - 190) left = screenWidth - 190; // Right edge padding

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
    action: "reply" | "info" | "delete" | "copy" | "forward" | "star" | "pin"
  ) => {
    if (!message) return;

    // Close menu first
    onClose();

    // Slight delay to allow animation to complete
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
    const backgroundColor = isOutgoing
      ? colorScheme === "dark"
        ? colors.primary // Use theme primary color instead of hardcoded WhatsApp color
        : colors.primary
      : colorScheme === "dark"
        ? "rgba(70, 70, 70, 0.9)"
        : "rgba(240, 240, 240, 0.9)";

    const textColor = isOutgoing
      ? "#FFFFFF"
      : colorScheme === "dark"
        ? "#FFFFFF"
        : "#000000";

    // Add shadow for elevation effect
    const shadowStyle = {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    };

    return (
      <Animated.View
        style={[
          styles.selectedMessageContainer,
          messageStyle,
          shadowStyle,
          {
            position: "absolute",
            top: position.y,
            left: position.x,
            width: position.width,
            height: position.height,
            backgroundColor,
            borderRadius: 16,
            padding: 12,
            borderBottomLeftRadius: !isOutgoing ? 4 : 16,
            borderBottomRightRadius: isOutgoing ? 4 : 16,
          },
        ]}
      >
        {isTextMessage ? (
          <ThemedText style={{ fontSize: 16, color: textColor }}>
            {message.content.length > 50
              ? message.content.substring(0, 50) + "..."
              : message.content}
          </ThemedText>
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              backgroundColor: "rgba(200,200,200,0.2)",
            }}
          />
        )}

        {/* Message timestamp */}
        <View
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ThemedText
            style={{
              fontSize: 11,
              color: isOutgoing
                ? "rgba(255,255,255,0.7)"
                : "rgba(100,100,100,0.7)",
            }}
          >
            {message.timestamp}
          </ThemedText>
          {isOutgoing && (
            <MaterialIcons
              name={message.status === "read" ? "done-all" : "done"}
              size={14}
              color={
                message.status === "read"
                  ? colors.primary
                  : "rgba(255,255,255,0.7)"
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
              intensity={colorScheme === "dark" ? 40 : 30}
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
                  colorScheme === "dark" ? colors.surface : colors.surface,
              },
            ]}
          >
            {/* Reply option (always available) */}
            <TouchableOpacity
              style={styles.menuItem}
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
              style={styles.menuItem}
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
              style={styles.menuItem}
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

            {/* Info option (always available) */}
            <TouchableOpacity
              style={styles.menuItem}
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

            {/* Star option (always available) */}
            <TouchableOpacity
              style={styles.menuItem}
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
              style={styles.menuItem}
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

            {/* Delete option (always available) */}
            <TouchableOpacity
              style={[styles.menuItem, styles.deleteItem]}
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
    width: 190,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
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
