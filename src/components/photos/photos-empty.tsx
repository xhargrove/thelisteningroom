export function PhotosEmpty() {
  return (
    <div className="rounded-xl border border-accent-dim/25 bg-night-card/80 p-6 text-center sm:p-8">
      <p className="text-lg font-semibold text-white">No photo posts yet</p>
      <p className="mt-2 text-sm text-zinc-400">Check back soon for new images and carousel drops.</p>
    </div>
  );
}
