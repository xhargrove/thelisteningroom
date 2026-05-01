import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EventCard } from "@/components/events/event-card";
import { EventsEmpty } from "@/components/events/events-empty";
import { PastEventCard } from "@/components/events/past-event-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabasePublicConfig } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

function EventsPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[60vh] overflow-hidden pt-12 sm:pt-14 lg:pt-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent-secondary/5"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="mb-12 text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
            <svg
              className="h-4 w-4 shrink-0 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-sm font-medium text-zinc-200">Events</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Don&apos;t miss out
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Join us for unforgettable nights of music and community at The Listening Room.
          </p>
        </header>
        {children}
      </div>
    </div>
  );
}

export default async function EventsPage() {
  if (!hasSupabasePublicConfig()) {
    return (
      <EventsPageShell>
        <p className="mx-auto max-w-xl text-center text-zinc-300">
          Add Supabase environment variables to load events from the database.
        </p>
      </EventsPageShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, event_date, location, description, rsvp_link, flyer_image_url, sort_order, created_at",
      )
      .gte("event_date", nowIso)
      .order("sort_order", { ascending: true })
      .order("event_date", { ascending: true })
      .limit(20),
    supabase
      .from("events")
      .select(
        "id, title, event_date, location, description, rsvp_link, flyer_image_url, sort_order, created_at",
      )
      .lt("event_date", nowIso)
      .order("event_date", { ascending: false })
      .limit(9),
  ]);

  if (upcomingRes.error || pastRes.error) {
    const err = upcomingRes.error ?? pastRes.error;
    return (
      <EventsPageShell>
        <p className="mx-auto max-w-xl rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-center text-sm text-red-200">
          {err?.message ?? "Could not load events. Try again later."}
        </p>
      </EventsPageShell>
    );
  }

  const upcoming = upcomingRes.data ?? [];
  const past = pastRes.data ?? [];

  return (
    <EventsPageShell>
      <section className="mb-16 space-y-8 sm:mb-20">
        <h2 className="text-3xl font-bold text-white">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <EventsEmpty />
        ) : (
          <div className="grid gap-8">
            {upcoming.map((event, index) => (
              <EventCard key={event.id} event={event} featured={index === 0} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white">Past events</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <li key={event.id}>
                <PastEventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </EventsPageShell>
  );
}
