-- Showcase: twelve weekly Listening Room nights (Saturdays 10:00 PM US/Eastern).
-- Idempotent: safe to re-run after `db reset` or when refreshing demo data.

delete from public.events
where description like '[tlr:weekly-showcase] %';

insert into public.events (title, event_date, location, description, rsvp_link)
select
  case n % 4
    when 0 then 'The Listening Room · House & disco night'
    when 1 then 'The Listening Room · Deep cuts & remix session'
    when 2 then 'The Listening Room · Guest selector showcase'
    else 'The Listening Room · Open decks & community social'
  end,
  (
    ((timezone('America/New_York', now())::date + (14 + n * 7))::timestamp + time '22:00')
    at time zone 'America/New_York'
  ),
  'The Listening Room · Atlanta, GA',
  '[tlr:weekly-showcase] ' ||
    case n % 4
      when 0 then 'Four on the floor, warm subs, and room for dancing.'
      when 1 then 'Long blends and rare pressings—come early for soundcheck.'
      when 2 then 'Extended set plus a short Q&A after—doors at 9:30 PM.'
      else 'Bring a short hello set on USB or pull up to listen—capacity limited.'
    end,
  null
from generate_series(0, 11) as n;
