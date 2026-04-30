import type { TableRow } from "@/types/database";

export type EventRow = Pick<
  TableRow<"events">,
  "id" | "title" | "event_date" | "location" | "description" | "rsvp_link" | "flyer_image_url" | "created_at"
>;

/** Monday 00:00 in the event’s local calendar (browser/server local). */
function startOfLocalWeek(d: Date): Date {
  const x = new Date(d.getTime());
  const dayFromMonday = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dayFromMonday);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekKey(iso: string): string {
  const start = startOfLocalWeek(new Date(iso));
  return start.toISOString().slice(0, 10);
}

/** e.g. "Week of May 5, 2026" */
function weekHeadingLabel(iso: string): string {
  const start = startOfLocalWeek(new Date(iso));
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(start);
}

export type EventWeekGroup = {
  weekKey: string;
  weekLabel: string;
  events: EventRow[];
};

/** Groups upcoming events under a stable Monday key, ordered chronologically. */
export function groupEventsByWeek(events: EventRow[]): EventWeekGroup[] {
  const map = new Map<string, EventRow[]>();
  const labels = new Map<string, string>();

  for (const e of events) {
    const key = weekKey(e.event_date);
    if (!map.has(key)) {
      map.set(key, []);
      labels.set(key, weekHeadingLabel(e.event_date));
    }
    map.get(key)!.push(e);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, list]) => ({
      weekKey,
      weekLabel: labels.get(weekKey) ?? weekKey,
      events: list,
    }));
}
