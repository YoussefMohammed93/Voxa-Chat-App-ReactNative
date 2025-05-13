import { Id } from "@/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { SoundManager } from "./SoundManager";

// Keys for storing notification preferences in AsyncStorage
export const NOTIFICATION_PREFS_KEY = "notification_preferences";
export const MUTED_CHATS_KEY = "muted_chats";

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  showInAppNotifications: true,
  playNotificationSounds: true,
  vibrateOnNotification: true,
};

// Interface for notification preferences
export interface NotificationPreferences {
  showInAppNotifications: boolean;
  playNotificationSounds: boolean;
  vibrateOnNotification: boolean;
}

// Interface for notification data
export interface NotificationData {
  id: string;
  senderAvatarUrl?: string;
  senderName: string;
  messagePreview: string;
  timestamp: number;
  chatId: string;
}

// Interface for notification queue item
interface NotificationQueueItem extends NotificationData {
  isProcessing: boolean;
}

// Maximum number of notifications to show in queue
const MAX_QUEUE_SIZE = 3;

// Notification processing delay in ms
const NOTIFICATION_DELAY = 500;

// Notification auto-dismiss time in ms
export const NOTIFICATION_DISMISS_TIME = 4000;

/**
 * Hook to manage in-app notifications
 * @param userId Current user ID
 * @param activeChatId Currently active chat ID (if user is viewing a chat)
 * @returns Object with notification state and methods
 */
export function useNotificationManager(
  userId: Id<"users"> | null,
  activeChatId: string | null
) {
  // State for notification queue
  const [notificationQueue, setNotificationQueue] = useState<
    NotificationQueueItem[]
  >([]);

  // State for notification preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );

  // State for muted chats
  const [mutedChats, setMutedChats] = useState<string[]>([]);

  // State for current notification
  const [currentNotification, setCurrentNotification] =
    useState<NotificationData | null>(null);

  // State for connection status
  const [isConnected, setIsConnected] = useState(true);

  // State for reconnection attempts
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Initialize sound manager
  useEffect(() => {
    SoundManager.initialize();

    // Load notification preferences
    loadPreferences();

    // Load muted chats
    loadMutedChats();

    return () => {
      SoundManager.cleanup();
    };
  }, []);

  // Load notification preferences from AsyncStorage
  const loadPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  };

  // Load muted chats from AsyncStorage
  const loadMutedChats = async () => {
    try {
      const storedMutedChats = await AsyncStorage.getItem(MUTED_CHATS_KEY);
      if (storedMutedChats) {
        setMutedChats(JSON.parse(storedMutedChats));
      }
    } catch (error) {
      console.error("Failed to load muted chats:", error);
    }
  };

  // Save notification preferences to AsyncStorage
  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_PREFS_KEY,
        JSON.stringify(newPrefs)
      );
      setPreferences(newPrefs);
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    }
  };

  // Save muted chats to AsyncStorage
  const saveMutedChats = async (newMutedChats: string[]) => {
    try {
      await AsyncStorage.setItem(
        MUTED_CHATS_KEY,
        JSON.stringify(newMutedChats)
      );
      setMutedChats(newMutedChats);
    } catch (error) {
      console.error("Failed to save muted chats:", error);
    }
  };

  // Toggle mute status for a chat
  const toggleMuteChat = async (chatId: string) => {
    const newMutedChats = mutedChats.includes(chatId)
      ? mutedChats.filter((id) => id !== chatId)
      : [...mutedChats, chatId];

    await saveMutedChats(newMutedChats);
    return !mutedChats.includes(chatId);
  };

  // Check if a chat is muted
  const isChatMuted = (chatId: string) => {
    return mutedChats.includes(chatId);
  };

  // Process the notification queue - use a ref to track if we're currently processing
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // If we're already processing or there are no notifications, return
    if (
      isProcessingRef.current ||
      notificationQueue.length === 0 ||
      !preferences.showInAppNotifications
    ) {
      return;
    }

    // Find the first unprocessed notification
    const nextNotificationIndex = notificationQueue.findIndex(
      (notification) => !notification.isProcessing
    );

    if (nextNotificationIndex === -1) {
      return;
    }

    // Set processing flag
    isProcessingRef.current = true;

    // Create a function to process the notification
    const processNotification = () => {
      try {
        // Get the notification to show
        const notificationToShow = notificationQueue[nextNotificationIndex];
        if (!notificationToShow) {
          isProcessingRef.current = false;
          return;
        }

        // Show the notification
        setCurrentNotification(notificationToShow);

        // Play sound if enabled
        if (preferences.playNotificationSounds) {
          SoundManager.playNotificationSound();
        }

        // Remove the notification from the queue after a delay
        setTimeout(() => {
          setNotificationQueue((prevQueue) => {
            // Filter out the processed notification
            return prevQueue.filter(
              (_, index) => index !== nextNotificationIndex
            );
          });

          // Clear current notification after auto-dismiss time
          setTimeout(() => {
            setCurrentNotification(null);
            // Reset processing flag
            isProcessingRef.current = false;
          }, NOTIFICATION_DISMISS_TIME);
        }, NOTIFICATION_DELAY);
      } catch (error) {
        console.error("Error processing notification:", error);
        isProcessingRef.current = false;
      }
    };

    // Execute the processing function
    processNotification();

    // No dependencies here - we only want this to run when the queue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationQueue.length]);

  // Return the notification manager interface
  return {
    currentNotification,
    preferences,
    mutedChats,
    isConnected,
    savePreferences,
    toggleMuteChat,
    isChatMuted,
    dismissNotification: () => setCurrentNotification(null),
    addNotification: (notification: NotificationData) => {
      try {
        // Don't add notifications if they're disabled
        if (!preferences.showInAppNotifications) {
          return;
        }

        // Don't add notifications for the active chat
        if (activeChatId === notification.chatId) {
          return;
        }

        // Don't add notifications for muted chats
        if (mutedChats.includes(notification.chatId)) {
          return;
        }

        // Create a stable copy of the notification
        const stableNotification = {
          id: notification.id,
          senderAvatarUrl: notification.senderAvatarUrl,
          senderName: notification.senderName,
          messagePreview: notification.messagePreview,
          timestamp: notification.timestamp,
          chatId: notification.chatId,
          isProcessing: false,
        };

        // Add the notification to the queue
        setNotificationQueue((prevQueue) => {
          // Make a safe copy of the previous queue
          const safeQueue = Array.isArray(prevQueue) ? [...prevQueue] : [];

          // Check if we already have a notification from this chat
          const existingIndex = safeQueue.findIndex(
            (item) => item && item.chatId === notification.chatId
          );

          if (existingIndex !== -1) {
            // Update the existing notification
            const updatedQueue = [...safeQueue];
            const existingItem = updatedQueue[existingIndex];

            if (existingItem) {
              updatedQueue[existingIndex] = {
                ...stableNotification,
                isProcessing: existingItem.isProcessing,
              };
            }

            return updatedQueue;
          }

          // Add new notification to the queue, limiting to MAX_QUEUE_SIZE
          return [...safeQueue, stableNotification].slice(-MAX_QUEUE_SIZE);
        });
      } catch (error) {
        console.error("Error adding notification:", error);
      }
    },
  };
}
