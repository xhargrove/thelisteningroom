"use client";

import { useState } from "react";

type Layout = "default" | "tile";

export function PhotoCarousel({
  images,
  title,
  layout = "default",
}: {
  images: string[];
  title: string;
  layout?: Layout;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index] ?? images[0];

  if (!current) {
    return null;
  }

  if (layout === "tile") {
    if (count === 1) {
      return (
        <div className="relative h-full w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={title} className="h-full w-full object-cover" loading="lazy" />
        </div>
      );
    }

    return (
      <div className="relative h-full w-full bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`${title} (${index + 1}/${count})`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/65 px-2 py-1 text-xs text-zinc-200">
          {index + 1} / {count}
        </div>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + count) % count)}
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Previous photo"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % count)}
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Next photo"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    );
  }

  if (count === 1) {
    return (
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={title} className="h-72 w-full object-cover sm:h-80" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={`${title} (${index + 1}/${count})`} className="h-72 w-full object-cover sm:h-80" loading="lazy" />
        <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-zinc-200">
          {index + 1} / {count}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-2 py-2">
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + count) % count)}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-white/40 hover:text-white"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % count)}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-white/40 hover:text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
