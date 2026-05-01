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

/** Convert common YouTube URL formats into an embeddable URL. */
export function getYouTubeEmbedUrl(inputUrl: string): string | null {
  try {
    const url = new URL(inputUrl.trim());
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? "";
      } else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] ?? "";
      }
    }

    if (!/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

/** Video id for poster URLs and lazy embeds; null if not a parseable YouTube link. */
export function getYouTubeVideoId(inputUrl: string): string | null {
  const embed = getYouTubeEmbedUrl(inputUrl);
  if (!embed) return null;
  try {
    const last = new URL(embed).pathname.split("/").filter(Boolean).pop();
    return last && /^[a-zA-Z0-9_-]{6,}$/.test(last) ? last : null;
  } catch {
    return null;
  }
}

/** Static thumbnail served by YouTube (works without API keys). */
export function getYouTubePosterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
