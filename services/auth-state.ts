import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for storing authentication state
const AUTH_STATE_KEY = "auth_state";
const ONBOARDING_COMPLETED_KEY = "hasCompletedOnboarding";
const USER_FIRST_NAME_KEY = "userFirstName";
const REGISTRATION_STEP_KEY = "registration_step";
const PHONE_NUMBER_KEY = "phone_number";
const COUNTRY_CODE_KEY = "country_code";

// Registration steps
export enum RegistrationStep {
  WELCOME = "welcome",
  PHONE_VERIFICATION = "phone_verification",
  PROFILE_SETUP = "profile_setup",
  COMPLETED = "completed",
}

/**
 * Get the current authentication state
 * @returns The current authentication state
 */
export const getAuthState = async (): Promise<{
  isRegistered: boolean;
  currentStep: RegistrationStep;
  phoneNumber?: string;
  countryCode?: string;
  firstName?: string;
}> => {
  try {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = await AsyncStorage.getItem(
      ONBOARDING_COMPLETED_KEY
    );
    const registrationStep = await AsyncStorage.getItem(REGISTRATION_STEP_KEY);
    const phoneNumber = await AsyncStorage.getItem(PHONE_NUMBER_KEY);
    const countryCode = await AsyncStorage.getItem(COUNTRY_CODE_KEY);
    const firstName = await AsyncStorage.getItem(USER_FIRST_NAME_KEY);

    console.log("Auth state values:", {
      hasCompletedOnboarding,
      registrationStep,
      phoneNumber,
      countryCode,
      firstName,
    });

    // Check if user has completed onboarding AND has all required data
    if (
      hasCompletedOnboarding === "true" &&
      registrationStep === RegistrationStep.COMPLETED &&
      firstName // Require firstName as it's mandatory in the profile setup
    ) {
      console.log(
        "User has completed onboarding and has required data, returning registered state"
      );
      return {
        isRegistered: true,
        currentStep: RegistrationStep.COMPLETED,
        phoneNumber: phoneNumber || undefined,
        countryCode: countryCode || undefined,
        firstName: firstName || undefined,
      };
    }

    // If user has started registration but not completed it
    if (registrationStep) {
      console.log(
        "User has started registration, current step:",
        registrationStep
      );
      return {
        isRegistered: false,
        currentStep: registrationStep as RegistrationStep,
        phoneNumber: phoneNumber || undefined,
        countryCode: countryCode || undefined,
        firstName: firstName || undefined,
      };
    }

    // New user
    console.log("New user, redirecting to welcome screen");
    return {
      isRegistered: false,
      currentStep: RegistrationStep.WELCOME,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    // Default to new user if there's an error
    return {
      isRegistered: false,
      currentStep: RegistrationStep.WELCOME,
    };
  }
};

/**
 * Update the registration step
 * @param step The current registration step
 * @param data Additional data to store
 */
export const updateRegistrationStep = async (
  step: RegistrationStep,
  data?: {
    phoneNumber?: string;
    countryCode?: string;
    firstName?: string;
  }
): Promise<void> => {
  try {
    await AsyncStorage.setItem(REGISTRATION_STEP_KEY, step);

    // Store additional data if provided
    if (data) {
      if (data.phoneNumber) {
        await AsyncStorage.setItem(PHONE_NUMBER_KEY, data.phoneNumber);
      }
      if (data.countryCode) {
        await AsyncStorage.setItem(COUNTRY_CODE_KEY, data.countryCode);
      }
      if (data.firstName) {
        await AsyncStorage.setItem(USER_FIRST_NAME_KEY, data.firstName);
      }
    }

    // If registration is completed, update the onboarding status
    if (step === RegistrationStep.COMPLETED) {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    }
  } catch (error) {
    console.error("Error updating registration step:", error);
  }
};

/**
 * Clear all authentication state (for logout or testing)
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_STATE_KEY,
      ONBOARDING_COMPLETED_KEY,
      REGISTRATION_STEP_KEY,
      PHONE_NUMBER_KEY,
      COUNTRY_CODE_KEY,
      USER_FIRST_NAME_KEY,
    ]);
    console.log("Auth state cleared successfully");
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
};

/**
 * Debug function to print all auth-related keys in AsyncStorage
 */
export const debugAuthState = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(
      (key) =>
        key === AUTH_STATE_KEY ||
        key === ONBOARDING_COMPLETED_KEY ||
        key === REGISTRATION_STEP_KEY ||
        key === PHONE_NUMBER_KEY ||
        key === COUNTRY_CODE_KEY ||
        key === USER_FIRST_NAME_KEY
    );

    const values = await AsyncStorage.multiGet(authKeys);
    console.log(
      "Current auth state in AsyncStorage:",
      Object.fromEntries(values)
    );

    // Check if we're a new user
    if (values.length === 0 || values.every(([_, value]) => value === null)) {
      console.log("This appears to be a new user (no auth state found)");
    }
  } catch (error) {
    console.error("Error debugging auth state:", error);
  }
};

/**
 * Check if auth state is inconsistent and fix it if needed
 * This helps prevent situations where the app thinks a user is registered
 * when they haven't actually completed the registration process
 */
export const validateAuthState = async (): Promise<void> => {
  try {
    const hasCompletedOnboarding = await AsyncStorage.getItem(
      ONBOARDING_COMPLETED_KEY
    );
    const registrationStep = await AsyncStorage.getItem(REGISTRATION_STEP_KEY);
    const firstName = await AsyncStorage.getItem(USER_FIRST_NAME_KEY);

    // If onboarding is marked as completed but we don't have required data or step isn't COMPLETED,
    // the state is inconsistent - reset it
    if (
      hasCompletedOnboarding === "true" &&
      (registrationStep !== RegistrationStep.COMPLETED || !firstName)
    ) {
      console.log(
        "Inconsistent auth state detected, resetting to welcome screen"
      );
      // Reset to welcome screen
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "false");
      await AsyncStorage.setItem(
        REGISTRATION_STEP_KEY,
        RegistrationStep.WELCOME
      );
    }
  } catch (error) {
    console.error("Error validating auth state:", error);
  }
};
