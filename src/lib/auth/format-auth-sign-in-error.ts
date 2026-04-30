import type { AuthError } from "@supabase/supabase-js";

/** Maps GoTrue / Supabase Auth codes to short, actionable copy for the login UI. */
export function formatAuthSignInError(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Invalid email or password. Reset the password in Supabase → Authentication → Users, or create the user there if missing.";
    case "email_not_confirmed":
      return "Email not confirmed. Click the link in the signup email, or in Dashboard → Users open the user and confirm / disable “Confirm email” for testing.";
    case "user_banned":
      return "This account is banned. Unban it in Supabase → Authentication → Users.";
    case "over_request_rate_limit":
      return "Too many attempts. Wait a minute and try again.";
    case "signup_disabled":
      return "Email signups are disabled in this project. Enable Email provider or create the user in the Dashboard.";
    default:
      return error.message;
  }
}
