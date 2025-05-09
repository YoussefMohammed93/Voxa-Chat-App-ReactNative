import { initializeApp } from "firebase/app";
import {
  ApplicationVerifier,
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB67Au2tkik_IEIv_Ue8O56J5JIT8TUMc4",
  authDomain: "voxa-chat-f72a6.firebaseapp.com",
  projectId: "voxa-chat-f72a6",
  storageBucket: "voxa-chat-f72a6.firebasestorage.app",
  messagingSenderId: "60906794720",
  appId: "1:60906794720:web:0edf2e86235b9f8bd1aa85",
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
