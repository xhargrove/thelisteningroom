/** Static marketing column for /submit-mix — aligned with Figma Make layout. */
export function SubmitMixSidebar() {
  return (
    <div className="space-y-8 lg:sticky lg:top-28">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-gradient-to-r from-accent/10 to-accent-secondary/10 px-4 py-2">
          <svg
            className="h-4 w-4 shrink-0 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span className="text-sm font-medium text-zinc-200">Submit your work</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Share your mix
        </h1>

        <p className="mb-8 text-lg text-zinc-400">
          Join Atlanta&apos;s premier DJ showcase and share your set with the room. Curated by Big X —
          submissions go to the team for review.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20">
            <svg
              className="h-6 w-6 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-white">Get featured</h2>
            <p className="text-sm text-zinc-500">
              Approved mixes can appear on the homepage for the community to discover.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20">
            <svg
              className="h-6 w-6 text-accent-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-white">Easy process</h2>
            <p className="text-sm text-zinc-500">
              Drop a link to your mix (SoundCloud, Mixcloud, YouTube, etc.) plus a few details — we handle
              the rest.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20">
            <svg
              className="h-6 w-6 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h2 className="mb-1 text-lg font-semibold text-white">Team review</h2>
            <p className="text-sm text-zinc-500">
              We read every submission and follow up when your mix is approved for the site.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/90 to-night-elevated/50 p-6">
        <h2 className="mb-3 font-semibold text-white">Submission guidelines</h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-accent">•</span>
            <span>Use a public link (https://) to SoundCloud, Mixcloud, YouTube, or similar.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-accent">•</span>
            <span>Original content or properly licensed material only.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-accent">•</span>
            <span>Add optional notes (genre, BPM, track list) to help us review faster.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-accent">•</span>
            <span>Include a valid email so we can reach you.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
