export type VideoPlatform = "youtube" | "instagram" | "tiktok" | "unknown";

/**
 * Classify a stored video URL for labels and light UI hints.
 * Watch always uses the original `video_url` (must be a valid public link).
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

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
    default:
      return "Watch";
  }
}
