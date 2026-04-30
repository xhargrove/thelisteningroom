"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSupabase } from "@/lib/admin/require-admin";
import { hasMuxCredentials, muxGet, muxPost } from "@/lib/mux/mux-api";
import type { TableInsert } from "@/types/database";

/** Step 1: create a Mux direct upload URL (admin + Mux env). */
export async function startMuxDirectUpload(): Promise<
  | { ok: true; uploadUrl: string; uploadId: string }
  | { ok: false; message: string }
> {
  try {
    await requireAdminSupabase();
    if (!hasMuxCredentials()) {
      return { ok: false, message: "Mux is not configured on the server." };
    }

    const json = await muxPost<{ data: { id: string; url: string } }>("/uploads", {
      cors_origin: "*",
      new_asset_settings: {
        playback_policies: ["public"],
      },
    });

    return {
      ok: true,
      uploadUrl: json.data.url,
      uploadId: json.data.id,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not start Mux upload.",
    };
  }
}

/** Poll after PUT to upload URL until `asset_id` appears. */
export async function readMuxUpload(uploadId: string): Promise<
  | { ok: true; status: string; assetId: string | null }
  | { ok: false; message: string }
> {
  try {
    await requireAdminSupabase();
    if (!hasMuxCredentials()) {
      return { ok: false, message: "Mux is not configured." };
    }

    const json = await muxGet<{ data: { status: string; asset_id?: string } }>(
      `/uploads/${encodeURIComponent(uploadId)}`,
    );

    return {
      ok: true,
      status: json.data.status,
      assetId: json.data.asset_id ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not read upload status.",
    };
  }
}

/** Poll until asset is ready and has a public playback id. */
export async function readMuxAsset(assetId: string): Promise<
  | { ok: true; assetStatus: string; playbackId: string | null }
  | { ok: false; message: string }
> {
  try {
    await requireAdminSupabase();
    if (!hasMuxCredentials()) {
      return { ok: false, message: "Mux is not configured." };
    }

    const json = await muxGet<{
      data: {
        status: string;
        playback_ids?: Array<{ id: string; policy: string }>;
      };
    }>(`/assets/${encodeURIComponent(assetId)}`);

    const ids = json.data.playback_ids ?? [];
    const pub =
      ids.find((p) => p.policy?.toLowerCase() === "public") ?? ids[0];

    return {
      ok: true,
      assetStatus: json.data.status,
      playbackId: pub?.id ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not read asset.",
    };
  }
}

/** Save a `videos` row pointing at the Mux player (adaptive streaming). */
export async function saveMuxVideoEntry(payload: {
  playbackId: string;
  title: string;
  category: string | null;
  published: boolean;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const supabase = await requireAdminSupabase();

    const playbackId = payload.playbackId.trim();
    const title = payload.title.trim();

    if (!playbackId) {
      return { ok: false, message: "Missing playback id." };
    }
    if (!title) {
      return { ok: false, message: "Title is required." };
    }

    const category = payload.category?.trim() ? payload.category.trim() : null;

    const video_url = `https://player.mux.com/${playbackId}`;

    const row: TableInsert<"videos"> = {
      title,
      video_url,
      thumbnail_url: null,
      category,
      published: payload.published,
    };

    const { error } = await supabase.from("videos").insert(row);
    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/videos");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save video.",
    };
  }
}
