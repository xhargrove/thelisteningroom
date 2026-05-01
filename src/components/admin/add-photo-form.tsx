"use client";

import { createPhotoPost } from "@/app/actions/admin-dashboard";
import { requestPhotoUploadSlot } from "@/app/actions/admin-dashboard";
import { DIRECT_IMAGE_URL_REQUIREMENT } from "@/lib/photos/media-urls";
import { uploadPhotoToSignedUrl } from "@/lib/photos/photo-upload";
import { useState, useTransition } from "react";

export function AddPhotoForm() {
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
          const existingRaw = payload.get("media_urls");
          const mergedUrls =
            typeof existingRaw === "string"
              ? existingRaw
                  .split(/\r?\n|,/g)
                  .map((url) => url.trim())
                  .filter(Boolean)
              : [];
          const photoInput = form.elements.namedItem("photo_files") as HTMLInputElement | null;
          const photoFiles = photoInput?.files ? Array.from(photoInput.files) : [];
          for (const photoFile of photoFiles) {
            const uploadFd = new FormData();
            uploadFd.set("filename", photoFile.name);
            uploadFd.set("size", String(photoFile.size));
            uploadFd.set("mime", photoFile.type || "application/octet-stream");

            const slot = await requestPhotoUploadSlot(uploadFd);
            if (!slot.ok) {
              setMessage(slot.message ?? "Could not upload photo.");
              setIsError(true);
              return;
            }

            try {
              await uploadPhotoToSignedUrl({
                bucket: slot.bucket,
                path: slot.path,
                token: slot.token,
                file: photoFile,
                contentType: photoFile.type || "application/octet-stream",
              });
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Could not upload photo.");
              setIsError(true);
              return;
            }

            mergedUrls.push(slot.publicUrl);
          }
          if (mergedUrls.length > 0) {
            payload.set("media_urls", mergedUrls.join("\n"));
          }
          payload.delete("photo_files");

          const result = await createPhotoPost(payload);
          if (result.ok) {
            setMessage("Photo post added.");
            setIsError(false);
            form.reset();
            return;
          }
          setMessage(result.message ?? "Could not add photo post.");
          setIsError(true);
        });
      }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Add photo post</h3>
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
          <span className="text-xs text-zinc-400">Post link (optional)</span>
          <input
            type="url"
            name="link_url"
            disabled={isPending}
            placeholder="https://..."
            className="ui-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Caption (optional)</span>
          <textarea
            name="caption"
            rows={2}
            disabled={isPending}
            className="ui-input px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Photo URLs (one per line or comma-separated)</span>
          <textarea
            name="media_urls"
            required
            rows={4}
            disabled={isPending}
            placeholder={"https://cdn.example.com/photo.jpg\nhttps://..."}
            className="ui-input font-mono px-3 py-2 text-sm"
          />
          <span className="text-xs leading-snug text-zinc-500">{DIRECT_IMAGE_URL_REQUIREMENT}</span>
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Or upload photos (JPG/PNG/WebP/GIF/AVIF)</span>
          <input
            type="file"
            name="photo_files"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            disabled={isPending}
            className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-300 disabled:opacity-50"
          />
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="published"
          defaultChecked
          disabled={isPending}
          className="h-4 w-4 rounded border-white/20 bg-white/[0.04] text-zinc-200 focus:ring-zinc-400"
        />
        Published
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="ui-btn-primary"
        >
          {isPending ? "Saving..." : "Add post"}
        </button>
        {message ? (
          <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
