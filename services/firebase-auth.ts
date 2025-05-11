import { initializeApp } from "firebase/app";
import {
  ApplicationVerifier,
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Store the verification ID for later use
let storedVerificationId: string | null = null;

/**
 * Initialize the reCAPTCHA verifier
 * @param containerOrId The container element or ID for the reCAPTCHA widget
 * @returns The RecaptchaVerifier instance
**Revising Constructor Arguments**

/**
 * Send a verification code to the user's phone
 * @param phoneNumber The phone number with country code (e.g., +1234567890)
 * @param recaptchaVerifier The RecaptchaVerifier instance
 * @returns A promise that resolves with the confirmation result
 */

export const sendVerificationCode = async (
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
) => {
  try {
    // Format the phone number to E.164 format if it's not already
    const formattedPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;

    // Send the verification code
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      formattedPhoneNumber,
      recaptchaVerifier
    );

    // Store the verification ID for later use
    storedVerificationId = confirmationResult.verificationId;

    return confirmationResult;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
};

/**
 * Verify the code entered by the user
 * @param verificationCode The 6-digit verification code entered by the user
 * @returns A promise that resolves with the user credential
 */

export const verifyCode = async (verificationCode: string) => {
  try {
    if (!storedVerificationId) {
      throw new Error("No verification ID found. Please request a new code.");
    }

    // Create a credential with the verification ID and code
    const credential = PhoneAuthProvider.credential(
      storedVerificationId,
      verificationCode
    );

    // Sign in with the credential
    const result = await signInWithCredential(auth, credential);

    // Clear the stored verification ID
    storedVerificationId = null;

    return result;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

/**
 * Get the current user
 * @returns The current user or null if not signed in
 */

export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Sign out the current user
 * @returns A promise that resolves when the user is signed out
 */

export const signOut = async () => {
  return auth.signOut();
};
