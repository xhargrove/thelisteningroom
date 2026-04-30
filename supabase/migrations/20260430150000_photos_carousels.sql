create table public.photos (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  caption text,
  link_url text,
  media_urls jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now (),
  constraint photos_media_urls_array check (jsonb_typeof(media_urls) = 'array'),
  constraint photos_media_urls_nonempty check (jsonb_array_length(media_urls) > 0)
);

comment on table public.photos is 'Photo posts with optional outbound link and multi-image carousel';

create index photos_published_created_at_idx on public.photos (published, created_at desc);

alter table public.photos enable row level security;

create policy "Allow read published photos" on public.photos for select to anon using (published = true);

create policy "Allow authenticated read published photos" on public.photos for select to authenticated
using (published = true);

create policy "Admins select all photos" on public.photos for select to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins insert photos" on public.photos for insert to authenticated with check (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins update photos" on public.photos for update to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
)
with
  check ((auth.jwt () -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete photos" on public.photos for delete to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);
