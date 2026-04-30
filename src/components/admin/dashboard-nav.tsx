const links = [
  { href: "#emails", label: "Emails" },
  { href: "#mixes", label: "Mixes" },
  { href: "#videos", label: "Videos" },
  { href: "#photos", label: "Photos" },
  { href: "#events", label: "Events" },
];

export function DashboardNav() {
  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Dashboard sections"
    >
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="shrink-0 rounded-full border border-accent-dim/35 bg-night-card/80 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-accent/50 hover:text-accent"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
