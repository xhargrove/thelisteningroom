import { PhotoCarousel } from "@/components/photos/photo-carousel";
import { coercePhotoUrls, isDirectImageUrl } from "@/lib/photos/media-urls";
import { formatGalleryDate } from "@/lib/dates/format-gallery-date";
import type { TableRow } from "@/types/database";

type PhotoPost = TableRow<"photos">;

export function PhotoCard({ post, index = 0 }: { post: PhotoPost; index?: number }) {
  const mediaUrls = coercePhotoUrls(post.media_urls);
  if (mediaUrls.length === 0) {
    return null;
  }
  const images = mediaUrls.filter(isDirectImageUrl);
  const fallbackLink = post.link_url?.trim() || mediaUrls[0];
  const posted = formatGalleryDate(post.created_at);
  const count = images.length;
  const orbFlip = index % 2 === 0;
  const hasVisual = images.length > 0;

  return (
    <article className="group relative cursor-default overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/90 to-night-elevated/50 transition-all hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {hasVisual ? (
          <>
            <PhotoCarousel images={images} title={post.title} layout="tile" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              aria-hidden
            />
            <div className="pointer-events-none absolute right-4 top-4 z-[5] rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                {count} photo{count === 1 ? "" : "s"}
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] p-6">
              {posted ? (
                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
                  <svg
                    className="h-3 w-3 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <time dateTime={post.created_at}>{posted}</time>
                </div>
              ) : null}
              <h2 className="text-xl font-bold text-white transition-colors group-hover:text-accent">
                {post.title}
              </h2>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm text-zinc-400">
              This post uses a gallery or share link. Open it in the original app to view photos.
            </p>
            {fallbackLink?.trim() ? (
              <a
                href={fallbackLink.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm"
              >
                Open link
              </a>
            ) : null}
          </div>
        )}
      </div>

      {hasVisual && (post.caption?.trim() || fallbackLink?.trim()) ? (
        <div className="space-y-3 p-5">
          {post.caption?.trim() ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{post.caption}</p>
          ) : null}
          {fallbackLink?.trim() ? (
            <a
              href={fallbackLink.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-gradient-to-r from-accent/10 to-accent-secondary/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-accent/40 hover:from-accent/20 hover:to-accent-secondary/20"
            >
              Open photo link
            </a>
          ) : null}
        </div>
      ) : null}

      {!hasVisual && (post.caption?.trim() || post.title) ? (
        <div className="space-y-2 p-5">
          <h2 className="text-lg font-semibold text-white">{post.title}</h2>
          {post.caption?.trim() ? (
            <p className="line-clamp-3 text-sm text-zinc-400">{post.caption}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={`pointer-events-none absolute -right-1 -top-1 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity group-hover:opacity-20 ${
          orbFlip ? "from-accent to-accent-secondary" : "from-accent-secondary to-accent"
        }`}
        aria-hidden
      />
    </article>
  );
}
