import type { Metadata } from "next";
import type { ReactNode } from "react";
import { VideosGallery } from "@/components/videos/videos-gallery";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Videos",
};

export const dynamic = "force-dynamic";

function VideosPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[60vh] overflow-hidden pt-12 sm:pt-14 lg:pt-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="mb-12 text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
            <svg
              className="h-4 w-4 shrink-0 text-accent"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-sm font-medium text-zinc-200">Video archive</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            All sets & performances
          </h1>
          <p className="mx-auto mb-2 max-w-2xl text-lg text-zinc-400">
            Watch DJ sets and highlights from The Listening Room.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

export default async function VideosPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <VideosPageShell>
        <p className="mx-auto max-w-xl text-center text-zinc-300">
          Add Supabase environment variables to load videos from the database.
        </p>
      </VideosPageShell>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: rows, error } = await supabase
    .from("videos")
    .select("id, title, video_url, thumbnail_url, category, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <VideosPageShell>
        <p className="mx-auto max-w-xl rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-center text-sm text-red-200">
          Could not load videos. Try again later.
        </p>
      </VideosPageShell>
    );
  }

  const videos = rows ?? [];

  return (
    <VideosPageShell>
      <VideosGallery videos={videos} />
    </VideosPageShell>
  );
}
