"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSupabase } from "@/lib/admin/require-admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import type { TableInsert } from "@/types/database";
import { VIDEO_UPLOAD_MAX_BYTES, videoUploadMaxLabel } from "@/lib/videos/upload-limits";

const BUCKET = "video-uploads";

function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "video";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
  return cleaned || "video.mp4";
}

function assertSafeStoragePath(path: string): boolean {
  if (!path.startsWith("uploads/")) return false;
  if (path.includes("..")) return false;
  return true;
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "on" || value === "1";
}

/** Step 1 (admin): get a signed upload target — client uploads the file directly to Storage. */
export async function requestVideoUploadSlot(formData: FormData) {
  try {
    await requireAdminSupabase();

    const nameRaw = formData.get("filename");
    const sizeRaw = formData.get("size");
    const mimeRaw = formData.get("mime");

    const filename = typeof nameRaw === "string" ? nameRaw : "";
    const size = typeof sizeRaw === "string" ? Number(sizeRaw) : NaN;
    const mime = typeof mimeRaw === "string" ? mimeRaw : "";

    if (!filename || !Number.isFinite(size) || size <= 0) {
      return { ok: false as const, message: "Invalid file." };
    }
    if (size > VIDEO_UPLOAD_MAX_BYTES) {
      return {
        ok: false as const,
        message: `File too large (max ${videoUploadMaxLabel()}).`,
      };
    }
    if (!mime.startsWith("video/")) {
      return { ok: false as const, message: "Please choose a video file." };
    }

    const path = `uploads/${crypto.randomUUID()}/${sanitizeFileName(filename)}`;

    const service = createSupabaseServiceRoleClient();
    const { data, error } = await service.storage.from(BUCKET).createSignedUploadUrl(path);

    if (error || !data) {
      return {
        ok: false as const,
        message:
          error?.message ??
          "Could not start upload. Create the Storage bucket (see supabase/migrations) and set SUPABASE_SERVICE_ROLE_KEY.",
      };
    }

    return {
      ok: true as const,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Unauthorized.",
    };
  }
}

/** Step 2 (admin): save a `videos` row pointing at the uploaded public URL. */
export async function registerUploadedVideo(formData: FormData) {
  try {
    const supabase = await requireAdminSupabase();

    const pathRaw = formData.get("storage_path");
    const titleRaw = formData.get("title");
    const categoryRaw = formData.get("category");
    const published = parseBoolean(formData.get("published"));

    const storagePath = typeof pathRaw === "string" ? pathRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const category =
      typeof categoryRaw === "string" && categoryRaw.trim() ? categoryRaw.trim() : null;

    if (!storagePath || !assertSafeStoragePath(storagePath)) {
      return { ok: false as const, message: "Invalid storage path." };
    }
    if (!title) {
      return { ok: false as const, message: "Title is required." };
    }

    const service = createSupabaseServiceRoleClient();
    const {
      data: { publicUrl },
    } = service.storage.from(BUCKET).getPublicUrl(storagePath);

    const row: TableInsert<"videos"> = {
      title,
      video_url: publicUrl,
      thumbnail_url: null,
      category,
      published,
    };

    const { error } = await supabase.from("videos").insert(row);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/videos");
    revalidatePath("/");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Could not save video.",
    };
  }
}
