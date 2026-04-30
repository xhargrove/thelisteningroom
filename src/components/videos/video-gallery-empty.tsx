export function VideoGalleryEmpty() {
  return (
    <div className="py-12 text-center sm:py-16">
      <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 px-8 py-10">
        <svg
          className="h-12 w-12 text-zinc-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-white">No videos yet</p>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Check back after the next Listening Room — new sets will land here.
          </p>
        </div>
      </div>
    </div>
  );
}
