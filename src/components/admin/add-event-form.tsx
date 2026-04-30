"use client";

import { createEvent, requestEventFlyerUploadSlot } from "@/app/actions/admin-dashboard";
import { uploadEventFlyerToSignedUrl } from "@/lib/events/flyer-upload";
import { useState, useTransition } from "react";

export function AddEventForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <form
      className="panel-subtle p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const payload = new FormData(form);
        setMessage(null);
        setIsError(false);

        startTransition(async () => {
          const flyerFileInput = form.elements.namedItem("flyer_file") as HTMLInputElement | null;
          const flyerFile = flyerFileInput?.files?.[0];
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

          // Flyer bytes were uploaded to Storage; omit file from the action payload (1 MB default limit).
          payload.delete("flyer_file");

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
            className="ui-input px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Date & time</span>
          <input
            type="datetime-local"
            name="event_date"
            required
            disabled={isPending}
            className="ui-input px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Location</span>
          <input
            name="location"
            required
            disabled={isPending}
            className="ui-input px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Description</span>
          <textarea
            name="description"
            rows={3}
            disabled={isPending}
            className="ui-input px-3 py-2 text-sm"
          />
        </label>


        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Flyer image URL (9:16)</span>
          <input
            type="url"
            name="flyer_image_url"
            disabled={isPending}
            placeholder="https://..."
            className="ui-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Or upload flyer file (JPG/PNG/WebP)</span>
          <input
            type="file"
            name="flyer_file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isPending}
            className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-300 disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">RSVP link</span>
          <input
            type="url"
            name="rsvp_link"
            disabled={isPending}
            placeholder="https://..."
            className="ui-input px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="ui-btn-primary"
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
