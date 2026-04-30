-- Anonymous + logged-in visitors may read rows surfaced publicly (homepage / future listings).
create policy "Public read approved or featured dj_mixes" on public.dj_mixes for select using (
  status in ('approved', 'featured')
);

-- Spam cleanup (admins only)
create policy "Admins delete dj_mixes" on public.dj_mixes for delete to authenticated using (
  (auth.jwt () -> 'app_metadata' ->> 'role') = 'admin'
);
