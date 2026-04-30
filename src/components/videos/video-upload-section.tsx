"use client";

import { useState } from "react";
import { requestVideoUploadSlot, registerUploadedVideo } from "@/app/actions/video-upload";
import { getSupabaseProjectRef } from "@/lib/supabase/env";
import { VIDEO_UPLOAD_MAX_BYTES, videoUploadMaxLabel } from "@/lib/videos/upload-limits";
import { uploadVideoTusSigned } from "@/lib/videos/tus-upload-signed";

const ACCEPT = "video/mp4,video/webm,video/quicktime,video/*";

export function VideoUploadSection() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [phase, setPhase] = useState<"idle" | "preparing" | "uploading" | "saving">("idle");
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[name="file"]');
    const file = fileInput?.files?.[0];
    if (!file) {
      setIsError(true);
      setMessage("Choose a video file.");
      return;
    }

    if (file.size > VIDEO_UPLOAD_MAX_BYTES) {
      setIsError(true);
      setMessage(`This file is over the ${videoUploadMaxLabel()} limit. Export at a lower bitrate or split the set.`);
      return;
    }

    const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');
    const title = titleInput?.value?.trim() ?? "";
    if (!title) {
      setIsError(true);
      setMessage("Title is required.");
      return;
    }

    try {
      setPhase("preparing");
      const prepFd = new FormData();
      prepFd.set("filename", file.name);
      prepFd.set("size", String(file.size));
      prepFd.set("mime", file.type || "video/mp4");

      const prep = await requestVideoUploadSlot(prepFd);
      if (!prep.ok) {
        setPhase("idle");
        setIsError(true);
        setMessage(prep.message);
        return;
      }

      setPhase("uploading");
      setUploadPct(0);

      let projectRef: string;
      try {
        projectRef = getSupabaseProjectRef();
      } catch (refErr) {
        setPhase("idle");
        setUploadPct(null);
        setIsError(true);
        setMessage(refErr instanceof Error ? refErr.message : "Missing Supabase URL.");
        return;
      }

      try {
        await uploadVideoTusSigned({
          projectRef,
          bucket: "video-uploads",
          path: prep.path,
          token: prep.token,
          file,
          contentType: file.type || "application/octet-stream",
          onProgress: (pct) => setUploadPct(pct),
        });
      } catch (uploadErr) {
        setPhase("idle");
        setUploadPct(null);
        setIsError(true);
        setMessage(uploadErr instanceof Error ? uploadErr.message : "Upload failed.");
        return;
      }

      setUploadPct(null);

      setPhase("saving");
      const regFd = new FormData();
      regFd.set("storage_path", prep.path);
      regFd.set("title", title);
      const categoryInput = form.querySelector<HTMLInputElement>('input[name="category"]');
      regFd.set("category", categoryInput?.value?.trim() ?? "");
      const publishedInput = form.querySelector<HTMLInputElement>('input[name="published"]');
      regFd.set("published", publishedInput?.checked ? "true" : "false");

      const done = await registerUploadedVideo(regFd);
      setPhase("idle");
      if (!done.ok) {
        setIsError(true);
        setMessage(done.message ?? "Could not save the video.");
        return;
      }

      setIsError(false);
      setMessage("Video uploaded and saved.");
      form.reset();
    } catch (err) {
      setPhase("idle");
      setUploadPct(null);
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const busy = phase !== "idle";

  return (
    <section
      className="mb-12 rounded-xl border border-accent-dim/30 bg-night-card/80 p-5 sm:p-6"
      aria-labelledby="video-upload-heading"
    >
      <h2 id="video-upload-heading" className="text-lg font-semibold text-white">
        Upload a video
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Files upload directly to Supabase Storage (not through Vercel). Max {videoUploadMaxLabel()} per file
        — MP4 or WebM recommended. Very long sets need a paid Supabase plan with a high enough platform upload
        cap; playback uses egress, so link-based hosts (YouTube, etc.) stay cheaper at scale.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Video file</span>
            <input
              name="file"
              type="file"
              accept={ACCEPT}
              required
              disabled={busy}
              className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-300 disabled:opacity-50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Title</span>
            <input
              name="title"
              type="text"
              required
              disabled={busy}
              placeholder="Session title"
              className="rounded-lg border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-zinc-400">Category (optional)</span>
            <input
              name="category"
              type="text"
              disabled={busy}
              className="rounded-lg border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="published"
            type="checkbox"
            defaultChecked
            disabled={busy}
            className="h-4 w-4 rounded border-accent-dim/50 bg-night-elevated text-accent focus:ring-accent"
          />
          Published on /videos immediately
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "preparing"
              ? "Preparing…"
              : phase === "uploading"
                ? uploadPct != null
                  ? `Uploading… ${uploadPct.toFixed(0)}%`
                  : "Uploading…"
                : phase === "saving"
                  ? "Saving…"
                  : "Upload video"}
          </button>
          {phase === "uploading" && uploadPct != null ? (
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-night-elevated" aria-hidden>
              <div
                className="h-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, uploadPct))}%` }}
              />
            </div>
          ) : null}
          {message ? (
            <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
