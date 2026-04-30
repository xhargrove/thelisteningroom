import { formatEventDate } from "@/lib/events/format-event-date";
import type { TableRow } from "@/types/database";

type Event = TableRow<"events">;

export function EventCard({ event }: { event: Event }) {
  const rsvpUrl = event.rsvp_link?.trim();
  const description = event.description?.trim();
  const flyerUrl = event.flyer_image_url?.trim();

  return (
    <article className="panel p-6 sm:p-8">
      {flyerUrl ? (
        <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flyerUrl}
            alt={`${event.title} flyer`}
            className="mx-auto aspect-[9/16] h-auto w-full max-w-sm object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <time className="block text-xs font-semibold uppercase tracking-wider text-zinc-300" dateTime={event.event_date}>
        {formatEventDate(event.event_date)}
      </time>

      <h2 className="mt-3 text-xl font-semibold leading-snug text-white sm:text-2xl">{event.title}</h2>

      <p className="mt-3 text-sm font-medium text-zinc-200">{event.location}</p>

      {description ? <p className="mt-4 text-sm leading-relaxed text-zinc-300">{description}</p> : null}

      {rsvpUrl ? (
        <div className="mt-6">
          <a
            href={rsvpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-btn-primary inline-flex w-full items-center justify-center px-5 py-2.5 text-center sm:w-auto sm:min-w-[140px]"
          >
            RSVP
          </a>
        </div>
      ) : null}
    </article>
  );
}
