"use server";

import { revalidatePath } from "next/cache";
import { isDjMixStatus } from "@/lib/dj-mixes/status";
import { requireAdminSupabase } from "@/lib/admin/require-admin";
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

export async function setVideoPublished(videoId: string, published: boolean) {
  const supabase = await requireAdminSupabase();
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
  const supabase = await requireAdminSupabase();
  const { error } = await supabase.from("dj_mixes").update({ status }).eq("id", mixId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteMix(mixId: string) {
  const supabase = await requireAdminSupabase();
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

    const supabase = await requireAdminSupabase();
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

    const supabase = await requireAdminSupabase();
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
  const supabase = await requireAdminSupabase();
  const { error } = await supabase.from("videos").delete().eq("id", videoId);
  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/videos");
  return { ok: true as const };
}

export async function createEvent(formData: FormData) {
  try {
    const titleRaw = formData.get("title");
    const dateRaw = formData.get("event_date");
    const locationRaw = formData.get("location");
    const descriptionRaw = formData.get("description");
    const rsvpRaw = formData.get("rsvp_link");

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
    };

    if (row.rsvp_link) {
      row.rsvp_link = requireUrl(row.rsvp_link, "RSVP link");
    }

    const supabase = await requireAdminSupabase();
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
    };

    if (patch.rsvp_link) {
      patch.rsvp_link = requireUrl(patch.rsvp_link, "RSVP link");
    }

    const supabase = await requireAdminSupabase();
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
  const supabase = await requireAdminSupabase();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/admin");
  revalidatePath("/events");
  return { ok: true as const };
}
