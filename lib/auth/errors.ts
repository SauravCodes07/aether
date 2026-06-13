import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  email_not_confirmed:
    "Please confirm your email before signing in. Check your inbox for the verification link.",
  user_already_exists: "An account with this email already exists. Try signing in instead.",
  weak_password: "Password is too weak. Use at least 8 characters with mixed characters.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  signup_disabled: "Sign up is currently disabled. Please contact support.",
};

export function mapAuthError(error: AuthError): string {
  if (error.message === "Invalid login credentials") {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }

  const mapped = AUTH_ERROR_MESSAGES[error.code ?? ""];
  if (mapped) return mapped;

  return error.message || "Something went wrong. Please try again.";
}
