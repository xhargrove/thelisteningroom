import type { User } from "@supabase/supabase-js";

/**
 * Admin access is granted when Supabase Auth `app_metadata.role === "admin"`.
 * Set in Dashboard → Authentication → Users → user → App Metadata, or via Admin API / SQL on `auth.users`.
 * Do not rely on `user_metadata` for authorization.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.app_metadata || typeof user.app_metadata !== "object") {
    return false;
  }
  const role = (user.app_metadata as Record<string, unknown>).role;
  return role === "admin";
}
