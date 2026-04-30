export type VideoPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "mux"
  | "hosted"
  | "unknown";

/**
 * Classify a stored video URL for labels and light UI hints.
 * Watch always uses the original `video_url` (must be a valid public link).
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  try {
    const trimmed = url.trim();
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = u.pathname.toLowerCase();

    if (host === "player.mux.com") {
      return "mux";
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(pathname)) {
      return "hosted";
    }
    if (host.endsWith("supabase.co") && pathname.includes("/storage/v1/object/public/")) {
      return "hosted";
    }

    if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
      return "youtube";
    }
    if (host === "vm.tiktok.com" || host.endsWith("tiktok.com")) {
      return "tiktok";
    }
    if (host.endsWith("instagram.com")) {
      return "instagram";
    }
  } catch {
    return "unknown";
  }
  return "unknown";
}

export function watchButtonLabel(platform: VideoPlatform): string {
  switch (platform) {
    case "youtube":
      return "Watch on YouTube";
    case "instagram":
      return "Watch on Instagram";
    case "tiktok":
      return "Watch on TikTok";
    case "hosted":
      return "Open file";
    case "mux":
      return "Open player";
    default:
      return "Watch";
  }
}
