"use client";

import { createEvent } from "@/app/actions/admin-dashboard";
import { useState, useTransition } from "react";

export function AddEventForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <form
      className="rounded-lg border border-accent-dim/25 bg-night-card/70 p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const payload = new FormData(form);
        setMessage(null);
        setIsError(false);

        startTransition(async () => {
          const result = await createEvent(payload);
          if (result.ok) {
            setMessage("Event added.");
            setIsError(false);
            form.reset();
            return;
          }
          setMessage(result.message ?? "Could not add event.");
          setIsError(true);
        });
      }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Add event</h3>
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
          <span className="text-xs text-zinc-400">Date & time</span>
          <input
            type="datetime-local"
            name="event_date"
            required
            disabled={isPending}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Location</span>
          <input
            name="location"
            required
            disabled={isPending}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Description</span>
          <textarea
            name="description"
            rows={3}
            disabled={isPending}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">RSVP link</span>
          <input
            type="url"
            name="rsvp_link"
            disabled={isPending}
            placeholder="https://..."
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add event"}
        </button>
        {message ? (
          <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
