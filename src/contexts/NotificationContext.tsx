import { useUser } from "@/contexts/UserContext";
import { api } from "@/convex/_generated/api";
import { ToastNotification } from "@/src/components/notifications/ToastNotification";
import {
  NotificationData,
  NotificationPreferences,
  useNotificationManager,
} from "@/src/services/NotificationManager";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Define the notification context shape
interface NotificationContextType {
  activeChatId: string | null;
  setActiveChatId: (chatId: string | null) => void;
  preferences: NotificationPreferences;
  savePreferences: (prefs: NotificationPreferences) => Promise<void>;
  toggleMuteChat: (chatId: string) => Promise<boolean>;
  isChatMuted: (chatId: string) => boolean;
}

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  activeChatId: null,
  setActiveChatId: () => {},
  preferences: {
    showInAppNotifications: true,
    playNotificationSounds: true,
    vibrateOnNotification: true,
  },
  savePreferences: async () => {},
  toggleMuteChat: async () => false,
  isChatMuted: () => false,
});

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { userId } = useUser();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Use a ref to track connection state
  const connectionStateRef = useRef({
    isConnected: true,
    lastConnectedTime: Date.now(),
  });

  // Use the notification manager directly
  const {
    currentNotification,
    preferences,
    savePreferences,
    toggleMuteChat,
    isChatMuted,
    dismissNotification,
    addNotification,
  } = useNotificationManager(userId, activeChatId);

  // Use a ref to store the last processed message timestamp
  const lastProcessedTimestampRef = useRef<number>(Date.now() - 30000);

  // Update the timestamp periodically to ensure we don't miss messages
  useEffect(() => {
    // Update the timestamp every 5 minutes to ensure we don't miss messages
    // due to clock drift or other issues
    const intervalId = setInterval(
      () => {
        if (connectionStateRef.current.isConnected) {
          // Only update if we're connected
          lastProcessedTimestampRef.current = Date.now() - 5000; // 5 second buffer
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Mark messages as read mutation
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);

  // Mark messages as read when activeChatId changes
  useEffect(() => {
    if (userId && activeChatId) {
      markMessagesAsRead({
        chatId: activeChatId,
        userId,
      }).catch((error) => {
        console.error("Failed to mark messages as read:", error);
      });
    }
  }, [userId, activeChatId, markMessagesAsRead]);

  // Query for new messages with real-time updates
  const newMessages = useQuery(
    api.messages.getUnreadMessages,
    userId
      ? {
          userId,
          lastReadTimestamp: lastProcessedTimestampRef.current,
        }
      : "skip"
  );

  // Process new messages into notifications
  useEffect(() => {
    if (!newMessages || !userId) return;

    // Update connection state
    connectionStateRef.current.isConnected = true;
    connectionStateRef.current.lastConnectedTime = Date.now();

    // Process each new message
    newMessages.forEach((message) => {
      // Skip messages from the current user
      if (message.senderId === userId) return;

      // Skip messages in the active chat
      if (message.chatId === activeChatId) return;

      // Skip messages that are older than the last processed timestamp
      if (message.timestamp <= lastProcessedTimestampRef.current) return;

      // Update the last processed timestamp
      lastProcessedTimestampRef.current = Math.max(
        lastProcessedTimestampRef.current,
        message.timestamp
      );

      // Get sender details from the message
      const sender = message.sender;

      if (!sender) {
        console.warn("Sender not found for message:", message._id);
        return;
      }

      // Create notification data
      const notification: NotificationData = {
        id: message._id,
        senderAvatarUrl: sender.profileImageUrl,
        senderName: `${sender.firstName} ${sender.lastName}`,
        messagePreview: message.content,
        timestamp: message.timestamp,
        chatId: message.chatId,
      };

      // Add notification to queue
      addNotification(notification);
    });
  }, [newMessages, userId, activeChatId, addNotification]);

  // Handle notification press
  const handleNotificationPress = useCallback((chatId: string) => {
    // Navigate to the chat screen
    router.push({
      pathname: "/ChatScreen",
      params: { chatId },
    });

    // Update active chat ID
    setActiveChatId(chatId);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        activeChatId,
        setActiveChatId,
        preferences,
        savePreferences,
        toggleMuteChat,
        isChatMuted,
      }}
    >
      {children}

      {/* Render the current notification if there is one */}
      {currentNotification && (
        <ToastNotification
          notification={currentNotification}
          onPress={handleNotificationPress}
          onDismiss={dismissNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
