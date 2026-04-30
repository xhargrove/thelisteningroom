import { formatEventDate } from "@/lib/events/format-event-date";
import type { TableRow } from "@/types/database";

type Event = TableRow<"events">;

export function EventCard({ event }: { event: Event }) {
  const rsvpUrl = event.rsvp_link?.trim();
  const description = event.description?.trim();
  const flyerUrl = event.flyer_image_url?.trim();

  return (
    <article className="rounded-xl border border-accent-dim/25 bg-night-card/80 p-6 sm:p-8">
      {flyerUrl ? (
        <div className="mb-6 overflow-hidden rounded-lg border border-accent-dim/25 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flyerUrl}
            alt={`${event.title} flyer`}
            className="mx-auto aspect-[9/16] h-auto w-full max-w-sm object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <time
        className="block text-xs font-semibold uppercase tracking-wider text-accent"
        dateTime={event.event_date}
      >
        {formatEventDate(event.event_date)}
      </time>

      <h2 className="mt-3 text-xl font-semibold leading-snug text-white sm:text-2xl">{event.title}</h2>

      <p className="mt-3 text-sm font-medium text-zinc-300">{event.location}</p>

      {description ? <p className="mt-4 text-sm leading-relaxed text-zinc-400">{description}</p> : null}

      {rsvpUrl ? (
        <div className="mt-6">
          <a
            href={rsvpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-yellow-300 sm:w-auto sm:min-w-[140px]"
          >
            RSVP
          </a>
        </div>
      ) : null}
    </article>
  );
}
