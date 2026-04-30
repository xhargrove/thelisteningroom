/**
 * Event flyer uploads storage bucket.
 * Can be overridden by env if needed per environment.
 */
export function getEventFlyerBucketId(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_EVENT_FLYER_BUCKET?.trim() ||
    process.env.SUPABASE_EVENT_FLYER_BUCKET?.trim() ||
    "event-flyers"
  );
}
