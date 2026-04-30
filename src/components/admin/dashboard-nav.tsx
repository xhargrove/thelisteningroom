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
          className="shrink-0 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
