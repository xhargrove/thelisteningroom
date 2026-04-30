"use client";

import { setMixStatus } from "@/app/actions/admin-dashboard";
import { DJ_MIX_STATUSES } from "@/lib/dj-mixes/status";
import { useTransition } from "react";

export function MixStatusSelect({ mixId, value }: { mixId: string; value: string }) {
  const [isPending, startTransition] = useTransition();

  const known = (DJ_MIX_STATUSES as readonly string[]).includes(value);

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await setMixStatus(mixId, next);
        });
      }}
      className="ui-input w-full min-w-[8.5rem] px-2 py-1.5 text-sm disabled:opacity-50 sm:w-auto"
      aria-label="Mix status"
    >
      {!known ? (
        <option value={value} className="bg-night-card">
          {value}
        </option>
      ) : null}
      {DJ_MIX_STATUSES.map((opt) => (
        <option key={opt} value={opt} className="bg-night-card capitalize">
          {opt}
        </option>
      ))}
    </select>
  );
}
