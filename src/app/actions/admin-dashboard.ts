"use server";

import { revalidatePath } from "next/cache";
import { isDjMixStatus } from "@/lib/dj-mixes/status";
import {
  assertAdminAccess,
  requireAdminServiceRoleClient,
} from "@/lib/admin/require-admin";
import { getEventFlyerBucketId } from "@/lib/storage/event-flyer-bucket";
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
    unique.add(requireUrl(trimmed, "Photo URL"));
  }
  return Array.from(unique);
}

const EVENT_FLYER_MAX_BYTES = 10 * 1024 * 1024;
const EVENT_FLYER_ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

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
        message: error?.message ?? "Could not start flyer upload.",
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
      message: error instanceof Error ? error.message : "Could not upload flyer.",
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

export async function setMixStatus(mixId: string, status: string) {
  if (!isDjMixStatus(status)) {
    return { ok: false as const, message: "Invalid status." };
  }
  const supabase = await requireAdminServiceRoleClient();
  const { error } = await supabase.from("dj_mixes").update({ status }).eq("id", mixId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
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
