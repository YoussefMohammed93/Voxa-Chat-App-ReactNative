/**
 * Date utility functions for the chat app
 */

/**
 * Formats a date as "Today", "Yesterday", or a full date string
 * @param date The date to format
 * @returns A formatted date string
 */

export function formatMessageDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours, minutes, seconds, and milliseconds for date comparison
  const dateToCompare = new Date(date);
  dateToCompare.setHours(0, 0, 0, 0);

  const todayDate = new Date(today);
  todayDate.setHours(0, 0, 0, 0);

  const yesterdayDate = new Date(yesterday);
  yesterdayDate.setHours(0, 0, 0, 0);

  if (dateToCompare.getTime() === todayDate.getTime()) {
    return "Today";
  } else if (dateToCompare.getTime() === yesterdayDate.getTime()) {
    return "Yesterday";
  } else {
    // Format as "Month Day, Year" (e.g., "May 7, 2025")
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

/**
 * Checks if two dates are on the same day
 * @param date1 The first date
 * @param date2 The second date
 * @returns True if the dates are on the same day, false otherwise
 */

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Formats a date as a time string (e.g., "09:30")
 * @param date The date to format
 * @returns A formatted time string
 */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
