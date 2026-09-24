-- Specialty and search pages: the first free slot of each practitioner,
-- used for the "available within N days" filter and to sort results by availability.

create or replace function public.next_free_slots()
returns table (practitioner_id text, starts_at timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select s.practitioner_id, min(s.starts_at)
  from public.slots s
  where not s.is_booked
    and s.starts_at > now() + interval '15 minutes'
  group by s.practitioner_id;
$$;

revoke all on function public.next_free_slots() from public;
grant execute on function public.next_free_slots() to anon, authenticated;
