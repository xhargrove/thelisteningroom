import { formatEventDateShort } from "@/lib/events/format-event-date";
import type { TableRow } from "@/types/database";

type Event = TableRow<"events">;

export function PastEventCard({ event }: { event: Event }) {
  const short = formatEventDateShort(event.event_date);

  return (
    <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-night-card/80 to-night-elevated/50 p-6 transition-all hover:border-white/20">
      <svg
        className="mb-4 h-8 w-8 text-accent-secondary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <h3 className="mb-3 text-xl font-bold text-white">{event.title}</h3>
      <div className="space-y-2 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <time dateTime={event.event_date}>{short}</time>
        </div>
      </div>
    </article>
  );
}
