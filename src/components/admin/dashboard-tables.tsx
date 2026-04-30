import type { ReactNode } from "react";
import { AddEventForm } from "@/components/admin/add-event-form";
import { AddVideoForm } from "@/components/admin/add-video-form";
import { DeleteMixButton } from "@/components/admin/delete-mix-button";
import { EventEditorRow } from "@/components/admin/event-editor-row";
import { MixStatusSelect } from "@/components/admin/mix-status-select";
import { VideoEditorRow } from "@/components/admin/video-editor-row";
import { SectionCard } from "@/components/admin/section-card";
import { formatAdminDateTime } from "@/lib/admin/format-admin-date";
import type { AdminDashboardPayload } from "@/lib/admin/load-dashboard";

function TableShell({
  children,
  empty,
}: {
  children: ReactNode;
  empty: boolean;
}) {
  if (empty) {
    return <p className="text-sm text-zinc-500">Nothing here yet.</p>;
  }
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle">{children}</div>
    </div>
  );
}

export function DashboardTables({ data }: { data: AdminDashboardPayload }) {
  const { emails, mixes, videos, events } = data;

  return (
    <div className="mt-10 flex flex-col gap-10">
      <SectionCard
        id="emails"
        title="Email list"
        description="Newsletter and signup addresses."
      >
        <TableShell empty={emails.length === 0}>
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-accent-dim/20 text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-dim/15">
              {emails.map((row) => (
                <tr key={row.id} className="text-zinc-300">
                  <td className="py-3 pr-4 align-top">{row.name}</td>
                  <td className="py-3 pr-4 align-top">
                    <a href={`mailto:${row.email}`} className="text-accent hover:underline">
                      {row.email}
                    </a>
                  </td>
                  <td className="py-3 pr-4 align-top">{row.role}</td>
                  <td className="whitespace-nowrap py-3 align-top text-zinc-500">
                    {formatAdminDateTime(row.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </SectionCard>

      <SectionCard
        id="mixes"
        title="DJ mix submissions"
        description="Featured = shown on the homepage. Approved and featured are readable on future public mix pages. Delete spam rows permanently."
      >
        <TableShell empty={mixes.length === 0}>
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-accent-dim/20 text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-3 pr-4 font-medium">DJ</th>
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Mix link</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Submitted</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-dim/15">
              {mixes.map((row) => (
                <tr key={row.id} className="text-zinc-300">
                  <td className="py-3 pr-4 align-top">{row.dj_name}</td>
                  <td className="max-w-[180px] py-3 pr-4 align-top">
                    <span className="line-clamp-2">{row.mix_title}</span>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <a href={`mailto:${row.email}`} className="text-accent hover:underline">
                      {row.email}
                    </a>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    {row.mix_link?.trim() ? (
                      <a
                        href={row.mix_link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <MixStatusSelect mixId={row.id} value={row.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 align-top text-zinc-500">
                    {formatAdminDateTime(row.created_at)}
                  </td>
                  <td className="py-3 align-top text-right">
                    <DeleteMixButton mixId={row.id} label={row.dj_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      </SectionCard>

      <SectionCard
        id="videos"
        title="Video manager"
        description="Add, edit, publish/unpublish, and delete videos. The public /videos page reflects published status."
      >
        <div className="space-y-5">
          <AddVideoForm />
          <TableShell empty={videos.length === 0}>
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-accent-dim/20 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-3 pr-3 font-medium">Title</th>
                  <th className="pb-3 pr-3 font-medium">Video URL</th>
                  <th className="pb-3 pr-3 font-medium">Thumbnail URL</th>
                  <th className="pb-3 pr-3 font-medium">Category</th>
                  <th className="pb-3 pr-3 font-medium">Published</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-dim/15">
                {videos.map((row) => (
                  <VideoEditorRow key={row.id} video={row} />
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionCard>

      <SectionCard
        id="events"
        title="Event manager"
        description="Add, edit, and remove events. Public /events updates from the database."
      >
        <div className="space-y-5">
          <AddEventForm />
          <TableShell empty={events.length === 0}>
            <table className="min-w-[1160px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-accent-dim/20 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="pb-3 pr-3 font-medium">When</th>
                  <th className="pb-3 pr-3 font-medium">Title</th>
                  <th className="pb-3 pr-3 font-medium">Location</th>
                  <th className="pb-3 pr-3 font-medium">Description</th>
                  <th className="pb-3 pr-3 font-medium">RSVP link</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-dim/15">
                {events.map((row) => (
                  <EventEditorRow key={row.id} event={row} />
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionCard>
    </div>
  );
}
