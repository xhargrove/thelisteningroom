-- The Listening Room — core tables
-- Apply with Supabase CLI: `supabase db push` or SQL Editor

create table public.emails (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  email text not null,
  role text not null,
  created_at timestamptz not null default now ()
);

create table public.dj_mixes (
  id uuid primary key default gen_random_uuid (),
  dj_name text not null,
  email text not null,
  city text,
  instagram text,
  mix_title text not null,
  mix_link text,
  platform text,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now ()
);

create table public.videos (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  video_url text not null,
  thumbnail_url text,
  category text,
  published boolean not null default false,
  created_at timestamptz not null default now ()
);

create table public.events (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  event_date timestamptz not null,
  location text not null,
  description text,
  rsvp_link text,
  created_at timestamptz not null default now ()
);

comment on
table public.emails is 'Mailing list / contact signups';

comment on
table public.dj_mixes is 'DJ mix submissions';

comment on
table public.videos is 'Video catalog';

comment on
table public.events is 'Events calendar';

-- Row Level Security
alter table public.emails enable row level security;

alter table public.dj_mixes enable row level security;

alter table public.videos enable row level security;

alter table public.events enable row level security;

-- Public site: adjust policies when you add admin auth
create policy "Allow anon insert emails" on public.emails for insert to anon
with
  check (true);

create policy "Allow anon insert dj_mixes" on public.dj_mixes for insert to anon
with
  check (true);

create policy "Allow read published videos" on public.videos for select to anon
using
  (published = true);

create policy "Allow read events" on public.events for select to anon
using
  (true);

create policy "Allow authenticated insert emails" on public.emails for insert to authenticated
with
  check (true);

create policy "Allow authenticated insert dj_mixes" on public.dj_mixes for insert to authenticated
with
  check (true);

create policy "Allow authenticated read published videos" on public.videos for select to authenticated
using
  (published = true);

create policy "Allow authenticated read events" on public.events for select to authenticated
using
  (true);
