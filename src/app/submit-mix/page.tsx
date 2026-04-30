import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit mix",
};

export default function SubmitMixPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Submit a mix</h1>
      <p className="mt-3 text-zinc-400">
        Static preview — upload and processing will connect once Supabase is wired.
      </p>

      <form className="mt-10 space-y-6" aria-label="Mix submission (preview)">
        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-zinc-300">
            Artist / DJ name
          </label>
          <input
            id="artist"
            name="artist"
            type="text"
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
            Mix title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Session title"
          />
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-zinc-300">
            Link (optional)
          </label>
          <input
            id="link"
            name="link"
            type="url"
            inputMode="url"
            className="mt-2 w-full rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="https://"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-300">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-accent-dim/30 bg-night-card px-4 py-3 text-white placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Genre, BPM, anything we should know"
          />
        </div>
        <p className="text-sm text-zinc-500">
          This form does not submit yet — no backend hooks until you are ready.
        </p>
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-accent/40 px-6 py-3 text-sm font-semibold text-black/60 sm:w-auto sm:min-w-[180px]"
        >
          Submit (coming soon)
        </button>
      </form>
    </div>
  );
}
