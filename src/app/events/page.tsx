import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { EventsEmpty } from "@/components/events/events-empty";
import { groupEventsByWeek } from "@/lib/events/group-events-by-week";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
        <p className="mt-3 text-zinc-300">
          Add Supabase environment variables to load events from the database.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("events")
    .select("id, title, event_date, location, description, rsvp_link, flyer_image_url, created_at")
    .gte("event_date", nowIso)
    .order("event_date", { ascending: true })
    .limit(5);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          Could not load events. Try again later.
        </p>
      </div>
    );
  }

  const events = rows ?? [];

  return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
      <p className="mt-3 text-zinc-300">
        Weekly showcases and special nights at The Listening Room—grouped by calendar week.
      </p>

      {events.length === 0 ? (
        <div className="mt-10">
          <EventsEmpty />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {groupEventsByWeek(events).map((week) => (
            <section key={week.weekKey} aria-labelledby={`week-${week.weekKey}`}>
              <h2
                id={`week-${week.weekKey}`}
                className="border-b border-accent-dim/25 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400"
              >
                Week of {week.weekLabel}
              </h2>
              <ul className="mt-6 space-y-6">
                {week.events.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
