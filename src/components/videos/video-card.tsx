import {
  detectVideoPlatform,
  getYouTubeEmbedUrl,
  watchButtonLabel,
  type VideoPlatform,
} from "@/lib/videos/platform";
import type { TableRow } from "@/types/database";

type Video = TableRow<"videos">;

function platformBadgeClass(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "bg-red-600/90 text-white";
    case "instagram":
      return "bg-gradient-to-r from-purple-600/90 to-pink-500/90 text-white";
    case "tiktok":
      return "bg-zinc-900/90 text-white ring-1 ring-white/20";
    case "mux":
      return "bg-purple-600/90 text-white";
    case "hosted":
      return "bg-accent/90 text-black";
    default:
      return "bg-zinc-800/90 text-zinc-200";
  }
}

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

export function VideoCard({ video }: { video: Video }) {
  const platform = detectVideoPlatform(video.video_url);
  const youtubeEmbedUrl = platform === "youtube" ? getYouTubeEmbedUrl(video.video_url) : null;
  const watchLabel = watchButtonLabel(platform);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-accent-dim/25 bg-night-card shadow-lg shadow-black/20">
      <div className="relative aspect-video bg-night-elevated">
        {platform === "youtube" && youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={video.title}
            className="h-full w-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : platform === "mux" ? (
          <iframe
            src={video.video_url}
            title={video.title}
            className="h-full w-full border-0 bg-black"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          />
        ) : platform === "hosted" ? (
          <video
            src={video.video_url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain bg-black"
            aria-label={video.title}
          />
        ) : video.thumbnail_url ? (
          // Thumbnails come from varied CDN hosts (YouTube, Meta, TikTok); native img avoids huge remotePatterns.
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
        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-semibold ${platformBadgeClass(platform)}`}
        >
          {platformShortLabel(platform)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="text-lg font-semibold leading-snug text-white">{video.title}</h2>
        <p className="mt-2 text-sm text-accent-muted">
          {video.category?.trim() ? video.category : "—"}
        </p>

        <div className="mt-4 mt-auto pt-2">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            {watchLabel}
          </a>
        </div>
      </div>
    </article>
  );
}
