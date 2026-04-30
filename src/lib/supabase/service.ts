import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

/** Server-only: bypasses RLS (signed upload URLs, etc.). Never import from client code. */
export function createSupabaseServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for storage uploads.");
  }
  const { url } = getSupabasePublicConfig();
  return createClient(url, key);
}
