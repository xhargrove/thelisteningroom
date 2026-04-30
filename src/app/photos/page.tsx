import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PhotoCard } from "@/components/photos/photo-card";
import { PhotosEmpty } from "@/components/photos/photos-empty";
import { PhotosInstagramCta } from "@/components/photos/photos-instagram-cta";
import { coercePhotoUrls } from "@/lib/photos/media-urls";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Photos",
};

export const dynamic = "force-dynamic";

function PhotosPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[60vh] overflow-hidden pt-12 sm:pt-14 lg:pt-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-secondary/5 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="mb-12 text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-secondary/20 bg-accent-secondary/10 px-4 py-2">
            <svg
              className="h-4 w-4 shrink-0 text-accent-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm font-medium text-zinc-200">Photo gallery</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Captured moments
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Relive the energy from our events — carousels, flyers, and room highlights.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

export default async function PhotosPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <PhotosPageShell>
        <p className="mx-auto max-w-xl text-center text-zinc-300">
          Add Supabase environment variables to load photo posts from the database.
        </p>
      </PhotosPageShell>
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
      <PhotosPageShell>
        <p className="mx-auto max-w-xl rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-center text-sm text-red-200">
          Could not load photo posts. Try again later.
        </p>
      </PhotosPageShell>
    );
  }

  const photos = rows ?? [];
  const listable = photos.filter((p) => coercePhotoUrls(p.media_urls).length > 0);

  return (
    <PhotosPageShell>
      {photos.length === 0 ? (
        <PhotosEmpty />
      ) : listable.length === 0 ? (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 px-6 py-8 text-center text-sm text-amber-100">
          Published posts need at least one media URL. Add direct image links or gallery URLs in admin.
        </div>
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listable.map((post, index) => (
              <li key={post.id}>
                <PhotoCard post={post} index={index} />
              </li>
            ))}
          </ul>
          <PhotosInstagramCta />
        </>
      )}
    </PhotosPageShell>
  );
}
