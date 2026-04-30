type Stats = {
  totalEmails: number;
  totalMixes: number;
  pendingMixes: number;
  featuredMixes: number;
  publishedVideos: number;
  publishedPhotos: number;
  upcomingEvents: number;
};

const items: { key: keyof Stats; label: string }[] = [
  { key: "totalEmails", label: "Emails collected" },
  { key: "totalMixes", label: "DJ mix submissions" },
  { key: "pendingMixes", label: "Pending mixes" },
  { key: "featuredMixes", label: "Featured (homepage)" },
  { key: "publishedVideos", label: "Published videos" },
  { key: "publishedPhotos", label: "Published photos" },
  { key: "upcomingEvents", label: "Upcoming events" },
];

export function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {items.map(({ key, label }) => (
        <li
          key={key}
          className="rounded-xl border border-accent-dim/30 bg-night-card/90 px-4 py-4 text-center sm:px-5 sm:text-left"
        >
          <p className="text-2xl font-bold tabular-nums text-accent sm:text-3xl">{stats[key]}</p>
          <p className="mt-1 text-xs leading-snug text-zinc-400">{label}</p>
        </li>
      ))}
    </ul>
  );
}
