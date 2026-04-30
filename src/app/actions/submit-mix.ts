"use server";

import { revalidatePath } from "next/cache";
import type { MixSubmitState } from "@/lib/mix-submit/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableInsert } from "@/types/database";

const initialState: MixSubmitState = {
  success: false,
  error: null,
  fieldErrors: {},
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalUrl(raw: string): string | null {
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

export async function submitDjMix(_prev: MixSubmitState, formData: FormData): Promise<MixSubmitState> {
  const dj_nameRaw = formData.get("dj_name");
  const emailRaw = formData.get("email");
  const mix_titleRaw = formData.get("mix_title");
  const mix_linkRaw = formData.get("mix_link");
  const cityRaw = formData.get("city");
  const instagramRaw = formData.get("instagram");
  const platformRaw = formData.get("platform");
  const notesRaw = formData.get("notes");

  const dj_name = typeof dj_nameRaw === "string" ? dj_nameRaw.trim() : "";
  const emailInput = typeof emailRaw === "string" ? emailRaw.trim() : "";
  const email = emailInput.toLowerCase();
  const mix_title = typeof mix_titleRaw === "string" ? mix_titleRaw.trim() : "";
  const mix_linkInput = typeof mix_linkRaw === "string" ? mix_linkRaw : "";
  const mixLinkParsed = optionalUrl(mix_linkInput);
  const city = typeof cityRaw === "string" ? cityRaw.trim() : "";
  const instagram = typeof instagramRaw === "string" ? instagramRaw.trim() : "";
  const platform = typeof platformRaw === "string" ? platformRaw.trim() : "";
  const notes = typeof notesRaw === "string" ? notesRaw.trim() : "";

  const fieldErrors: MixSubmitState["fieldErrors"] = {};

  if (!dj_name) {
    fieldErrors.dj_name = "Artist / DJ name is required.";
  } else if (dj_name.length > 200) {
    fieldErrors.dj_name = "Keep this under 200 characters.";
  }

  if (!emailInput) {
    fieldErrors.email = "Email is required so we can reach you.";
  } else if (!emailPattern.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!mix_title) {
    fieldErrors.mix_title = "Mix title is required.";
  } else if (mix_title.length > 300) {
    fieldErrors.mix_title = "Keep this under 300 characters.";
  }

  if (mixLinkParsed === "__invalid__") {
    fieldErrors.mix_link = "Use a full link starting with https://";
  }

  if (city.length > 120) {
    fieldErrors.city = "Keep city under 120 characters.";
  }
  if (instagram.length > 200) {
    fieldErrors.instagram = "Keep this under 200 characters.";
  }
  if (platform.length > 80) {
    fieldErrors.platform = "Keep platform under 80 characters.";
  }
  if (notes.length > 2000) {
    fieldErrors.notes = "Notes must be 2000 characters or fewer.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: null, fieldErrors };
  }

  const supabase = await createSupabaseServerClient();

  const row: TableInsert<"dj_mixes"> = {
    dj_name,
    email,
    mix_title,
    mix_link: mixLinkParsed && mixLinkParsed !== "__invalid__" ? mixLinkParsed : null,
    city: city || null,
    instagram: instagram || null,
    platform: platform || null,
    notes: notes || null,
    status: "pending",
  };

  const { error } = await supabase.from("dj_mixes").insert(row);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not submit your mix. Try again in a moment.",
      fieldErrors: {},
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { ...initialState, success: true };
}
