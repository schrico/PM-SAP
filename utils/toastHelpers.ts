/**
 * Converts technical error messages to user-friendly messages
 * Logs the original error to console for debugging
 */
export function getUserFriendlyError(error: Error | unknown, context?: string): string {
  // Log original error for debugging
  console.error(`Error${context ? ` in ${context}` : ""}:`, error);

  if (!(error instanceof Error)) {
    return "An unexpected error occurred. Please try again.";
  }

  const errorMessage = error.message.toLowerCase();
  const originalMessage = error.message;

  // Database constraint errors
  if (errorMessage.includes("unique constraint") || errorMessage.includes("duplicate key")) {
    if (errorMessage.includes("avatar")) {
      return "This avatar is already taken. Please choose a different one.";
    }
    if (errorMessage.includes("color")) {
      return "This color setting already exists.";
    }
    return "This item already exists. Please check and try again.";
  }

  // Foreign key constraint errors
  if (errorMessage.includes("foreign key constraint") || errorMessage.includes("violates foreign key")) {
    return "Cannot perform this action. The item may have been deleted or is in use.";
  }

  // Not found errors
  if (errorMessage.includes("not found") || errorMessage.includes("does not exist")) {
    return "The requested item could not be found. It may have been deleted.";
  }

  // Permission/authentication errors
  if (errorMessage.includes("permission") || errorMessage.includes("unauthorized") || errorMessage.includes("not authenticated")) {
    return "You don't have permission to perform this action. Please contact an administrator.";
  }

  // Network/connection errors
  if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("connection")) {
    return "Connection error. Please check your internet connection and try again.";
  }

  // Database column errors (configuration issues)
  if (errorMessage.includes("column") && errorMessage.includes("does not exist")) {
    return "Configuration error. Please contact support.";
  }

  // Validation errors
  if (errorMessage.includes("required") || errorMessage.includes("invalid")) {
    return originalMessage; // Keep validation messages as-is
  }

  // Generic Supabase errors
  if (errorMessage.includes("failed to")) {
    // Extract the action from the error message
    const match = originalMessage.match(/failed to (.+?)(?:\.|:)/i);
    if (match) {
      return `Unable to ${match[1]}. Please try again.`;
    }
  }

  // If we can't make it user-friendly, return a generic message
  // but still log the original
  return "An error occurred. Please try again or contact support if the problem persists.";
}
