"use client";

import { updatePhotoPost } from "@/app/actions/admin-dashboard";
import { DeletePhotoButton } from "@/components/admin/delete-photo-button";
import { coercePhotoUrls, urlsToTextarea } from "@/lib/photos/media-urls";
import type { TableRow } from "@/types/database";
import { useState, useTransition } from "react";

type PhotoPost = TableRow<"photos">;

export function PhotoEditorRow({ post }: { post: PhotoPost }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(post.title);
  const [caption, setCaption] = useState(post.caption ?? "");
  const [linkUrl, setLinkUrl] = useState(post.link_url ?? "");
  const [mediaUrls, setMediaUrls] = useState(urlsToTextarea(coercePhotoUrls(post.media_urls)));
  const [published, setPublished] = useState(post.published);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <tr className="text-zinc-300">
      <td className="py-3 pr-3 align-top">
        <input
          value={title}
          disabled={isPending}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full min-w-[10rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <textarea
          value={caption}
          rows={2}
          disabled={isPending}
          onChange={(event) => setCaption(event.target.value)}
          className="w-full min-w-[12rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={linkUrl}
          disabled={isPending}
          onChange={(event) => setLinkUrl(event.target.value)}
          className="w-full min-w-[12rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <textarea
          value={mediaUrls}
          rows={3}
          disabled={isPending}
          onChange={(event) => setMediaUrls(event.target.value)}
          className="w-full min-w-[18rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={published}
            disabled={isPending}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 rounded border-accent-dim/50 bg-night-card text-accent focus:ring-accent"
          />
          {published ? "Published" : "Draft"}
        </label>
      </td>
      <td className="py-3 align-top">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const payload = new FormData();
              payload.set("id", post.id);
              payload.set("title", title);
              payload.set("caption", caption);
              payload.set("link_url", linkUrl);
              payload.set("media_urls", mediaUrls);
              if (published) {
                payload.set("published", "true");
              }

              setMessage(null);
              setIsError(false);

              startTransition(async () => {
                const result = await updatePhotoPost(payload);
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
          <DeletePhotoButton photoId={post.id} label={post.title} />
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
