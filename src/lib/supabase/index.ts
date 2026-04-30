/**
 * Shared Supabase config + types (safe from Client and Server Components).
 *
 * - Browser: `import { createSupabaseBrowserClient } from "@/lib/supabase/client"`
 * - Server: `import { createSupabaseServerClient } from "@/lib/supabase/server"`
 */
export { getSupabasePublicConfig } from "./env";
export type { Database, TableInsert, TableRow, TableUpdate } from "@/types/database";
