"use client";

import {
  detectVideoPlatform,
  getYouTubeEmbedUrl,
  getYouTubePosterUrl,
  getYouTubeVideoId,
  watchButtonLabel,
  type VideoPlatform,
} from "@/lib/videos/platform";
import {
  LazyVideoIframe,
  MUX_EMBED_ALLOW,
  YOUTUBE_EMBED_ALLOW,
} from "@/components/videos/lazy-video-iframe";
import { formatGalleryDate } from "@/lib/dates/format-gallery-date";
import type { TableRow } from "@/types/database";

type Video = TableRow<"videos">;

function platformShortLabel(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "mux":
      return "Mux";
    case "hosted":
      return "Upload";
    default:
      return "Link";
  }
}

export function VideoCard({ video, index = 0 }: { video: Video; index?: number }) {
  const platform = detectVideoPlatform(video.video_url);
  const youtubeEmbedUrl = platform === "youtube" ? getYouTubeEmbedUrl(video.video_url) : null;
  const youtubeId = platform === "youtube" ? getYouTubeVideoId(video.video_url) : null;
  const youtubePoster =
    youtubeId && !video.thumbnail_url?.trim() ? getYouTubePosterUrl(youtubeId) : null;
  const watchLabel = watchButtonLabel(platform);
  const posted = formatGalleryDate(video.created_at);
  const category = video.category?.trim();
  const orbFlip = index % 2 === 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/90 to-night-elevated/50 transition-all hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
      <div className="relative aspect-video overflow-hidden bg-black">
        {platform === "youtube" && youtubeEmbedUrl ? (
          <LazyVideoIframe
            embedSrc={youtubeEmbedUrl}
            title={video.title}
            posterUrl={video.thumbnail_url?.trim() || youtubePoster}
            allow={YOUTUBE_EMBED_ALLOW}
          />
        ) : platform === "mux" ? (
          <LazyVideoIframe
            embedSrc={video.video_url}
            title={video.title}
            posterUrl={video.thumbnail_url?.trim()}
            allow={MUX_EMBED_ALLOW}
          />
        ) : platform === "hosted" ? (
          <video
            src={video.video_url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
            aria-label={video.title}
          />
        ) : video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-accent-dim/25 to-night-elevated px-4 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {platformShortLabel(platform)}
            </span>
            <span className="line-clamp-2 text-sm text-zinc-400">No thumbnail</span>
          </div>
        )}

        {posted ? (
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/70 px-3 py-1 backdrop-blur-sm">
            <span className="text-xs text-zinc-300">{posted}</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <span className="rounded-full border border-accent/30 bg-gradient-to-r from-accent/20 to-accent-secondary/20 px-3 py-1 text-xs font-medium text-zinc-200">
              {category}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
              Video
            </span>
          )}
          <span className="text-xs capitalize text-zinc-500">{platformShortLabel(platform)}</span>
        </div>

        <h2 className="text-xl font-bold text-white transition-colors group-hover:text-accent">
          {video.title}
        </h2>

        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-gradient-to-r from-accent/10 to-accent-secondary/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent/40 hover:from-accent/20 hover:to-accent-secondary/20 hover:shadow-lg hover:shadow-accent/20"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {watchLabel}
        </a>
      </div>

      <div
        className={`pointer-events-none absolute -right-1 -top-1 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity group-hover:opacity-20 ${
          orbFlip ? "from-accent to-accent-secondary" : "from-accent-secondary to-accent"
        }`}
        aria-hidden
      />
    </article>
  );
}
