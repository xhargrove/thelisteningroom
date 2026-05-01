"use server";

import { revalidatePath } from "next/cache";
import { isDjMixStatus } from "@/lib/dj-mixes/status";
import {
  assertAdminAccess,
  requireAdminServiceRoleClient,
} from "@/lib/admin/require-admin";
import { getEventFlyerBucketId } from "@/lib/storage/event-flyer-bucket";
import { getPhotoPostBucketId } from "@/lib/storage/photo-post-bucket";
import { friendlySupabaseError } from "@/lib/supabase/friendly-error";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import type { TableInsert, TableUpdate } from "@/types/database";

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "on" || value === "1";
}

function normalizeOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function requireUrl(value: string, label: string): string {
  try {
    const parsed = new URL(value.trim());
    return parsed.toString();
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

function requireDateTime(value: string): string {
  const input = value.trim();
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Event date must be a valid date and time.");
  }
  return parsed.toISOString();
}

function parsePhotoUrlList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }

  const unique = new Set<string>();
  for (const raw of value.split(/\r?\n|,/g)) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    unique.add(requireDirectImageUrl(trimmed));
  }
  return Array.from(unique);
}

function requireDirectImageUrl(value: string): string {
  const url = requireUrl(value, "Photo URL");
  const parsed = new URL(url);
  const pathname = parsed.pathname.toLowerCase();
  if (!/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(pathname)) {
    throw new Error(
      "Photo URL must be a direct image file (.jpg, .png, .webp, .gif, .avif). Shared album/page links will not render.",
    );
  }
  return parsed.toString();
}

const EVENT_FLYER_MAX_BYTES = 10 * 1024 * 1024;
const EVENT_FLYER_ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function sanitizeStorageFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "flyer";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
  return cleaned || "flyer.jpg";
}

function isAllowedFlyerMime(mime: string, filename: string): boolean {
  if (EVENT_FLYER_ALLOWED_MIME.has(mime)) return true;
  if (mime === "" || mime === "application/octet-stream") {
    return /\.(jpg|jpeg|png|webp)$/i.test(filename);
  }
  return false;
}

function isAllowedPhotoMime(mime: string, filename: string): boolean {
  if (PHOTO_ALLOWED_MIME.has(mime)) return true;
  if (mime === "" || mime === "application/octet-stream") {
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filename);
  }
  return false;
}

export async function requestEventFlyerUploadSlot(formData: FormData) {
  try {
    await assertAdminAccess();

    const nameRaw = formData.get("filename");
    const sizeRaw = formData.get("size");
    const mimeRaw = formData.get("mime");

    const filename = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const size = typeof sizeRaw === "string" ? Number(sizeRaw) : NaN;
    const mime = typeof mimeRaw === "string" ? mimeRaw.trim() : "";

    if (!filename || !Number.isFinite(size) || size <= 0) {
      return { ok: false as const, message: "Invalid flyer file." };
    }
    if (size > EVENT_FLYER_MAX_BYTES) {
      return { ok: false as const, message: "Flyer must be 10MB or smaller." };
    }
    if (!isAllowedFlyerMime(mime, filename)) {
      return { ok: false as const, message: "Flyer must be JPG, PNG, or WebP." };
    }

    const bucket = getEventFlyerBucketId();
    const path = `events/flyers/${crypto.randomUUID()}/${sanitizeStorageFileName(filename)}`;

    const service = createSupabaseServiceRoleClient();
    const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      return {
        ok: false as const,
        message: friendlySupabaseError(error?.message, "Could not start flyer upload."),
      };
    }

    const {
      data: { publicUrl },
    } = service.storage.from(bucket).getPublicUrl(path);

    return {
      ok: true as const,
      bucket,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl,
    };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? friendlySupabaseError(error.message, "Could not upload flyer.")
          : "Could not upload flyer.",
    };
  }
}

export async function requestPhotoUploadSlot(formData: FormData) {
  try {
    await assertAdminAccess();

    const nameRaw = formData.get("filename");
    const sizeRaw = formData.get("size");
    const mimeRaw = formData.get("mime");

    const filename = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const size = typeof sizeRaw === "string" ? Number(sizeRaw) : NaN;
    const mime = typeof mimeRaw === "string" ? mimeRaw.trim() : "";

    if (!filename || !Number.isFinite(size) || size <= 0) {
      return { ok: false as const, message: "Invalid photo file." };
    }
    if (size > PHOTO_UPLOAD_MAX_BYTES) {
      return { ok: false as const, message: "Photo must be 10MB or smaller." };
    }
    if (!isAllowedPhotoMime(mime, filename)) {
      return { ok: false as const, message: "Photo must be JPG, PNG, WebP, GIF, or AVIF." };
    }

    const bucket = getPhotoPostBucketId();
    const path = `photos/posts/${crypto.randomUUID()}/${sanitizeStorageFileName(filename)}`;

    const service = createSupabaseServiceRoleClient();
    const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) {
      return {
        ok: false as const,
        message: friendlySupabaseError(error?.message, "Could not start photo upload."),
      };
    }

    const {
      data: { publicUrl },
    } = service.storage.from(bucket).getPublicUrl(path);

    return {
      ok: true as const,
      bucket,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl,
    };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? friendlySupabaseError(error.message, "Could not upload photo.")
          : "Could not upload photo.",
    };
  }
}

export async function setVideoPublished(videoId: string, published: boolean) {
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("videos").update({ published }).eq("id", videoId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/videos");
  return { ok: true as const };
}

const mixEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseOptionalMixUrl(raw: FormDataEntryValue | null): string | null | "__invalid__" {
  if (typeof raw !== "string") {
    return null;
  }
  const t = raw.trim();
  if (!t) return null;
  try {
    const parsed = new URL(t);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "__invalid__";
    }
    return parsed.toString();
  } catch {
    return "__invalid__";
  }
}

export async function updateDjMix(formData: FormData) {
  try {
    const idRaw = formData.get("id");
    const djNameRaw = formData.get("dj_name");
    const emailRaw = formData.get("email");
    const mixTitleRaw = formData.get("mix_title");
    const mixLinkRaw = formData.get("mix_link");
    const cityRaw = formData.get("city");
    const instagramRaw = formData.get("instagram");
    const platformRaw = formData.get("platform");
    const notesRaw = formData.get("notes");
    const statusRaw = formData.get("status");

    const id = typeof idRaw === "string" ? idRaw.trim() : "";
    const dj_name = typeof djNameRaw === "string" ? djNameRaw.trim() : "";
    const emailInput = typeof emailRaw === "string" ? emailRaw.trim() : "";
    const email = emailInput.toLowerCase();
    const mix_title = typeof mixTitleRaw === "string" ? mixTitleRaw.trim() : "";
    const mixLinkParsed = parseOptionalMixUrl(mixLinkRaw);
    const city = typeof cityRaw === "string" ? cityRaw.trim() : "";
    const instagram = typeof instagramRaw === "string" ? instagramRaw.trim() : "";
    const platform = typeof platformRaw === "string" ? platformRaw.trim() : "";
    const notes = typeof notesRaw === "string" ? notesRaw.trim() : "";
    const status = typeof statusRaw === "string" ? statusRaw.trim() : "";

    if (!id) {
      return { ok: false as const, message: "Mix id is missing." };
    }
    if (!dj_name) {
      return { ok: false as const, message: "DJ / artist name is required." };
    }
    if (dj_name.length > 200) {
      return { ok: false as const, message: "DJ name must be 200 characters or fewer." };
    }
    if (!emailInput) {
      return { ok: false as const, message: "Email is required." };
    }
    if (!mixEmailPattern.test(email)) {
      return { ok: false as const, message: "Enter a valid email address." };
    }
    if (!mix_title) {
      return { ok: false as const, message: "Mix title is required." };
    }
    if (mix_title.length > 300) {
      return { ok: false as const, message: "Mix title must be 300 characters or fewer." };
    }
    if (mixLinkParsed === "__invalid__") {
      return { ok: false as const, message: "Mix link must be a full https:// URL or empty." };
    }
    if (city.length > 120) {
      return { ok: false as const, message: "City must be 120 characters or fewer." };
    }
    if (instagram.length > 200) {
      return { ok: false as const, message: "Instagram must be 200 characters or fewer." };
    }
    if (platform.length > 80) {
      return { ok: false as const, message: "Platform must be 80 characters or fewer." };
    }
    if (notes.length > 2000) {
      return { ok: false as const, message: "Notes must be 2000 characters or fewer." };
    }
    if (!isDjMixStatus(status)) {
      return { ok: false as const, message: "Invalid status." };
    }

    const patch: TableUpdate<"dj_mixes"> = {
      dj_name,
      email,
      mix_title,
      mix_link: mixLinkParsed && mixLinkParsed !== "__invalid__" ? mixLinkParsed : null,
      city: city || null,
      instagram: instagram || null,
      platform: platform || null,
      notes: notes || null,
      status,
    };

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("dj_mixes").update(patch).eq("id", id);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update mix.",
    };
  }
}

export async function deleteMix(mixId: string) {
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("dj_mixes").delete().eq("id", mixId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createVideo(formData: FormData) {
  try {
    const titleRaw = formData.get("title");
    const videoUrlRaw = formData.get("video_url");
    const thumbnailRaw = formData.get("thumbnail_url");
    const categoryRaw = formData.get("category");
    const published = parseBoolean(formData.get("published"));

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const videoUrlInput = typeof videoUrlRaw === "string" ? videoUrlRaw.trim() : "";

    if (!title) {
      return { ok: false as const, message: "Video title is required." };
    }
    if (!videoUrlInput) {
      return { ok: false as const, message: "Video URL is required." };
    }

    const row: TableInsert<"videos"> = {
      title,
      video_url: requireUrl(videoUrlInput, "Video URL"),
      thumbnail_url: normalizeOptionalText(thumbnailRaw),
      category: normalizeOptionalText(categoryRaw),
      published,
    };

    if (row.thumbnail_url) {
      row.thumbnail_url = requireUrl(row.thumbnail_url, "Thumbnail URL");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("videos").insert(row);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/videos");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to add video.",
    };
  }
}

export async function updateVideo(formData: FormData) {
  try {
    const idRaw = formData.get("id");
    const titleRaw = formData.get("title");
    const videoUrlRaw = formData.get("video_url");
    const thumbnailRaw = formData.get("thumbnail_url");
    const categoryRaw = formData.get("category");
    const published = parseBoolean(formData.get("published"));

    const id = typeof idRaw === "string" ? idRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const videoUrlInput = typeof videoUrlRaw === "string" ? videoUrlRaw.trim() : "";

    if (!id) {
      return { ok: false as const, message: "Video id is missing." };
    }
    if (!title) {
      return { ok: false as const, message: "Video title is required." };
    }
    if (!videoUrlInput) {
      return { ok: false as const, message: "Video URL is required." };
    }

    const patch: TableUpdate<"videos"> = {
      title,
      video_url: requireUrl(videoUrlInput, "Video URL"),
      thumbnail_url: normalizeOptionalText(thumbnailRaw),
      category: normalizeOptionalText(categoryRaw),
      published,
    };

    if (patch.thumbnail_url) {
      patch.thumbnail_url = requireUrl(patch.thumbnail_url, "Thumbnail URL");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("videos").update(patch).eq("id", id);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/videos");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update video.",
    };
  }
}

export async function deleteVideo(videoId: string) {
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("videos").delete().eq("id", videoId);
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/videos");
  return { ok: true as const };
}

export async function createPhotoPost(formData: FormData) {
  try {
    const titleRaw = formData.get("title");
    const captionRaw = formData.get("caption");
    const linkRaw = formData.get("link_url");
    const mediaRaw = formData.get("media_urls");
    const published = parseBoolean(formData.get("published"));

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    if (!title) {
      return { ok: false as const, message: "Post title is required." };
    }

    const mediaUrls = parsePhotoUrlList(mediaRaw);
    if (mediaUrls.length === 0) {
      return { ok: false as const, message: "Add at least one photo URL." };
    }

    const row: TableInsert<"photos"> = {
      title,
      caption: normalizeOptionalText(captionRaw),
      link_url: normalizeOptionalText(linkRaw),
      media_urls: mediaUrls,
      published,
    };

    if (row.link_url) {
      row.link_url = requireUrl(row.link_url, "Post link");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("photos").insert(row);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/photos");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to add photo post.",
    };
  }
}

export async function updatePhotoPost(formData: FormData) {
  try {
    const idRaw = formData.get("id");
    const titleRaw = formData.get("title");
    const captionRaw = formData.get("caption");
    const linkRaw = formData.get("link_url");
    const mediaRaw = formData.get("media_urls");
    const published = parseBoolean(formData.get("published"));

    const id = typeof idRaw === "string" ? idRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    if (!id) {
      return { ok: false as const, message: "Post id is missing." };
    }
    if (!title) {
      return { ok: false as const, message: "Post title is required." };
    }

    const mediaUrls = parsePhotoUrlList(mediaRaw);
    if (mediaUrls.length === 0) {
      return { ok: false as const, message: "Add at least one photo URL." };
    }

    const patch: TableUpdate<"photos"> = {
      title,
      caption: normalizeOptionalText(captionRaw),
      link_url: normalizeOptionalText(linkRaw),
      media_urls: mediaUrls,
      published,
    };

    if (patch.link_url) {
      patch.link_url = requireUrl(patch.link_url, "Post link");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("photos").update(patch).eq("id", id);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/photos");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update photo post.",
    };
  }
}

export async function deletePhotoPost(photoId: string) {
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/photos");
  return { ok: true as const };
}

export async function createEvent(formData: FormData) {
  try {
    const titleRaw = formData.get("title");
    const dateRaw = formData.get("event_date");
    const locationRaw = formData.get("location");
    const descriptionRaw = formData.get("description");
    const rsvpRaw = formData.get("rsvp_link");
    const flyerRaw = formData.get("flyer_image_url");

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const location = typeof locationRaw === "string" ? locationRaw.trim() : "";
    const eventDateInput = typeof dateRaw === "string" ? dateRaw.trim() : "";

    if (!title) {
      return { ok: false as const, message: "Event title is required." };
    }
    if (!eventDateInput) {
      return { ok: false as const, message: "Event date is required." };
    }
    if (!location) {
      return { ok: false as const, message: "Location is required." };
    }

    const row: TableInsert<"events"> = {
      title,
      event_date: requireDateTime(eventDateInput),
      location,
      description: normalizeOptionalText(descriptionRaw),
      rsvp_link: normalizeOptionalText(rsvpRaw),
      flyer_image_url: normalizeOptionalText(flyerRaw),
    };

    if (row.rsvp_link) {
      row.rsvp_link = requireUrl(row.rsvp_link, "RSVP link");
    }
    if (row.flyer_image_url) {
      row.flyer_image_url = requireUrl(row.flyer_image_url, "Flyer image URL");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("events").insert(row);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/events");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to add event.",
    };
  }
}

export async function updateEvent(formData: FormData) {
  try {
    const idRaw = formData.get("id");
    const titleRaw = formData.get("title");
    const dateRaw = formData.get("event_date");
    const locationRaw = formData.get("location");
    const descriptionRaw = formData.get("description");
    const rsvpRaw = formData.get("rsvp_link");
    const flyerRaw = formData.get("flyer_image_url");

    const id = typeof idRaw === "string" ? idRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const location = typeof locationRaw === "string" ? locationRaw.trim() : "";
    const eventDateInput = typeof dateRaw === "string" ? dateRaw.trim() : "";

    if (!id) {
      return { ok: false as const, message: "Event id is missing." };
    }
    if (!title) {
      return { ok: false as const, message: "Event title is required." };
    }
    if (!eventDateInput) {
      return { ok: false as const, message: "Event date is required." };
    }
    if (!location) {
      return { ok: false as const, message: "Location is required." };
    }

    const patch: TableUpdate<"events"> = {
      title,
      event_date: requireDateTime(eventDateInput),
      location,
      description: normalizeOptionalText(descriptionRaw),
      rsvp_link: normalizeOptionalText(rsvpRaw),
      flyer_image_url: normalizeOptionalText(flyerRaw),
    };

    if (patch.rsvp_link) {
      patch.rsvp_link = requireUrl(patch.rsvp_link, "RSVP link");
    }
    if (patch.flyer_image_url) {
      patch.flyer_image_url = requireUrl(patch.flyer_image_url, "Flyer image URL");
    }

    const supabase = await requireAdminServiceRoleClient();
    const { error } = await supabase.from("events").update(patch).eq("id", id);
    if (error) {
      return { ok: false as const, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/events");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Failed to update event.",
    };
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/events");
  return { ok: true as const };
}
