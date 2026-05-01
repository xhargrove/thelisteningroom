-- Manual ordering for upcoming events on /events (featured card is first row).
alter table public.events
add column if not exists sort_order integer not null default 0;

comment on column public.events.sort_order is 'Lower values appear first among upcoming events on the public calendar; ties use event_date.';
