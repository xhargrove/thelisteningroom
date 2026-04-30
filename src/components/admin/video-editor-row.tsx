"use client";

import { updateVideo } from "@/app/actions/admin-dashboard";
import { DeleteVideoButton } from "@/components/admin/delete-video-button";
import type { TableRow } from "@/types/database";
import { useState, useTransition } from "react";

type Video = TableRow<"videos">;

export function VideoEditorRow({ video }: { video: Video }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(video.title);
  const [videoUrl, setVideoUrl] = useState(video.video_url);
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnail_url ?? "");
  const [category, setCategory] = useState(video.category ?? "");
  const [published, setPublished] = useState(video.published);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <tr className="text-zinc-300">
      <td className="py-3 pr-3 align-top">
        <input
          value={title}
          disabled={isPending}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full min-w-[11rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={videoUrl}
          disabled={isPending}
          onChange={(event) => setVideoUrl(event.target.value)}
          className="w-full min-w-[13rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-accent hover:underline"
        >
          Open
        </a>
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={thumbnailUrl}
          disabled={isPending}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          className="w-full min-w-[13rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={category}
          disabled={isPending}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full min-w-[8rem] rounded-md border border-accent-dim/30 bg-night-card px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
              payload.set("id", video.id);
              payload.set("title", title);
              payload.set("video_url", videoUrl);
              payload.set("thumbnail_url", thumbnailUrl);
              payload.set("category", category);
              if (published) {
                payload.set("published", "true");
              }

              setMessage(null);
              setIsError(false);

              startTransition(async () => {
                const result = await updateVideo(payload);
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
          <DeleteVideoButton videoId={video.id} label={video.title} />
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
