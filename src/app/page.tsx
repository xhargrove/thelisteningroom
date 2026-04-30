import Image from "next/image";
import Link from "next/link";
import { EmailSignupForm } from "@/components/email-signup-form";
import { formatEventDate } from "@/lib/events/format-event-date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { detectVideoPlatform, getYouTubeEmbedUrl, watchButtonLabel } from "@/lib/videos/platform";

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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />

      {/* Hero — layout from Figma Make “Website for Listening Room”; routes + data stay Next/Supabase */}
      <div className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-secondary/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/4 top-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent-secondary/20 blur-3xl"
          aria-hidden
        />

        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-gradient-to-r from-accent/10 to-accent-secondary/10 px-4 py-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-accent motion-safe:animate-pulse"
                  aria-hidden
                />
                <span className="text-sm font-medium text-zinc-300">
                  Atlanta&apos;s premier DJ showcase
                </span>
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                  The Listening
                </span>
                <span className="mt-1 block bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                  Room
                </span>
              </h1>

              <p className="max-w-lg text-pretty text-lg text-zinc-400 sm:text-xl">
                Where Atlanta&apos;s finest DJs showcase their craft. Curated by Big X — experience
                electrifying sets and discover your next favorite artist.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/videos"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-800 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:from-zinc-500 hover:to-zinc-700 hover:shadow-xl"
                >
                  <svg
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch sets
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  <svg
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Upcoming events
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div>
                  <div className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-3xl font-bold text-transparent">
                    100+
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">DJ sets</div>
                </div>
                <div>
                  <div className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-3xl font-bold text-transparent">
                    50K+
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">Views</div>
                </div>
                <div>
                  <div className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-3xl font-bold text-transparent">
                    Weekly
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">Events</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/submit-mix"
                  className="text-sm font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Submit a mix for review →
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:h-[600px]">
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 blur-3xl"
                aria-hidden
              />
              <div className="relative aspect-square w-full max-w-md">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent to-accent-secondary opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <Image
                    src="/logo.png"
                    alt="The Listening Room"
                    width={280}
                    height={280}
                    className="h-auto w-full max-w-[220px] object-contain drop-shadow-lg sm:max-w-[260px]"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 flex h-32 w-32 items-center justify-center rounded-2xl border border-white/10 bg-accent-secondary/90 backdrop-blur-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">LIVE</div>
                    <div className="text-xs text-white/70">Now playing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="border-t border-white/10 bg-night-elevated/70 py-14 sm:py-16"
        aria-labelledby="featured-mixes-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="featured-mixes-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Featured DJ mixes
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-300">
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
                  <article className="panel-subtle flex h-full flex-col p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {mix.platform?.trim() ? mix.platform : "Mix"}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
                      {mix.mix_title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-300">{mix.dj_name}</p>
                    <div className="mt-5 mt-auto pt-2">
                      {mix.mix_link?.trim() ? (
                        <a
                          href={mix.mix_link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ui-btn-primary inline-flex items-center justify-center"
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
        className="border-t border-white/10 bg-night/80 py-14 sm:py-16"
        aria-labelledby="featured-videos-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="featured-videos-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Featured videos
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-300">
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
                const youtubeEmbedUrl =
                  platform === "youtube" ? getYouTubeEmbedUrl(video.video_url) : null;
                return (
                  <li key={video.id}>
                    <article className="panel-subtle flex h-full flex-col p-5">
                      {platform === "youtube" && youtubeEmbedUrl ? (
                        <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                          <div className="aspect-video">
                            <iframe
                              src={youtubeEmbedUrl}
                              title={video.title}
                              className="h-full w-full border-0 bg-black"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      ) : video.thumbnail_url?.trim() ? (
                        <div className="mb-4 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.thumbnail_url.trim()}
                            alt={video.title}
                            className="aspect-video w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : null}
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        {video.category?.trim() ? video.category : "Video"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
                        {video.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-400 capitalize">{platform}</p>
                      <div className="mt-5 mt-auto pt-2">
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ui-btn-primary inline-flex items-center justify-center"
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
        className="border-t border-white/10 bg-night-elevated/70 py-14 sm:py-16"
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
            <article className="panel mx-auto mt-8 max-w-2xl p-6 sm:p-7">
              {upcomingEvent.flyer_image_url?.trim() ? (
                <div className="mb-6 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={upcomingEvent.flyer_image_url.trim()}
                    alt={`${upcomingEvent.title} flyer`}
                    className="mx-auto aspect-[9/16] h-auto w-full max-w-sm object-cover"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <time className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                {formatEventDate(upcomingEvent.event_date)}
              </time>
              <h3 className="mt-2 text-2xl font-semibold text-white">{upcomingEvent.title}</h3>
              <p className="mt-2 text-sm font-medium text-zinc-200">{upcomingEvent.location}</p>
              {upcomingEvent.description?.trim() ? (
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {upcomingEvent.description}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {upcomingEvent.rsvp_link?.trim() ? (
                  <a
                    href={upcomingEvent.rsvp_link.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-btn-primary inline-flex items-center justify-center px-5 py-2.5"
                  >
                    RSVP
                  </a>
                ) : null}
                <Link
                  href="/events"
                  className="ui-btn-ghost inline-flex items-center justify-center px-5 py-2.5"
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

      <section className="border-t border-white/10 bg-night/80 py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6">
          <article className="panel-subtle p-6">
            <h2 className="text-2xl font-semibold text-white">Submit your mix</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Send your latest set to The Listening Room team for review.
            </p>
            <Link
              href="/submit-mix"
              className="ui-btn-primary mt-5 inline-flex items-center justify-center px-5 py-2.5"
            >
              Submit mix
            </Link>
          </article>

          <article className="panel-subtle p-6">
            <h2 className="text-2xl font-semibold text-white">Follow us</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Stay tuned for drops, event announcements, and room highlights.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn-ghost inline-flex items-center justify-center px-4 py-2"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn-ghost inline-flex items-center justify-center px-4 py-2"
              >
                YouTube
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn-ghost inline-flex items-center justify-center px-4 py-2"
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
