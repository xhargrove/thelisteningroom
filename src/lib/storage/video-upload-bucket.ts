/**
 * Admin video file uploads (`storage.buckets`).
 * Prefer setting `NEXT_PUBLIC_SUPABASE_VIDEO_UPLOAD_BUCKET`; default matches initial migrations.
 */
export function getVideoUploadBucketId(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_VIDEO_UPLOAD_BUCKET?.trim() ||
    process.env.SUPABASE_VIDEO_UPLOAD_BUCKET?.trim() ||
    "video-uploads"
  );
}
