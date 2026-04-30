/** Admin + public visibility; homepage shows `featured` only. */
export const DJ_MIX_STATUSES = ["pending", "approved", "rejected", "featured"] as const;

export type DjMixStatus = (typeof DJ_MIX_STATUSES)[number];

export function isDjMixStatus(value: string): value is DjMixStatus {
  return (DJ_MIX_STATUSES as readonly string[]).includes(value);
}
