import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  NOTIFICATION_DISMISS_TIME,
  NotificationData,
} from "@/src/services/NotificationManager";
import { SoundManager } from "@/src/services/SoundManager";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ToastNotificationProps {
  notification: NotificationData;
  onPress: (chatId: string) => void;
  onDismiss: () => void;
}

export function ToastNotification({
  notification,
  onPress,
  onDismiss,
}: ToastNotificationProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const gestureTranslateY = useSharedValue(0);

  // Format message preview (truncate if too long)
  const messagePreview =
    notification.messagePreview.length > 40
      ? `${notification.messagePreview.substring(0, 40)}...`
      : notification.messagePreview;

  // Format timestamp
  const formattedTime = new Date(notification.timestamp).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  // Handle notification press
  const handlePress = () => {
    // Provide haptic feedback
    SoundManager.provideHapticFeedback();

    // Dismiss the notification with animation
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)();
    });

    // Navigate to the chat
    onPress(notification.chatId);
  };

  // Handle swipe gesture
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = gestureTranslateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow upward swipes
      if (event.translationY < 0) {
        gestureTranslateY.value = ctx.startY + event.translationY;
      }
    },
    onEnd: (event) => {
      // If swiped up enough, dismiss the notification
      if (event.translationY < -50) {
        gestureTranslateY.value = withTiming(-100, { duration: 300 });
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        // Otherwise, spring back to original position
        gestureTranslateY.value = withSpring(0);
      }
    },
  });

  // Combined animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value + gestureTranslateY.value }],
      opacity: opacity.value,
    };
  });

  // Auto-dismiss after timeout
  useEffect(() => {
    // Animate in
    translateY.value = withSpring(0, { damping: 15 });
    opacity.value = withTiming(1, { duration: 300 });

    // Auto-dismiss after timeout
    const dismissTimeout = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onDismiss)();
      });
    }, NOTIFICATION_DISMISS_TIME);

    return () => clearTimeout(dismissTimeout);
  }, []);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <BlurView
          intensity={colorScheme === "dark" ? 40 : 30}
          tint={colorScheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.content}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {notification.senderAvatarUrl ? (
              <Image
                source={{ uri: notification.senderAvatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.defaultAvatar,
                  { backgroundColor: colors.primary },
                ]}
              >
                <ThemedText style={styles.defaultAvatarText}>
                  {notification.senderName.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Message content */}
          <View style={styles.messageContainer}>
            <View style={styles.messageHeader}>
              <ThemedText style={styles.senderName} numberOfLines={1}>
                {notification.senderName}
              </ThemedText>
              <ThemedText
                style={styles.timestamp}
                lightColor={Colors.light.tabIconDefault}
                darkColor={Colors.dark.tabIconDefault}
              >
                {formattedTime}
              </ThemedText>
            </View>
            <ThemedText style={styles.messagePreview} numberOfLines={1}>
              {messagePreview}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  messagePreview: {
    fontSize: 14,
  },
});
