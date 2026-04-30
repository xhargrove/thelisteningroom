import type { Metadata } from "next";
import { VideoCard } from "@/components/videos/video-card";
import { VideoGalleryEmpty } from "@/components/videos/video-gallery-empty";
import { VideoUploadSection } from "@/components/videos/video-upload-section";
import { isAdminUser } from "@/lib/auth/is-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Videos",
};

/** Load published rows on each request (needs Supabase env at runtime, not necessarily at build). */
export const dynamic = "force-dynamic";

export default async function VideosPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Videos</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Add Supabase environment variables to load videos from the database.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const showUpload = isAdminUser(user);

  const { data: rows, error } = await supabase
    .from("videos")
    .select("id, title, video_url, thumbnail_url, category, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Videos</h1>
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          Could not load videos. Try again later.
        </p>
      </div>
    );
  }

  const videos = rows ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Videos</h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Sessions, clips, and highlights from The Listening Room — embeds, links, and uploads.
      </p>

      {showUpload ? <VideoUploadSection /> : null}

      {videos.length === 0 ? (
        <div className="mt-12">
          <VideoGalleryEmpty />
        </div>
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
