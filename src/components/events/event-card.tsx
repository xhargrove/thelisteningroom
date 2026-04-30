import { formatEventDateParts } from "@/lib/events/format-event-date";
import type { TableRow } from "@/types/database";

type Event = TableRow<"events">;

export function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const rsvpUrl = event.rsvp_link?.trim();
  const description = event.description?.trim();
  const flyerUrl = event.flyer_image_url?.trim();
  const parts = formatEventDateParts(event.event_date);

  return (
    <article className="group grid overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-night-card/90 to-night-elevated/50 transition-all hover:border-accent/40 lg:grid-cols-2 lg:gap-0">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-700/35 via-night-elevated/80 to-zinc-900/40 lg:aspect-auto lg:min-h-[300px]">
        {flyerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flyerUrl}
            alt={`${event.title} flyer`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[220px] items-center justify-center p-8 sm:p-12">
            <div className="space-y-6 text-center">
              <div className="text-balance text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                {event.title}
              </div>
              {featured ? (
                <div className="inline-block rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-900 motion-safe:animate-pulse">
                  Featured event
                </div>
              ) : null}
            </div>
          </div>
        )}

        {flyerUrl && featured ? (
          <div className="absolute left-4 top-4 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-900">
            Featured
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-between p-8 lg:p-12">
        <div className="space-y-6">
          {flyerUrl ? (
            <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{event.title}</h2>
          ) : null}

          <div className="space-y-4">
            {parts ? (
              <div className="flex items-start gap-3">
                <svg
                  className="mt-1 h-5 w-5 shrink-0 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <div className="mb-1 text-sm text-zinc-500">Date &amp; time</div>
                  <time className="text-lg font-semibold text-white" dateTime={event.event_date}>
                    {parts.dateLine}
                  </time>
                  <div className="text-zinc-400">{parts.timeLine}</div>
                </div>
              </div>
            ) : (
              <time className="text-sm text-zinc-400" dateTime={event.event_date}>
                {event.event_date}
              </time>
            )}

            <div className="flex items-start gap-3">
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-accent-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <div className="mb-1 text-sm text-zinc-500">Venue</div>
                <div className="text-lg font-semibold text-white">{event.location}</div>
              </div>
            </div>
          </div>

          {description ? (
            <div className="border-t border-white/10 pt-6">
              <p className="leading-relaxed text-zinc-400">{description}</p>
            </div>
          ) : null}
        </div>

        {rsvpUrl ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={rsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-800 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:from-zinc-500 hover:to-zinc-700 hover:shadow-xl"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                <path d="M13 5v2M13 17v2M13 11v2" />
              </svg>
              Get tickets / RSVP
              <svg
                className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
