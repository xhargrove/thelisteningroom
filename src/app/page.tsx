import Image from "next/image";
import Link from "next/link";
import { EmailSignupForm } from "@/components/email-signup-form";
import { formatEventDate } from "@/lib/events/format-event-date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { detectVideoPlatform, watchButtonLabel } from "@/lib/videos/platform";

/** Refresh homepage periodically so featured mixes stay in sync after admin changes. */
export const revalidate = 60;

export default async function HomePage() {
  const hasSupabaseConfig =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

  let featuredMixes:
    | {
        id: string;
        dj_name: string;
        mix_title: string;
        mix_link: string | null;
        platform: string | null;
      }[]
    | null = null;
  let featuredVideos:
    | {
        id: string;
        title: string;
        video_url: string;
        thumbnail_url: string | null;
        category: string | null;
      }[]
    | null = null;
  let upcomingEvent:
    | {
        id: string;
        title: string;
        event_date: string;
        location: string;
        description: string | null;
        rsvp_link: string | null;
        flyer_image_url: string | null;
      }
    | null = null;

  if (hasSupabaseConfig) {
    const supabase = await createSupabaseServerClient();
    const nowIso = new Date().toISOString();

    const [{ data: mixes }, { data: videos }, { data: events }] = await Promise.all([
      supabase
        .from("dj_mixes")
        .select("id, dj_name, mix_title, mix_link, platform")
        .eq("status", "featured")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("videos")
        .select("id, title, video_url, thumbnail_url, category")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("events")
        .select("id, title, event_date, location, description, rsvp_link, flyer_image_url")
        .gte("event_date", nowIso)
        .order("event_date", { ascending: true })
        .limit(1),
    ]);

    featuredMixes = mixes ?? [];
    featuredVideos = videos ?? [];
    upcomingEvent = events?.[0] ?? null;
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(250,204,21,0.15),transparent)]"
        aria-hidden
      />
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt=""
            width={200}
            height={220}
            className="mb-10 h-auto w-48 sm:w-56"
            priority
          />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-accent-muted">
            Nightlife · Sound · Community
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            The Listening Room
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-zinc-400 sm:text-xl">
            A home for mixes, sessions, and late-night energy. Tune in, show up, stay loud.
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/submit-mix"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              Submit a mix
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg border border-accent/40 bg-transparent px-6 py-3 text-center text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
            >
              View events
            </Link>
          </div>
        </div>
      </section>

      <section
        className="border-t border-accent-dim/25 bg-night-elevated/80 py-14 sm:py-16"
        aria-labelledby="featured-mixes-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="featured-mixes-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Featured DJ mixes
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-400">
            Handpicked sets from The Listening Room.
          </p>

          {!hasSupabaseConfig ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Add Supabase environment variables to load featured mixes.
            </p>
          ) : featuredMixes && featuredMixes.length > 0 ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMixes.map((mix) => (
                <li key={mix.id}>
                  <article className="flex h-full flex-col rounded-xl border border-accent-dim/25 bg-night-card/80 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-accent-muted">
                      {mix.platform?.trim() ? mix.platform : "Mix"}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
                      {mix.mix_title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">{mix.dj_name}</p>
                    <div className="mt-5 mt-auto pt-2">
                      {mix.mix_link?.trim() ? (
                        <a
                          href={mix.mix_link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
                        >
                          Open mix
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600">Link coming soon</span>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-center text-sm text-zinc-500">No featured mixes yet.</p>
          )}
        </div>
      </section>

      <section
        className="border-t border-accent-dim/25 bg-night/90 py-14 sm:py-16"
        aria-labelledby="featured-videos-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="featured-videos-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Featured videos
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-400">
            Published clips and sets from the room.
          </p>

          {!hasSupabaseConfig ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Add Supabase environment variables to load featured videos.
            </p>
          ) : featuredVideos && featuredVideos.length > 0 ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVideos.map((video) => {
                const platform = detectVideoPlatform(video.video_url);
                return (
                  <li key={video.id}>
                    <article className="flex h-full flex-col rounded-xl border border-accent-dim/25 bg-night-card/80 p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-accent-muted">
                        {video.category?.trim() ? video.category : "Video"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
                        {video.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 capitalize">{platform}</p>
                      <div className="mt-5 mt-auto pt-2">
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
                        >
                          {watchButtonLabel(platform)}
                        </a>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-8 text-center text-sm text-zinc-500">No published videos yet.</p>
          )}
        </div>
      </section>

      <section
        className="border-t border-accent-dim/25 bg-night-elevated/80 py-14 sm:py-16"
        aria-labelledby="upcoming-event-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="upcoming-event-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Upcoming event
          </h2>

          {!hasSupabaseConfig ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Add Supabase environment variables to load upcoming events.
            </p>
          ) : upcomingEvent ? (
            <article className="mx-auto mt-8 max-w-2xl rounded-xl border border-accent-dim/25 bg-night-card/80 p-6 sm:p-7">
              {upcomingEvent.flyer_image_url?.trim() ? (
                <div className="mb-6 overflow-hidden rounded-lg border border-accent-dim/25 bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={upcomingEvent.flyer_image_url.trim()}
                    alt={`${upcomingEvent.title} flyer`}
                    className="mx-auto aspect-[9/16] h-auto w-full max-w-sm object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <time className="text-xs font-semibold uppercase tracking-wider text-accent">
                {formatEventDate(upcomingEvent.event_date)}
              </time>
              <h3 className="mt-2 text-2xl font-semibold text-white">{upcomingEvent.title}</h3>
              <p className="mt-2 text-sm font-medium text-zinc-300">{upcomingEvent.location}</p>
              {upcomingEvent.description?.trim() ? (
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  {upcomingEvent.description}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {upcomingEvent.rsvp_link?.trim() ? (
                  <a
                    href={upcomingEvent.rsvp_link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
                  >
                    RSVP
                  </a>
                ) : null}
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-lg border border-accent/40 bg-transparent px-5 py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
                >
                  View all events
                </Link>
              </div>
            </article>
          ) : (
            <p className="mt-8 text-center text-sm text-zinc-500">No upcoming events yet.</p>
          )}
        </div>
      </section>

      <EmailSignupForm />

      <section className="border-t border-accent-dim/25 bg-night/90 py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6">
          <article className="rounded-xl border border-accent-dim/25 bg-night-card/80 p-6">
            <h2 className="text-2xl font-semibold text-white">Submit your mix</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Send your latest set to The Listening Room team for review.
            </p>
            <Link
              href="/submit-mix"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              Submit mix
            </Link>
          </article>

          <article className="rounded-xl border border-accent-dim/25 bg-night-card/80 p-6">
            <h2 className="text-2xl font-semibold text-white">Follow us</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Stay tuned for drops, event announcements, and room highlights.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-accent/40 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-accent/40 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
              >
                YouTube
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-accent/40 px-4 py-2 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/10"
              >
                TikTok
              </a>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
