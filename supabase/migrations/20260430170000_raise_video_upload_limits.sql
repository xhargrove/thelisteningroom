-- Raise cap for long-form DJ sets (~hours) when exported as multi‑GB files.
-- Keep aligned with VIDEO_UPLOAD_MAX_BYTES in src/lib/videos/upload-limits.ts (15 GiB).

update storage.buckets
set file_size_limit = 16106127360
where id = 'video-uploads';
