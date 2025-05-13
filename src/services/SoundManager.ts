import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * SoundManager class for handling notification sounds and haptic feedback
 * This is a simplified version that only provides haptic feedback
 * since we don't have an actual sound file yet
 */
class SoundManagerClass {
  private soundLoaded: boolean = false;
  private lastPlayTime: number = 0;
  private minTimeBetweenSounds: number = 1000; // Minimum time between sounds in ms

  /**
   * Initialize the sound manager
   */
  async initialize() {
    try {
      // In a real implementation, we would load the sound file here
      // For now, we'll just set soundLoaded to true
      this.soundLoaded = true;
      console.log("Sound manager initialized");
    } catch (error) {
      console.error("Failed to initialize sound manager:", error);
      this.soundLoaded = false;
    }
  }

  /**
   * Play the notification sound
   * @returns Promise that resolves when the sound is played
   */
  async playNotificationSound() {
    // Check if we've played a sound recently
    const now = Date.now();
    if (now - this.lastPlayTime < this.minTimeBetweenSounds) {
      console.log("Skipping sound playback (too frequent)");
      return;
    }

    // Provide haptic feedback instead of playing a sound
    this.provideHapticFeedback();

    // Update last play time
    this.lastPlayTime = now;
  }

  /**
   * Provide haptic feedback for a notification
   */
  provideHapticFeedback() {
    // Skip haptic feedback on web
    if (Platform.OS === "web") {
      return;
    }

    try {
      // Use light impact for notifications
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to provide haptic feedback:", error);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    // Nothing to clean up in this simplified version
    this.soundLoaded = false;
  }
}

// Export a singleton instance
export const SoundManager = new SoundManagerClass();
