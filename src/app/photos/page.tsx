import type { Metadata } from "next";
import { PhotoCard } from "@/components/photos/photo-card";
import { PhotosEmpty } from "@/components/photos/photos-empty";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Photos",
};

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Photos</h1>
        <p className="mt-3 text-zinc-300">
          Add Supabase environment variables to load photo posts from the database.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("photos")
    .select("id, title, caption, link_url, media_urls, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Photos</h1>
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          Could not load photo posts. Try again later.
        </p>
      </div>
    );
  }

  const photos = rows ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Photos</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Photo drops, linked moments, and carousel stories from The Listening Room.
      </p>

      {photos.length === 0 ? (
        <div className="mt-12">
          <PhotosEmpty />
        </div>
      ) : (
        <ul className="mt-12 space-y-8">
          {photos.map((post) => (
            <li key={post.id}>
              <PhotoCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
