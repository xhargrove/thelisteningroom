"use client";

import { useState } from "react";

export function PhotoCarousel({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index] ?? images[0];

  if (!current) {
    return null;
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
