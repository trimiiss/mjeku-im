-- Keep three weeks of availability ahead: runs every night at 01:10 UTC.
-- The 0.3 prefill makes the demo calendar look busy; use 0 once real practices manage their own calendars.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'mjeku-generate-slots',
  '10 1 * * *',
  $$ select public.generate_slots(21, 0.3); $$
);
