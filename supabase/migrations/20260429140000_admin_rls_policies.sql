-- Admin access via JWT: auth.users raw_app_meta_data.role = 'admin' appears on JWT as app_metadata.role
-- Used by RLS so the anon key + logged-in admin session can query/manage rows.

create policy "Admins select all emails" on public.emails for select to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins select all dj_mixes" on public.dj_mixes for select to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins update dj_mixes" on public.dj_mixes for update to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
)
with
  check ((auth.jwt () -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins select all videos" on public.videos for select to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins insert videos" on public.videos for insert to authenticated with check (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins update videos" on public.videos for update to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
)
with
  check ((auth.jwt () -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete videos" on public.videos for delete to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins select all events" on public.events for select to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins insert events" on public.events for insert to authenticated with check (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "Admins update events" on public.events for update to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
)
with
  check ((auth.jwt () -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete events" on public.events for delete to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);
