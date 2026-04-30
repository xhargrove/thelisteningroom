import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Server-only typed Supabase client (Server Components, Route Handlers, Server Actions). */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  // Default schema typing avoids `never` when manual `Database` ≠ Supabase `GenericSchema`.
  // Use `TableInsert` / `TableRow` from `@/types/database` at call sites, or run `supabase gen types`.
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Session refresh from Middleware when you add it.
        }
      },
    },
  });
}
