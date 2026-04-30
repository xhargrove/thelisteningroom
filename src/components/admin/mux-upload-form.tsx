"use client";

import { useState } from "react";
import {
  readMuxAsset,
  readMuxUpload,
  saveMuxVideoEntry,
  startMuxDirectUpload,
} from "@/app/actions/mux-video";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function MuxUploadForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "creating" | "uploading" | "processing" | "saving"
  >("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[name="mux_file"]');
    const file = fileInput?.files?.[0];
    const titleInput = form.querySelector<HTMLInputElement>('input[name="mux_title"]');
    const title = titleInput?.value?.trim() ?? "";
    const categoryInput = form.querySelector<HTMLInputElement>('input[name="mux_category"]');
    const category = categoryInput?.value?.trim() ?? "";
    const publishedInput = form.querySelector<HTMLInputElement>('input[name="mux_published"]');

    if (!file) {
      setIsError(true);
      setMessage("Choose a video file.");
      return;
    }
    if (!title) {
      setIsError(true);
      setMessage("Title is required.");
      return;
    }

    try {
      setPhase("creating");
      const start = await startMuxDirectUpload();
      if (!start.ok) {
        setPhase("idle");
        setIsError(true);
        setMessage(start.message);
        return;
      }

      setPhase("uploading");
      const putRes = await fetch(start.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!putRes.ok) {
        setPhase("idle");
        setIsError(true);
        setMessage(`Upload to Mux failed (${putRes.status}).`);
        return;
      }

      setPhase("processing");

      let assetId: string | null = null;
      for (let i = 0; i < 180; i++) {
        const u = await readMuxUpload(start.uploadId);
        if (!u.ok) {
          setPhase("idle");
          setIsError(true);
          setMessage(u.message);
          return;
        }
        if (u.assetId) {
          assetId = u.assetId;
          break;
        }
        await sleep(2000);
      }

      if (!assetId) {
        setPhase("idle");
        setIsError(true);
        setMessage("Timed out waiting for Mux to create an asset.");
        return;
      }

      let playbackId: string | null = null;
      for (let i = 0; i < 180; i++) {
        const a = await readMuxAsset(assetId);
        if (!a.ok) {
          setPhase("idle");
          setIsError(true);
          setMessage(a.message);
          return;
        }
        if (a.playbackId) {
          playbackId = a.playbackId;
          break;
        }
        if (a.assetStatus === "errored") {
          setPhase("idle");
          setIsError(true);
          setMessage("Mux reported an error processing this file.");
          return;
        }
        await sleep(2000);
      }

      if (!playbackId) {
        setPhase("idle");
        setIsError(true);
        setMessage("Timed out waiting for playback ID from Mux.");
        return;
      }

      setPhase("saving");
      const saved = await saveMuxVideoEntry({
        playbackId,
        title,
        category: category || null,
        published: Boolean(publishedInput?.checked),
      });

      setPhase("idle");
      if (!saved.ok) {
        setIsError(true);
        setMessage(saved.message);
        return;
      }

      setIsError(false);
      setMessage("Saved — video uses Mux adaptive streaming.");
      form.reset();
    } catch (err) {
      setPhase("idle");
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Mux upload failed.");
    }
  }

  const busy = phase !== "idle";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5"
      aria-label="Mux direct upload"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-200">
        Mux upload (adaptive streaming)
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Requires{" "}
        <code className="rounded bg-night-card px-1 text-zinc-400">MUX_TOKEN_ID</code> and{" "}
        <code className="rounded bg-night-card px-1 text-zinc-400">MUX_TOKEN_SECRET</code> on the server.
        Large files may take minutes to process before playback is ready.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-zinc-400">Video file</span>
          <input
            name="mux_file"
            type="file"
            accept="video/*"
            required
            disabled={busy}
            className="text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-500 disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Title</span>
          <input
            name="mux_title"
            type="text"
            required
            disabled={busy}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">Category</span>
          <input
            name="mux_category"
            type="text"
            disabled={busy}
            className="rounded-md border border-accent-dim/30 bg-night-elevated px-3 py-2 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        </label>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="mux_published"
          type="checkbox"
          defaultChecked
          disabled={busy}
          className="h-4 w-4 rounded border-accent-dim/50 bg-night-elevated text-accent focus:ring-accent"
        />
        Published
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
        >
          {phase === "creating"
            ? "Creating upload…"
            : phase === "uploading"
              ? "Sending file…"
              : phase === "processing"
                ? "Mux processing…"
                : phase === "saving"
                  ? "Saving…"
                  : "Upload via Mux"}
        </button>
        {message ? (
          <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
