import type { Metadata } from "next";
import { EventCard } from "@/components/events/event-card";
import { EventsEmpty } from "@/components/events/events-empty";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
        <p className="mt-3 text-zinc-400">
          Add Supabase environment variables to load events from the database.
        </p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("events")
    .select("id, title, event_date, location, description, rsvp_link, created_at")
    .gte("event_date", nowIso)
    .order("event_date", { ascending: true });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          Could not load events. Try again later.
        </p>
      </div>
    );
  }

  const events = rows ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Events</h1>
      <p className="mt-3 text-zinc-400">
        Upcoming nights and listings at The Listening Room.
      </p>

      {events.length === 0 ? (
        <div className="mt-10">
          <EventsEmpty />
        </div>
      ) : (
        <ul className="mt-10 space-y-6">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
