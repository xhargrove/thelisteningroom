/**
 * Photo post uploads storage bucket.
 * Can be overridden by env if needed per environment.
 */
export function getPhotoPostBucketId(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PHOTO_BUCKET?.trim() ||
    process.env.SUPABASE_PHOTO_BUCKET?.trim() ||
    "photo-posts"
  );
}
