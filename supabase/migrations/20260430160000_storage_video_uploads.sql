-- Public bucket for uploaded video files (playback via public object URL).
-- Uploads are initiated server-side with the service role (signed upload URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video-uploads',
  'video-uploads',
  true,
  524288000,
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read video uploads" on storage.objects;

create policy "Public read video uploads"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'video-uploads');
