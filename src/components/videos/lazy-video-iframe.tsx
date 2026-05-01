"use client";

import { useState } from "react";

/** Delegates optional APIs to the embed; reduces console noise from cross-origin player scripts. */
export const YOUTUBE_EMBED_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure";

export const MUX_EMBED_ALLOW =
  "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; compute-pressure";

type LazyVideoIframeProps = {
  embedSrc: string;
  title: string;
  /** Prefer DB thumbnail; otherwise pass YouTube poster URL from `getYouTubePosterUrl`. */
  posterUrl?: string | null;
  allow: string;
};

/**
 * Mounts the embed only after the user clicks play. Avoids dozens of YouTube players / WebGL
 * contexts on gallery pages and reduces Permissions-Policy noise from embedded scripts.
 */
export function LazyVideoIframe({ embedSrc, title, posterUrl, allow }: LazyVideoIframeProps) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={embedSrc}
        title={title}
        className="h-full w-full border-0 bg-black"
        allow={allow}
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden bg-black text-left"
      aria-label={`Play embedded video: ${title}`}
    >
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamic poster from YouTube or CMS
        <img src={posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-night-elevated to-black"
          aria-hidden
        />
      )}
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition group-hover:scale-105 group-hover:border-accent/40 group-hover:bg-black/70">
        <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
