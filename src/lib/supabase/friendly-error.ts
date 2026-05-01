/** Turn cryptic Supabase REST errors into actionable text for admins. */
export function friendlySupabaseError(raw: string | undefined, fallback: string): string {
  const m = (raw ?? "").trim();
  if (!m) {
    return fallback;
  }
  if (/invalid api key/i.test(m)) {
    return `${m} — Use the service_role JWT from Supabase → Project Settings → API for the same project as NEXT_PUBLIC_SUPABASE_URL. Do not use the anon key. Redeploy on Vercel after changing env vars.`;
  }
  if (/jwt expired/i.test(m)) {
    return `${m} — Rotate keys in Supabase if needed and update Vercel env, then redeploy.`;
  }
  return m;
}
