import { isAdminUser } from "@/lib/auth/is-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

async function requireAdminSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    throw new Error("Unauthorized");
  }
  return { user, supabase };
}

/** Throws if the current session is not allowed as admin (JWT role or allowlisted email). */
export async function assertAdminAccess() {
  await requireAdminSession();
}

/** User-scoped Supabase client (JWT). Admin table writes still need `app_metadata.role = admin` in RLS — prefer {@link requireAdminServiceRoleClient} for mutations if you use `NEXT_PUBLIC_ADMIN_EMAIL`. */
export async function requireAdminSupabase() {
  const { supabase } = await requireAdminSession();
  return supabase;
}

/**
 * Confirms an admin session, then returns a service-role client so DB writes succeed for both
 * JWT `app_metadata.role === "admin"` and `NEXT_PUBLIC_ADMIN_EMAIL` allowlist admins.
 * Server-only; never expose the service key to the browser.
 */
export async function requireAdminServiceRoleClient() {
  await requireAdminSession();
  return createSupabaseServiceRoleClient();
}
