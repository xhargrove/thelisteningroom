"use client";

import { deletePhotoPost } from "@/app/actions/admin-dashboard";
import { useTransition } from "react";

export function DeletePhotoButton({
  photoId,
  label,
}: {
  photoId: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) {
          return;
        }
        startTransition(async () => {
          await deletePhotoPost(photoId);
        });
      }}
      className="whitespace-nowrap text-sm font-medium text-red-400/90 hover:text-red-300 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
