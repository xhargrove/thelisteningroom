-- Public bucket for event flyers (portrait 9:16 JPG/PNG/WebP).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-flyers',
  'event-flyers',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read event flyers" on storage.objects;

create policy "Public read event flyers"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'event-flyers');
