"use client";

import { useMemo, useState } from "react";
import { VideoCard } from "@/components/videos/video-card";
import { VideoGalleryEmpty } from "@/components/videos/video-gallery-empty";
import type { TableRow } from "@/types/database";

type Video = TableRow<"videos">;

export function VideosGallery({ videos }: { videos: Video[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => {
      const title = v.title.toLowerCase();
      const cat = (v.category ?? "").toLowerCase();
      return title.includes(q) || cat.includes(q);
    });
  }, [videos, searchTerm]);

  if (videos.length === 0) {
    return <VideoGalleryEmpty />;
  }

  return (
    <>
      <div className="mx-auto mb-12 max-w-md">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search videos…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/25"
            aria-label="Search videos by title or category"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 px-8 py-8">
            <svg
              className="h-12 w-12 text-zinc-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <div>
              <h2 className="mb-2 text-xl font-bold text-white">No videos match</h2>
              <p className="text-zinc-400">Try a different search term.</p>
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video, index) => (
            <li key={video.id}>
              <VideoCard video={video} index={index} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
