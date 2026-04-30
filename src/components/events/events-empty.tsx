export function EventsEmpty() {
  return (
    <div className="py-12 text-center sm:py-16">
      <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 px-8 py-10">
        <svg
          className="h-12 w-12 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-white">No upcoming events</p>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Check back soon for new Listening Room dates and special nights.
          </p>
        </div>
      </div>
    </div>
  );
}
