import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function FeaturedMixesSection() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data: mixes } = await supabase
    .from("dj_mixes")
    .select("id, dj_name, mix_title, mix_link, platform, created_at")
    .eq("status", "featured")
    .order("created_at", { ascending: false })
    .limit(12);

  if (!mixes?.length) {
    return null;
  }

  return (
    <section
      className="border-t border-accent-dim/25 bg-night-elevated/80 py-14 sm:py-16"
      aria-labelledby="featured-mixes-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="featured-mixes-heading"
          className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Featured mixes
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-400">
          Curated picks from The Listening Room — submit yours for a chance to be featured.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mixes.map((m) => (
            <li key={m.id}>
              <article className="flex h-full flex-col rounded-xl border border-accent-dim/25 bg-night-card/80 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-accent-muted">
                  {m.platform?.trim() ? m.platform : "Mix"}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{m.mix_title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{m.dj_name}</p>
                <div className="mt-5 mt-auto pt-2">
                  {m.mix_link?.trim() ? (
                    <a
                      href={m.mix_link.trim()}
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
      </div>
    </section>
  );
}
