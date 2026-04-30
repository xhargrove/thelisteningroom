"use client";

import { createVideo } from "@/app/actions/admin-dashboard";
import { useState, useTransition } from "react";

export function AddVideoForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <form
      className="rounded-lg border border-accent-dim/25 bg-night-card/70 p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setMessage(null);
        setIsError(false);

        startTransition(async () => {
          const result = await createVideo(formData);
          if (result.ok) {
            setMessage("Video added.");
            setIsError(false);
            form.reset();
            return;
          }
          setMessage(result.message ?? "Could not add video.");
          setIsError(true);
        });
      }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Add video</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Title</span>
          <input
            name="title"
            required
            disabled={isPending}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Category</span>
          <input
            name="category"
            disabled={isPending}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Video URL</span>
          <input
            type="url"
            name="video_url"
            required
            disabled={isPending}
            placeholder="https://..."
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Thumbnail URL</span>
          <input
            type="url"
            name="thumbnail_url"
            disabled={isPending}
            placeholder="https://..."
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="published"
          disabled={isPending}
          className="h-4 w-4 rounded border-accent-dim/50 bg-night-elevated text-accent focus:ring-accent"
        />
        Published
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add video"}
        </button>
        {message ? (
          <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
