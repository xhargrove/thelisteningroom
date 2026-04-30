"use client";

import { updateDjMix } from "@/app/actions/admin-dashboard";
import { DeleteMixButton } from "@/components/admin/delete-mix-button";
import { DJ_MIX_STATUSES } from "@/lib/dj-mixes/status";
import { formatAdminDateTime } from "@/lib/admin/format-admin-date";
import type { TableRow } from "@/types/database";
import { useState, useTransition } from "react";

type MixRow = TableRow<"dj_mixes">;

export function MixEditorRow({ mix }: { mix: MixRow }) {
  const [isPending, startTransition] = useTransition();
  const [djName, setDjName] = useState(mix.dj_name);
  const [email, setEmail] = useState(mix.email);
  const [mixTitle, setMixTitle] = useState(mix.mix_title);
  const [mixLink, setMixLink] = useState(mix.mix_link ?? "");
  const [city, setCity] = useState(mix.city ?? "");
  const [instagram, setInstagram] = useState(mix.instagram ?? "");
  const [platform, setPlatform] = useState(mix.platform ?? "");
  const [notes, setNotes] = useState(mix.notes ?? "");
  const [status, setStatus] = useState(mix.status);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const knownStatus = (DJ_MIX_STATUSES as readonly string[]).includes(status);

  return (
    <tr className="text-zinc-300">
      <td className="py-3 pr-3 align-top">
        <input
          value={djName}
          disabled={isPending}
          onChange={(e) => setDjName(e.target.value)}
          className="ui-input w-full min-w-[8rem] px-2 py-1.5 text-sm"
          aria-label="DJ name"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={mixTitle}
          disabled={isPending}
          onChange={(e) => setMixTitle(e.target.value)}
          className="ui-input w-full min-w-[10rem] px-2 py-1.5 text-sm"
          aria-label="Mix title"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={email}
          type="email"
          disabled={isPending}
          onChange={(e) => setEmail(e.target.value)}
          className="ui-input w-full min-w-[11rem] px-2 py-1.5 text-sm"
          aria-label="Submitter email"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <input
          value={mixLink}
          disabled={isPending}
          onChange={(e) => setMixLink(e.target.value)}
          placeholder="https://…"
          className="ui-input w-full min-w-[12rem] px-2 py-1.5 text-sm"
          aria-label="Mix link"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <div className="flex min-w-[9rem] flex-col gap-2">
          <input
            value={city}
            disabled={isPending}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="ui-input w-full px-2 py-1.5 text-sm"
            aria-label="City"
          />
          <input
            value={instagram}
            disabled={isPending}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram"
            className="ui-input w-full px-2 py-1.5 text-sm"
            aria-label="Instagram"
          />
          <input
            value={platform}
            disabled={isPending}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Platform"
            className="ui-input w-full px-2 py-1.5 text-sm"
            aria-label="Platform"
          />
        </div>
      </td>
      <td className="py-3 pr-3 align-top">
        <textarea
          value={notes}
          disabled={isPending}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes"
          className="ui-input w-full min-w-[10rem] px-2 py-1.5 text-sm"
          aria-label="Notes"
        />
      </td>
      <td className="py-3 pr-3 align-top">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => setStatus(e.target.value)}
          className="ui-input w-full min-w-[8.5rem] px-2 py-1.5 text-sm capitalize disabled:opacity-50 sm:w-auto"
          aria-label="Mix status"
        >
          {!knownStatus ? (
            <option value={status} className="bg-night-card">
              {status}
            </option>
          ) : null}
          {DJ_MIX_STATUSES.map((opt) => (
            <option key={opt} value={opt} className="bg-night-card capitalize">
              {opt}
            </option>
          ))}
        </select>
      </td>
      <td className="whitespace-nowrap py-3 pr-3 align-top text-zinc-500">
        {formatAdminDateTime(mix.created_at)}
      </td>
      <td className="py-3 align-top">
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                const payload = new FormData();
                payload.set("id", mix.id);
                payload.set("dj_name", djName);
                payload.set("email", email);
                payload.set("mix_title", mixTitle);
                payload.set("mix_link", mixLink);
                payload.set("city", city);
                payload.set("instagram", instagram);
                payload.set("platform", platform);
                payload.set("notes", notes);
                payload.set("status", status);

                setMessage(null);
                setIsError(false);

                startTransition(async () => {
                  const result = await updateDjMix(payload);
                  if (result.ok) {
                    setMessage("Saved");
                    setIsError(false);
                    return;
                  }
                  setMessage(result.message ?? "Save failed");
                  setIsError(true);
                });
              }}
              className="ui-btn-ghost whitespace-nowrap px-3 py-1.5 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <DeleteMixButton mixId={mix.id} label={djName || mix.dj_name} />
          </div>
          {message ? (
            <p className={`text-right text-xs ${isError ? "text-red-300" : "text-emerald-300"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
