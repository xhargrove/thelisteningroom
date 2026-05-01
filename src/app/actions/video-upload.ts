"use server";

import { revalidatePath } from "next/cache";
import {
  assertAdminAccess,
  requireAdminServiceRoleClient,
} from "@/lib/admin/require-admin";
import { getVideoUploadBucketId } from "@/lib/storage/video-upload-bucket";
import { friendlySupabaseError } from "@/lib/supabase/friendly-error";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import type { TableInsert } from "@/types/database";
import { VIDEO_UPLOAD_MAX_BYTES, videoUploadMaxLabel } from "@/lib/videos/upload-limits";

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

/** Browsers sometimes send empty or generic MIME; accept common video extensions. */
function isClientVideoCandidate(mime: string, filename: string): boolean {
  if (mime.startsWith("video/")) return true;
  if (mime === "" || mime === "application/octet-stream") {
    return /\.(mp4|webm|mov|m4v|qt|avi|mkv|mpeg|mpg)$/i.test(filename);
  }
  return false;
}

/** Step 1 (admin): get a signed upload target — client uploads the file directly to Storage. */
export async function requestVideoUploadSlot(formData: FormData) {
  try {
    await assertAdminAccess();

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
    if (!isClientVideoCandidate(mime, filename)) {
      return { ok: false as const, message: "Please choose a video file (MP4, WebM, MOV, etc.)." };
    }

    const path = `uploads/${crypto.randomUUID()}/${sanitizeFileName(filename)}`;

    const bucket = getVideoUploadBucketId();
    const service = createSupabaseServiceRoleClient();
    const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path);

    if (error || !data) {
      return {
        ok: false as const,
        message: friendlySupabaseError(
          error?.message,
          "Could not start upload. Create the Storage bucket (see supabase/migrations) and set SUPABASE_SERVICE_ROLE_KEY.",
        ),
      };
    }

    return {
      ok: true as const,
      bucket,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    };
  } catch (e) {
    return {
      ok: false as const,
      message:
        e instanceof Error ? friendlySupabaseError(e.message, "Unauthorized.") : "Unauthorized.",
    };
  }
}

/** Step 2 (admin): save a `videos` row pointing at the uploaded public URL. */
export async function registerUploadedVideo(formData: FormData) {
  try {
    const supabase = await requireAdminServiceRoleClient();

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

    const bucket = getVideoUploadBucketId();
    const service = createSupabaseServiceRoleClient();
    const {
      data: { publicUrl },
    } = service.storage.from(bucket).getPublicUrl(storagePath);

    const row: TableInsert<"videos"> = {
      title,
      video_url: publicUrl,
      thumbnail_url: null,
      category,
      published,
    };

    const { error } = await supabase.from("videos").insert(row);
    if (error) {
      return {
        ok: false as const,
        message: friendlySupabaseError(error.message, "Could not save video."),
      };
    }

    revalidatePath("/admin");
    revalidatePath("/videos");
    revalidatePath("/");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      message:
        e instanceof Error
          ? friendlySupabaseError(e.message, "Could not save video.")
          : "Could not save video.",
    };
  }
}
