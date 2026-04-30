export function PhotosEmpty() {
  return (
    <div className="py-12 text-center sm:py-16">
      <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 px-8 py-10">
        <svg
          className="h-12 w-12 text-accent-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-white">No photo posts yet</p>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Check back soon for new images and carousel drops from The Listening Room.
          </p>
        </div>
      </div>
    </div>
  );
}
