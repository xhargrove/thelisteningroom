import { PhotoCarousel } from "@/components/photos/photo-carousel";
import { coercePhotoUrls, isDirectImageUrl } from "@/lib/photos/media-urls";
import type { TableRow } from "@/types/database";

type PhotoPost = TableRow<"photos">;

export function PhotoCard({ post }: { post: PhotoPost }) {
  const mediaUrls = coercePhotoUrls(post.media_urls);
  if (mediaUrls.length === 0) {
    return null;
  }
  const images = mediaUrls.filter(isDirectImageUrl);
  const fallbackLink = post.link_url?.trim() || mediaUrls[0];

  return (
    <article className="panel p-4 sm:p-5">
      {images.length > 0 ? (
        <PhotoCarousel images={images} title={post.title} />
      ) : (
        <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
          This post contains a shared page URL instead of a direct image file.
        </div>
      )}
      <h2 className="mt-4 text-xl font-semibold text-white">{post.title}</h2>
      {post.caption?.trim() ? <p className="mt-2 text-sm leading-relaxed text-zinc-300">{post.caption}</p> : null}
      {fallbackLink?.trim() ? (
        <a
          href={fallbackLink.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="ui-btn-primary mt-4 inline-flex items-center justify-center"
        >
          Open photo link
        </a>
      ) : null}
    </article>
  );
}
