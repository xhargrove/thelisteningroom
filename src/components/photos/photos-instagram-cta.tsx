export function PhotosInstagramCta() {
  return (
    <div className="mt-16 text-center sm:mt-20">
      <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 px-8 py-8">
        <svg
          className="h-12 w-12 text-accent-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
        </svg>
        <div>
          <h2 className="mb-2 text-xl font-bold text-white">Want to see more?</h2>
          <p className="mb-4 max-w-md text-sm text-zinc-400">
            Follow on Instagram for daily updates and behind-the-scenes from the room.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:from-zinc-500 hover:to-zinc-700"
          >
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
