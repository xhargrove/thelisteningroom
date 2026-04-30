import { PhotoCarousel } from "@/components/photos/photo-carousel";
import { coercePhotoUrls } from "@/lib/photos/media-urls";
import type { TableRow } from "@/types/database";

type PhotoPost = TableRow<"photos">;

export function PhotoCard({ post }: { post: PhotoPost }) {
  const images = coercePhotoUrls(post.media_urls);
  if (images.length === 0) {
    return null;
  }

  return (
    <article className="rounded-xl border border-accent-dim/25 bg-night-card/80 p-4 sm:p-5">
      <PhotoCarousel images={images} title={post.title} />
      <h2 className="mt-4 text-xl font-semibold text-white">{post.title}</h2>
      {post.caption?.trim() ? <p className="mt-2 text-sm leading-relaxed text-zinc-400">{post.caption}</p> : null}
      {post.link_url?.trim() ? (
        <a
          href={post.link_url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
        >
          Open link
        </a>
      ) : null}
    </article>
  );
}
