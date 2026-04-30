import type { User } from "@supabase/supabase-js";

/**
 * Admin access is granted when either:
 * 1) Supabase Auth `app_metadata.role === "admin"`, or
 * 2) the signed-in email matches `NEXT_PUBLIC_ADMIN_EMAIL`.
 *
 * `NEXT_PUBLIC_ADMIN_EMAIL` is a simple single-admin allowlist to avoid
 * manual role edits during development and operation.
 * Do not rely on `user_metadata` for authorization.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  const configuredAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase();

  if (configuredAdminEmail && userEmail && userEmail === configuredAdminEmail) {
    return true;
  }

  if (!user?.app_metadata || typeof user.app_metadata !== "object") {
    return false;
  }

  const role = (user.app_metadata as Record<string, unknown>).role;
  return role === "admin";
}
