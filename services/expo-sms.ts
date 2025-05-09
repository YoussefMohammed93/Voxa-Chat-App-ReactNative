import * as SMS from "expo-sms";

/**
 * Check if SMS is available on the device
 * @returns A promise that resolves to a boolean indicating if SMS is available
 */

export const isSMSAvailable = async (): Promise<boolean> => {
  const isAvailable = await SMS.isAvailableAsync();
  return isAvailable;
};

/**
 * Send an SMS message using the device's native SMS app
 * @param to The phone number to send the message to (with country code)
 * @param body The message body
 * @returns A promise that resolves when the SMS app is opened
 */

export const sendSMS = async (
  to: string,
  body: string
): Promise<{ result: string }> => {
  try {
    // Format the phone number to E.164 format if it's not already
    const formattedTo = to.startsWith("+") ? to : `+${to}`;

    // Check if SMS is available
    const isAvailable = await isSMSAvailable();
    if (!isAvailable) {
      throw new Error("SMS is not available on this device");
    }

    // Open the SMS app with the message
    const result = await SMS.sendSMSAsync([formattedTo], body);
    return result;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

/**
 * Send a verification code via the device's native SMS app
 * @param phoneNumber The phone number to send the code to
 * @param countryCode The country code for the phone number
 * @param code The verification code to send
 * @returns A promise that resolves when the SMS app is opened
 */

export const sendVerificationCode = async (
  phoneNumber: string,
  countryCode: string,
  code: string
): Promise<{ result: string }> => {
  // Format the phone number
  const to = `${countryCode}${phoneNumber}`;

  // Create the message body
  const body = `Your Voxa Chat verification code is: ${code}`;

  // Send the SMS
  return await sendSMS(to, body);
};
