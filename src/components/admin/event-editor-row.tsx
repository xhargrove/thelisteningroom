"use client";

import { updateEvent } from "@/app/actions/admin-dashboard";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import type { TableRow } from "@/types/database";
import { useState, useTransition } from "react";

type EventRow = TableRow<"events">;

function toDateTimeLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

export function EventEditorRow({ event }: { event: EventRow }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(event.title);
  const [eventDate, setEventDate] = useState(toDateTimeLocalInput(event.event_date));
  const [location, setLocation] = useState(event.location);
  const [description, setDescription] = useState(event.description ?? "");
  const [rsvpLink, setRsvpLink] = useState(event.rsvp_link ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <tr className="text-zinc-300">
      <td className="py-3 pr-3 align-top">
        <input
          value={eventDate}
          type="datetime-local"
          disabled={isPending}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full min-w-[11rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={title}
          disabled={isPending}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full min-w-[10rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={location}
          disabled={isPending}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full min-w-[10rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <textarea
          rows={2}
          value={description}
          disabled={isPending}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-w-[13rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={rsvpLink}
          disabled={isPending}
          onChange={(e) => setRsvpLink(e.target.value)}
          className="w-full min-w-[13rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 align-top">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const payload = new FormData();
              payload.set("id", event.id);
              payload.set("title", title);
              payload.set("event_date", eventDate);
              payload.set("location", location);
              payload.set("description", description);
              payload.set("rsvp_link", rsvpLink);

              setMessage(null);
              setIsError(false);

              startTransition(async () => {
                const result = await updateEvent(payload);
                if (result.ok) {
                  setMessage("Saved");
                  setIsError(false);
                  return;
                }
                setMessage(result.message ?? "Save failed");
                setIsError(true);
              });
            }}
            className="whitespace-nowrap rounded-md border border-accent-dim/40 px-3 py-1.5 text-sm font-medium text-zinc-200 hover:border-accent/50 hover:text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <DeleteEventButton eventId={event.id} label={event.title} />
        </div>
        {message ? (
          <p className={`mt-1 text-right text-xs ${isError ? "text-red-300" : "text-emerald-300"}`}>
            {message}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
