import type { SupabaseClient } from "@supabase/supabase-js";
import type { TableRow } from "@/types/database";

export type AdminDashboardPayload = {
  stats: {
    totalEmails: number;
    totalMixes: number;
    pendingMixes: number;
    featuredMixes: number;
    publishedVideos: number;
    publishedPhotos: number;
    upcomingEvents: number;
  };
  emails: TableRow<"emails">[];
  mixes: TableRow<"dj_mixes">[];
  videos: TableRow<"videos">[];
  photos: TableRow<"photos">[];
  events: TableRow<"events">[];
  loadError: string | null;
};

function emptyPayload(): AdminDashboardPayload {
  return {
    stats: {
      totalEmails: 0,
      totalMixes: 0,
      pendingMixes: 0,
      featuredMixes: 0,
      publishedVideos: 0,
      publishedPhotos: 0,
      upcomingEvents: 0,
    },
    emails: [],
    mixes: [],
    videos: [],
    photos: [],
    events: [],
    loadError: null,
  };
}

export async function loadAdminDashboard(
  supabase: SupabaseClient,
): Promise<AdminDashboardPayload> {
  const nowIso = new Date().toISOString();

  const [
    emailsCountRes,
    mixesCountRes,
    pendingCountRes,
    featuredCountRes,
    publishedVideosCountRes,
    publishedPhotosCountRes,
    upcomingEventsCountRes,
    emailsRes,
    mixesRes,
    videosRes,
    photosRes,
    eventsRes,
  ] = await Promise.all([
    supabase.from("emails").select("*", { count: "exact", head: true }),
    supabase.from("dj_mixes").select("*", { count: "exact", head: true }),
    supabase.from("dj_mixes").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("dj_mixes").select("*", { count: "exact", head: true }).eq("status", "featured"),
    supabase.from("videos").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("photos").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", nowIso),
    supabase.from("emails").select("*").order("created_at", { ascending: false }).limit(150),
    supabase.from("dj_mixes").select("*").order("created_at", { ascending: false }).limit(150),
    supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(150),
    supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(150),
    supabase
      .from("events")
      .select("*")
      .gte("event_date", nowIso)
      .order("event_date", { ascending: true })
      .limit(150),
  ]);

  const errs = [
    emailsCountRes.error,
    mixesCountRes.error,
    pendingCountRes.error,
    featuredCountRes.error,
    publishedVideosCountRes.error,
    publishedPhotosCountRes.error,
    upcomingEventsCountRes.error,
    emailsRes.error,
    mixesRes.error,
    videosRes.error,
    photosRes.error,
    eventsRes.error,
  ].filter(Boolean);

  if (errs.length > 0) {
    return {
      ...emptyPayload(),
      loadError:
        errs[0]?.message ??
        "Could not load data. Apply the admin RLS migration in Supabase and confirm your JWT includes app_metadata.role = admin.",
    };
  }

  return {
    stats: {
      totalEmails: emailsCountRes.count ?? 0,
      totalMixes: mixesCountRes.count ?? 0,
      pendingMixes: pendingCountRes.count ?? 0,
      featuredMixes: featuredCountRes.count ?? 0,
      publishedVideos: publishedVideosCountRes.count ?? 0,
      publishedPhotos: publishedPhotosCountRes.count ?? 0,
      upcomingEvents: upcomingEventsCountRes.count ?? 0,
    },
    emails: emailsRes.data ?? [],
    mixes: mixesRes.data ?? [],
    videos: videosRes.data ?? [],
    photos: photosRes.data ?? [],
    events: eventsRes.data ?? [],
    loadError: null,
  };
}
