import { Message } from "@/types/Message";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, Vibration, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SwipeableMessageProps {
  children: React.ReactNode;
  message: Message;
  onReply: (message: Message) => void;
  isOutgoing: boolean;
  userName?: string;
}

// Threshold for swipe to trigger reply action (in pixels)
const SWIPE_THRESHOLD = 80;
// Cooldown period to prevent multiple triggers (in ms)
const REPLY_COOLDOWN = 1000;

type GestureContext = {
  startX: number;
};

export function SwipeableMessage({
  children,
  message,
  onReply,
  isOutgoing,
}: SwipeableMessageProps) {
  // State to track if reply is on cooldown
  const [isReplyCooldown, setIsReplyCooldown] = useState(false);

  // Animated values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Function to handle reply with haptic feedback
  const handleReply = useCallback(() => {
    if (isReplyCooldown) return;

    // Set cooldown to prevent multiple triggers
    setIsReplyCooldown(true);

    // Provide haptic feedback
    if (Platform.OS === "ios") {
      // Lighter vibration for iOS
      Vibration.vibrate([0, 25]);
    } else {
      // Standard vibration for Android
      Vibration.vibrate(50);
    }

    // Trigger the reply action
    onReply(message);

    // Reset the animation
    translateX.value = withTiming(0, { duration: 300 });

    // Reset cooldown after delay
    setTimeout(() => {
      setIsReplyCooldown(false);
    }, REPLY_COOLDOWN);
  }, [message, onReply, isReplyCooldown, translateX]);

  // Gesture handler for swipe
  const panGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (event, context) => {
      // Store initial position
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      // Only allow left-to-right swipe (positive translation)
      if (event.translationX > 0) {
        // Calculate opacity based on swipe distance
        opacity.value = Math.min(event.translationX / SWIPE_THRESHOLD, 0.7);
        // Apply some resistance to the swipe
        translateX.value = context.startX + event.translationX * 0.7;
      } else {
        // For right-to-left swipes, don't move the message
        translateX.value = 0;
      }
    },
    onEnd: (event) => {
      // If swipe exceeds threshold, trigger reply
      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(handleReply)();
      } else {
        // Otherwise, spring back to original position
        translateX.value = withSpring(0);
        opacity.value = withTiming(0);
      }
    },
  });

  // Reset animation when component unmounts
  useEffect(() => {
    return () => {
      translateX.value = 0;
      opacity.value = 0;
    };
  }, [translateX, opacity]);

  // Animated styles for the message container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Animated styles for the reply indicator
  const replyIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateX: withTiming(-40 + 40 * (1 - opacity.value), {
            duration: 100,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageWrapper,
          // We don't set alignSelf here to avoid interfering with MessageBubble's layout
        ]}
      >
        {/* Invisible reply indicator (no visual icon) */}
        <Animated.View
          style={[
            styles.replyIndicator,
            replyIndicatorStyle,
            isOutgoing ? styles.replyIndicatorRight : styles.replyIndicatorLeft,
          ]}
        />

        {/* Swipeable message */}
        <PanGestureHandler
          enabled={!isReplyCooldown}
          onGestureEvent={panGestureHandler}
          activeOffsetX={[0, 20]} // Only activate for right swipes (positive X)
          failOffsetY={[-5, 5]} // Fail if moving more than 5px vertically
        >
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  messageWrapper: {
    position: "relative",
    // Don't set width or maxWidth here to avoid interfering with MessageBubble's layout
  },
  outgoingContainer: {
    alignSelf: "flex-end",
  },
  incomingContainer: {
    alignSelf: "flex-start",
  },
  replyIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "transparent",
    borderRadius: 1.5,
    zIndex: 1,
  },
  replyIndicatorLeft: {
    left: -5,
  },
  replyIndicatorRight: {
    right: -5,
  },
});
