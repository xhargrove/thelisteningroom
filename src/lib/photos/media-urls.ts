import type { Json } from "@/types/database";

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
