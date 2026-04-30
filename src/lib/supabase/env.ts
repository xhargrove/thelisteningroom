/**
 * Single source for public Supabase URL + anon key (browser + server).
 */
export function hasSupabasePublicConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local.",
    );
  }
  return { url, anonKey };
}

/** Project ref from `NEXT_PUBLIC_SUPABASE_URL` host (`https://<ref>.supabase.co`) or optional `NEXT_PUBLIC_SUPABASE_PROJECT_REF`. Used for Storage TUS hostname. */
export function getSupabaseProjectRef(): string {
  const explicit = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF?.trim();
  if (explicit) return explicit;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  const host = new URL(url).hostname;
  const match = /^([^.]+)\.supabase\.co$/i.exec(host);
  if (!match) {
    throw new Error(
      "Cannot derive project ref from NEXT_PUBLIC_SUPABASE_URL. Set NEXT_PUBLIC_SUPABASE_PROJECT_REF.",
    );
  }
  return match[1];
}
