"use client";

import { deleteMix } from "@/app/actions/admin-dashboard";
import { useTransition } from "react";

export function DeleteMixButton({ mixId, label }: { mixId: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete this submission from ${label}? This cannot be undone.`)) {
          return;
        }
        startTransition(async () => {
          await deleteMix(mixId);
        });
      }}
      className="whitespace-nowrap text-sm font-medium text-red-400/90 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
