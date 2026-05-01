"use client";

import {
  reorderUpcomingEvent,
  requestEventFlyerUploadSlot,
  updateEvent,
} from "@/app/actions/admin-dashboard";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { uploadEventFlyerToSignedUrl } from "@/lib/events/flyer-upload";
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

export function EventEditorRow({
  event,
  orderIndex,
  orderTotal,
}: {
  event: EventRow;
  orderIndex: number;
  orderTotal: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(event.title);
  const [eventDate, setEventDate] = useState(toDateTimeLocalInput(event.event_date));
  const [location, setLocation] = useState(event.location);
  const [description, setDescription] = useState(event.description ?? "");
  const [rsvpLink, setRsvpLink] = useState(event.rsvp_link ?? "");
  const [flyerImageUrl, setFlyerImageUrl] = useState(event.flyer_image_url ?? "");
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const canMoveUp = orderIndex > 0;
  const canMoveDown = orderIndex < orderTotal - 1;

  return (
    <tr className="text-zinc-300">
      <td className="py-3 pr-2 align-top">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            <button
              type="button"
              disabled={isPending || !canMoveUp}
              onClick={() => {
                setReorderError(null);
                startTransition(async () => {
                  const r = await reorderUpcomingEvent(event.id, "up");
                  if (!r.ok) {
                    setReorderError(r.message);
                  }
                });
              }}
              className="ui-btn-ghost rounded-md px-2 py-1 text-sm leading-none disabled:opacity-40"
              aria-label="Show this event earlier on the public events page"
              title="Earlier on /events"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={isPending || !canMoveDown}
              onClick={() => {
                setReorderError(null);
                startTransition(async () => {
                  const r = await reorderUpcomingEvent(event.id, "down");
                  if (!r.ok) {
                    setReorderError(r.message);
                  }
                });
              }}
              className="ui-btn-ghost rounded-md px-2 py-1 text-sm leading-none disabled:opacity-40"
              aria-label="Show this event later on the public events page"
              title="Later on /events"
            >
              ↓
            </button>
          </div>
          {orderIndex === 0 ? (
            <span className="text-[10px] font-medium uppercase leading-tight tracking-wide text-accent">
              Featured slot
            </span>
          ) : null}
          {reorderError ? <span className="text-[10px] text-red-300">{reorderError}</span> : null}
        </div>
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={eventDate}
          type="datetime-local"
          disabled={isPending}
          onChange={(e) => setEventDate(e.target.value)}
          className="ui-input w-full min-w-[11rem] px-2 py-1.5 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={title}
          disabled={isPending}
          onChange={(e) => setTitle(e.target.value)}
          className="ui-input w-full min-w-[10rem] px-2 py-1.5 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={location}
          disabled={isPending}
          onChange={(e) => setLocation(e.target.value)}
          className="ui-input w-full min-w-[10rem] px-2 py-1.5 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <textarea
          rows={2}
          value={description}
          disabled={isPending}
          onChange={(e) => setDescription(e.target.value)}
          className="ui-input w-full min-w-[13rem] px-2 py-1.5 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={rsvpLink}
          disabled={isPending}
          onChange={(e) => setRsvpLink(e.target.value)}
          className="ui-input w-full min-w-[13rem] px-2 py-1.5 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={flyerImageUrl}
          disabled={isPending}
          onChange={(e) => setFlyerImageUrl(e.target.value)}
          placeholder="https://..."
          className="ui-input w-full min-w-[13rem] px-2 py-1.5 text-sm"
        />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isPending}
          onChange={(e) => setFlyerFile(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full min-w-[13rem] text-xs text-zinc-300 file:mr-2 file:rounded-md file:border-0 file:bg-accent file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-black hover:file:bg-yellow-300 disabled:opacity-50"
        />
      </td>
      <td className="py-3 align-top">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setMessage(null);
              setIsError(false);

              startTransition(async () => {
                const payload = new FormData();
                payload.set("id", event.id);
                payload.set("title", title);
                payload.set("event_date", eventDate);
                payload.set("location", location);
                payload.set("description", description);
                payload.set("rsvp_link", rsvpLink);
                payload.set("flyer_image_url", flyerImageUrl);

                if (flyerFile) {
                  const uploadFd = new FormData();
                  uploadFd.set("filename", flyerFile.name);
                  uploadFd.set("size", String(flyerFile.size));
                  uploadFd.set("mime", flyerFile.type || "application/octet-stream");

                  const slot = await requestEventFlyerUploadSlot(uploadFd);
                  if (!slot.ok) {
                    setMessage(slot.message ?? "Could not upload flyer.");
                    setIsError(true);
                    return;
                  }

                  try {
                    await uploadEventFlyerToSignedUrl({
                      bucket: slot.bucket,
                      path: slot.path,
                      token: slot.token,
                      file: flyerFile,
                      contentType: flyerFile.type || "application/octet-stream",
                    });
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Could not upload flyer.");
                    setIsError(true);
                    return;
                  }

                  payload.set("flyer_image_url", slot.publicUrl);
                }

                const result = await updateEvent(payload);
                if (result.ok) {
                  setFlyerFile(null);
                  setMessage("Saved");
                  setIsError(false);
                  return;
                }
                setMessage(result.message ?? "Save failed");
                setIsError(true);
              });
            }}
            className="ui-btn-ghost whitespace-nowrap px-3 py-1.5 disabled:opacity-50"
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
