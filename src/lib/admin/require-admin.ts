import { isAdminUser } from "@/lib/auth/is-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminSupabase() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    throw new Error("Unauthorized");
  }
  return supabase;
}
