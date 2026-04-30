import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-night-elevated/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} The Listening Room
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/events" className="transition hover:text-white">
            Events
          </Link>
          <Link href="/submit-mix" className="transition hover:text-white">
            Submit mix
          </Link>
        </div>
      </div>
    </footer>
  );
}
