import type { Json } from "@/types/database";

/** Admin guidance; media_urls accepts any valid URL (legacy album links keep working). */
export const DIRECT_IMAGE_URL_REQUIREMENT =
  "Inline thumbnails on /photos need direct image URLs (.jpg, .png, .webp, .gif, .avif). Share or album links still save—the post shows “Open link” instead of a carousel.";

/** Extra context for Google Photos-style URLs. */
export const PHOTO_GALLERY_LINK_EXPLAINER =
  "Album links (e.g. photos.app.goo.gl) are saved as links. To show images inside the gallery tile, upload files here or paste URLs that point straight at an image file.";

export function coercePhotoUrls(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

export function urlsToTextarea(urls: string[]): string {
  return urls.join("\n");
}

export function isDirectImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(parsed.pathname.toLowerCase());
  } catch {
    return false;
  }
}
