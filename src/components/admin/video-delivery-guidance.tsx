import { VIDEO_DELIVERY_STRATEGY } from "@/lib/videos/delivery-strategy";

export function VideoDeliveryGuidance() {
  const items = Object.values(VIDEO_DELIVERY_STRATEGY);

  return (
    <div className="rounded-lg border border-accent-dim/25 bg-night-elevated/60 p-4 text-sm text-zinc-300">
      <h3 className="font-semibold text-white">Video delivery (YouTube-like vs raw files)</h3>
      <p className="mt-2 text-zinc-400">
        Nothing in this app re-encodes uploads automatically. Real “adaptive streaming” like YouTube uses a
        transcoding service (Mux, Cloudflare Stream, YouTube, etc.) or you export a smaller file locally first.
      </p>
      <ul className="mt-3 list-inside list-disc space-y-2 text-zinc-400">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-medium text-zinc-200">{item.title}:</span> {item.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
