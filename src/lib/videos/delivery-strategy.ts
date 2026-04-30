/**
 * Codified delivery options for “YouTube-like” adaptive streaming vs raw hosting.
 * Used by admin UI copy only — not enforced at runtime.
 */
export const VIDEO_DELIVERY_STRATEGY = {
  /** Compress/export locally before upload (HandBrake, DaVinci, etc.). */
  preExport: {
    id: "pre-export",
    title: "Export smaller files locally",
    summary:
      "Encode to a target bitrate/resolution before upload. Full control, no extra vendor.",
  },
  /** Paste playback URLs from YouTube, Vimeo, or any embed-friendly link (existing “Add video” form). */
  hostedUrl: {
    id: "hosted-url",
    title: "Hosted streaming URL",
    summary:
      "YouTube, Vimeo, Mux, Cloudflare Stream, etc. They transcode to adaptive HLS and eat viewer bandwidth cost.",
  },
  /** Raw file in Supabase Storage — good for simple hosting; not adaptive like YouTube. */
  supabaseStorage: {
    id: "supabase-storage",
    title: "Upload to Supabase Storage",
    summary:
      "Direct files on your bucket — fine for short clips; long HD sets are large and egress adds up.",
  },
  /** Optional: Mux direct upload when MUX_TOKEN_ID / MUX_TOKEN_SECRET are set. */
  muxDirect: {
    id: "mux-direct",
    title: "Mux adaptive encoding (optional)",
    summary:
      "Upload goes to Mux; they produce adaptive streams and we store the Mux player URL in your database.",
  },
} as const;
