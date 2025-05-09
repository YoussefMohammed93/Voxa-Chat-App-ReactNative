import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage key prefix for verification codes
const VERIFICATION_CODE_PREFIX = "verification_code_";

/**
 * Generate a random 6-digit verification code
 * @returns A 6-digit verification code as a string
 */

export const generateVerificationCode = (): string => {
  // Generate a random 6-digit number
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Save a verification code for a phone number
 * @param phoneNumber The phone number to save the code for
 * @param countryCode The country code for the phone number
 * @param code The verification code to save
 */

export const saveVerificationCode = async (
  phoneNumber: string,
  countryCode: string,
  code: string
): Promise<void> => {
  try {
    const fullNumber = `${countryCode}${phoneNumber}`;
    const key = `${VERIFICATION_CODE_PREFIX}${fullNumber}`;

    // Save the code with an expiration time (5 minutes from now)
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    const data = {
      code,
      expirationTime,
    };

    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved verification code ${code} for ${fullNumber}`);
  } catch (error) {
    console.error("Error saving verification code:", error);
    throw error;
  }
};

/**
 * Verify a code for a phone number
 * @param phoneNumber The phone number to verify the code for
 * @param countryCode The country code for the phone number
 * @param code The verification code to verify
 * @returns True if the code is valid, false otherwise
 */

export const verifyCode = async (
  phoneNumber: string,
  countryCode: string,
  code: string
): Promise<boolean> => {
  try {
    const fullNumber = `${countryCode}${phoneNumber}`;
    const key = `${VERIFICATION_CODE_PREFIX}${fullNumber}`;

    const storedDataString = await AsyncStorage.getItem(key);
    if (!storedDataString) {
      console.log(`No verification code found for ${fullNumber}`);
      return false;
    }

    const storedData = JSON.parse(storedDataString);
    const { code: storedCode, expirationTime } = storedData;

    // Check if the code has expired
    if (Date.now() > expirationTime) {
      console.log(`Verification code for ${fullNumber} has expired`);
      // Remove expired code
      await AsyncStorage.removeItem(key);
      return false;
    }

    // Check if the code matches
    const isValid = storedCode === code;

    console.log(
      `Verification result for ${fullNumber}: ${isValid ? "Valid" : "Invalid"}`
    );

    // If valid, remove the code from storage
    if (isValid) {
      await AsyncStorage.removeItem(key);
    }

    return isValid;
  } catch (error) {
    console.error("Error verifying code:", error);
    return false;
  }
};

/**
 * Send a verification code via SMS using a direct SMS API
 * This is a simulation for now - in a real app, you would use a service like Twilio
 * @param phoneNumber The phone number to send the code to
 * @param countryCode The country code for the phone number
 * @returns A promise that resolves with the generated code
 */

export const sendVerificationSMS = async (
  phoneNumber: string,
  countryCode: string
): Promise<string> => {
  try {
    // Generate a verification code
    const code = generateVerificationCode();

    // Format the phone number
    const to = `${countryCode}${phoneNumber}`;

    // Create the message body
    const body = `Your Voxa Chat verification code is: ${code}`;

    // Save the verification code locally
    await saveVerificationCode(phoneNumber, countryCode, code);

    // For now, we'll simulate sending an SMS
    console.log(`SIMULATED SMS to ${to}: ${body}`);

    // In a real app, you would return the API response
    // For now, just return the code
    return code;
  } catch (error) {
    console.error("Error sending verification SMS:", error);
    throw error;
  }
};
