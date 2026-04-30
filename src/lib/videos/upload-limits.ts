/**
 * Maximum size for admin uploads to Storage (`NEXT_PUBLIC_SUPABASE_VIDEO_UPLOAD_BUCKET`).
 *
 * Must stay in sync with `supabase/migrations/*` bucket `file_size_limit`.
 * Supabase also enforces a **plan-level** max upload size (often small on Free,
 * large on Pro) — confirm under Dashboard → Project → Billing / Storage settings.
 * Long videos increase storage and especially **egress** on public playback; see
 * https://supabase.com/pricing
 */
export const VIDEO_UPLOAD_MAX_BYTES = 15 * 1024 * 1024 * 1024;

export function videoUploadMaxLabel(): string {
  return `${VIDEO_UPLOAD_MAX_BYTES / (1024 * 1024 * 1024)} GB`;
}
