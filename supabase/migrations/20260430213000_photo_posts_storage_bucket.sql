-- Public bucket for photo posts (single images and carousels).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photo-posts',
  'photo-posts',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read photo posts" on storage.objects;

create policy "Public read photo posts"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'photo-posts');
