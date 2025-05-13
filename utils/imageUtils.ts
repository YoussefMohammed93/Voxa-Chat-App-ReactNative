/**
 * Utility functions for handling images in the app
 */

/**
 * Returns a valid avatar source for React Native Image component,
 * using the default placeholder if none is provided
 * @param profileImageUrl The user's profile image URL (can be null/undefined)
 * @returns A valid image source object
 */
export function getAvatarSource(profileImageUrl?: string | null): any {
  if (profileImageUrl) {
    return { uri: profileImageUrl };
  } else {
    return require("../assets/images/avatar-placeholder.png");
  }
}
