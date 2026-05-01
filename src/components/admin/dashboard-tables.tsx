import type { ReactNode } from "react";
import { AddEventForm } from "@/components/admin/add-event-form";
import { AddPhotoForm } from "@/components/admin/add-photo-form";
import { AddVideoForm } from "@/components/admin/add-video-form";
import { MuxUploadForm } from "@/components/admin/mux-upload-form";
import { VideoDeliveryGuidance } from "@/components/admin/video-delivery-guidance";
import { EventEditorRow } from "@/components/admin/event-editor-row";
import { MixEditorRow } from "@/components/admin/mix-editor-row";
import { PhotoEditorRow } from "@/components/admin/photo-editor-row";
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
    return <p className="text-sm text-zinc-400">Nothing here yet.</p>;
  }
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle">{children}</div>
    </div>
  );
}

export function DashboardTables({
  data,
  muxUploadEnabled = false,
}: {
  data: AdminDashboardPayload;
  muxUploadEnabled?: boolean;
}) {
  const { emails, mixes, videos, photos, events } = data;

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
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Email</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
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
        description="Edit any field in the row, then Save. Featured = homepage. Approved and featured are public-readable. Delete spam permanently."
      >
        <TableShell empty={mixes.length === 0}>
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
                <th className="pb-3 pr-3 font-medium">DJ</th>
                <th className="pb-3 pr-3 font-medium">Title</th>
                <th className="pb-3 pr-3 font-medium">Email</th>
                <th className="pb-3 pr-3 font-medium">Mix link</th>
                <th className="pb-3 pr-3 font-medium">City / IG / platform</th>
                <th className="pb-3 pr-3 font-medium">Notes</th>
                <th className="pb-3 pr-3 font-medium">Status</th>
                <th className="pb-3 pr-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {mixes.map((row) => (
                <MixEditorRow key={row.id} mix={row} />
              ))}
            </tbody>
          </table>
        </TableShell>
      </SectionCard>

      <SectionCard
        id="videos"
        title="Video manager"
        description="Edit existing rows in the table (light fields), then Save—scroll the table horizontally to reach Actions. Public /videos shows published items only."
      >
        <div className="space-y-5">
          <VideoDeliveryGuidance />
          <AddVideoForm />
          {muxUploadEnabled ? <MuxUploadForm /> : null}
          <TableShell empty={videos.length === 0}>
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="pb-3 pr-3 font-medium">Title</th>
                  <th className="pb-3 pr-3 font-medium">Video URL</th>
                  <th className="pb-3 pr-3 font-medium">Thumbnail URL</th>
                  <th className="pb-3 pr-3 font-medium">Category</th>
                  <th className="pb-3 pr-3 font-medium">Published</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {videos.map((row) => (
                  <VideoEditorRow key={row.id} video={row} />
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionCard>

      <SectionCard
        id="photos"
        title="Photo manager"
        description="Existing posts are editable in the table—change fields and click Save. Add new posts with the form above. You can save album/share URLs; inline thumbnails require direct image links or file upload."
      >
        <div className="space-y-5">
          <AddPhotoForm />
          <TableShell empty={photos.length === 0}>
            <table className="min-w-[1220px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="pb-3 pr-3 font-medium">Title</th>
                  <th className="pb-3 pr-3 font-medium">Caption</th>
                  <th className="pb-3 pr-3 font-medium">Link</th>
                  <th className="pb-3 pr-3 font-medium">Photo URLs</th>
                  <th className="pb-3 pr-3 font-medium">Published</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {photos.map((row) => (
                  <PhotoEditorRow key={row.id} post={row} />
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionCard>

      <SectionCard
        id="events"
        title="Event manager"
        description="Add, edit, and remove events. Use ↑ / ↓ under Public order so the first upcoming row matches who you want featured on /events (not always earliest date)."
      >
        <div className="space-y-5">
          <AddEventForm />
          <TableShell empty={events.length === 0}>
            <table className="min-w-[1420px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="w-[6.5rem] pb-3 pr-3 font-medium">Public order</th>
                  <th className="pb-3 pr-3 font-medium">When</th>
                  <th className="pb-3 pr-3 font-medium">Title</th>
                  <th className="pb-3 pr-3 font-medium">Location</th>
                  <th className="pb-3 pr-3 font-medium">Description</th>
                  <th className="pb-3 pr-3 font-medium">RSVP link</th>
                  <th className="pb-3 pr-3 font-medium">Flyer (9:16)</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((row, index) => (
                  <EventEditorRow
                    key={row.id}
                    event={row}
                    orderIndex={index}
                    orderTotal={events.length}
                  />
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      </SectionCard>
    </div>
  );
}
