-- Mjeku.Im: directory, availability and guest bookings.
-- Times are stored as timestamptz and shown in Kosovo local time (CET/CEST).
-- 'Europe/Tirane' is used as the zone name; it has the same rules as Kosovo.

create type public.visit_mode as enum ('in_person', 'video');
create type public.booking_status as enum ('confirmed', 'cancelled');

-- ---------- Directory ----------

create table public.cities (
  id text primary key,
  name_sq text not null,
  name_en text not null,
  aliases text not null default '',
  sort int not null default 100
);

create table public.specialties (
  id text primary key,
  name_sq text not null,
  name_sq_f text not null,
  name_en text not null,
  keywords text not null default '',
  sort int not null default 100
);

create table public.clinics (
  id text primary key,
  name text not null,
  type text not null,
  city_id text not null references public.cities (id),
  neighborhood text
);
create index clinics_city_id_idx on public.clinics (city_id);

create table public.practitioners (
  id text primary key,
  title text not null default '',
  full_name text not null,
  gender text check (gender in ('f', 'm')),
  specialty_id text not null references public.specialties (id),
  clinic_id text not null references public.clinics (id),
  languages text[] not null default '{sq}',
  offers_video boolean not null default false,
  open_saturday boolean not null default false,
  price_eur int check (price_eur >= 0),
  price_from boolean not null default false,
  duration_min int not null default 20 check (duration_min between 5 and 180),
  featured boolean not null default false,
  active boolean not null default true
);
create index practitioners_specialty_id_idx on public.practitioners (specialty_id);
create index practitioners_clinic_id_idx on public.practitioners (clinic_id);

-- Weekly opening hours (ISO weekday: 1 = Monday ... 7 = Sunday).
create table public.schedules (
  id bigint generated always as identity primary key,
  practitioner_id text not null references public.practitioners (id) on delete cascade,
  weekday int not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  slot_min int not null check (slot_min between 5 and 180)
);
create index schedules_practitioner_id_idx on public.schedules (practitioner_id);

-- ---------- Availability ----------

create table public.slots (
  id bigint generated always as identity primary key,
  practitioner_id text not null references public.practitioners (id) on delete cascade,
  starts_at timestamptz not null,
  duration_min int not null,
  is_booked boolean not null default false,
  unique (practitioner_id, starts_at)
);
create index slots_free_starts_at_idx on public.slots (starts_at) where not is_booked;

-- ---------- Bookings (personal data: no direct API access) ----------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slot_id bigint not null references public.slots (id),
  practitioner_id text not null references public.practitioners (id),
  starts_at timestamptz not null,
  mode public.visit_mode not null default 'in_person',
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  note text,
  locale text not null default 'sq',
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);
create unique index bookings_one_confirmed_per_slot on public.bookings (slot_id) where status = 'confirmed';
create index bookings_slot_id_idx on public.bookings (slot_id);
create index bookings_practitioner_id_idx on public.bookings (practitioner_id);
create index bookings_starts_at_idx on public.bookings (starts_at);

-- ---------- Row level security ----------

alter table public.cities enable row level security;
alter table public.specialties enable row level security;
alter table public.clinics enable row level security;
alter table public.practitioners enable row level security;
alter table public.schedules enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;

create policy "Anyone can read cities" on public.cities for select to anon, authenticated using (true);
create policy "Anyone can read specialties" on public.specialties for select to anon, authenticated using (true);
create policy "Anyone can read clinics" on public.clinics for select to anon, authenticated using (true);
create policy "Anyone can read active practitioners" on public.practitioners for select to anon, authenticated using (active);
create policy "Anyone can read upcoming slots" on public.slots for select to anon, authenticated using (starts_at > now());

-- Schedules and bookings have no policies on purpose: the API cannot read or write them.
-- Bookings are only reachable through the functions below.
revoke all on public.bookings from anon, authenticated;
revoke all on public.schedules from anon, authenticated;
revoke insert, update, delete, truncate on public.cities, public.specialties, public.clinics, public.practitioners, public.slots from anon, authenticated;

-- ---------- Functions ----------

-- Free slots for the next p_days days, at most p_per_day per practitioner per day.
create or replace function public.free_slots(p_days int default 4, p_per_day int default 8)
returns table (id bigint, practitioner_id text, starts_at timestamptz, duration_min int)
language sql
stable
security invoker
set search_path = ''
as $$
  select x.id, x.practitioner_id, x.starts_at, x.duration_min
  from (
    select s.id, s.practitioner_id, s.starts_at, s.duration_min,
           row_number() over (
             partition by s.practitioner_id, (s.starts_at at time zone 'Europe/Tirane')::date
             order by s.starts_at
           ) as rn
    from public.slots s
    where not s.is_booked
      and s.starts_at > now() + interval '15 minutes'
      and s.starts_at < (date_trunc('day', now() at time zone 'Europe/Tirane')
                         + make_interval(days => least(greatest(p_days, 1), 14))) at time zone 'Europe/Tirane'
  ) x
  where x.rn <= least(greatest(p_per_day, 1), 24)
  order by x.starts_at;
$$;

-- Creates slots from the weekly schedules for the coming p_days days and removes old unused ones.
-- p_prefill marks a share of new slots as taken, so the demo looks like a real, busy calendar.
create or replace function public.generate_slots(p_days int default 21, p_prefill numeric default 0)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  delete from public.slots s
  where s.starts_at < now() - interval '2 days'
    and not exists (select 1 from public.bookings b where b.slot_id = s.id);

  with days as (
    select ((now() at time zone 'Europe/Tirane')::date + g)::date as d
    from generate_series(0, p_days) g
  ),
  sched as (
    select sc.practitioner_id, sc.slot_min, sc.start_time, sc.end_time, d.d
    from public.schedules sc
    join public.practitioners p on p.id = sc.practitioner_id and p.active
    join days d on extract(isodow from d.d)::int = sc.weekday
  ),
  times as (
    select practitioner_id, slot_min,
           generate_series(d + start_time, d + end_time - make_interval(mins => slot_min), make_interval(mins => slot_min)) as local_ts
    from sched
  ),
  ins as (
    insert into public.slots (practitioner_id, starts_at, duration_min, is_booked)
    select practitioner_id, local_ts at time zone 'Europe/Tirane', slot_min, random() < p_prefill
    from times
    where local_ts at time zone 'Europe/Tirane' > now()
    on conflict (practitioner_id, starts_at) do nothing
    returning 1
  )
  select count(*) into v_count from ins;

  return v_count;
end;
$$;

-- Books a free slot as a guest. Returns the booking code.
create or replace function public.book_slot(
  p_slot_id bigint,
  p_name text,
  p_phone text,
  p_email text default null,
  p_mode public.visit_mode default 'in_person',
  p_note text default null,
  p_locale text default 'sq'
)
returns table (code text, starts_at timestamptz, practitioner_id text, mode public.visit_mode)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_slot public.slots%rowtype;
  v_pr public.practitioners%rowtype;
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_digits text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_active int;
  v_code text;
begin
  if char_length(v_name) < 3 or char_length(v_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if v_phone !~ '^\+?[0-9]{8,15}$' then
    raise exception 'invalid_phone';
  end if;
  if v_email is not null and (char_length(v_email) > 120 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'invalid_email';
  end if;
  if v_note is not null and char_length(v_note) > 300 then
    raise exception 'invalid_note';
  end if;

  select * into v_slot from public.slots s where s.id = p_slot_id for update;
  if not found or v_slot.is_booked or v_slot.starts_at < now() + interval '15 minutes' then
    raise exception 'slot_unavailable';
  end if;

  select * into v_pr from public.practitioners p where p.id = v_slot.practitioner_id and p.active;
  if not found then
    raise exception 'slot_unavailable';
  end if;
  if p_mode = 'video' and not v_pr.offers_video then
    raise exception 'video_unavailable';
  end if;

  -- At most 3 upcoming bookings per phone number.
  select count(*) into v_active
  from public.bookings b
  where b.status = 'confirmed'
    and b.starts_at > now()
    and right(regexp_replace(b.patient_phone, '[^0-9]', '', 'g'), 8) = right(v_digits, 8);
  if v_active >= 3 then
    raise exception 'too_many_bookings';
  end if;

  loop
    select 'MJK-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (get_byte(r.b, i) % 32) + 1, 1), '' order by i)
      into v_code
    from (select extensions.gen_random_bytes(6) as b) r, generate_series(0, 5) i;
    exit when not exists (select 1 from public.bookings b where b.code = v_code);
  end loop;

  update public.slots s set is_booked = true where s.id = v_slot.id;

  insert into public.bookings (code, slot_id, practitioner_id, starts_at, mode, patient_name, patient_phone, patient_email, note, locale)
  values (v_code, v_slot.id, v_slot.practitioner_id, v_slot.starts_at, p_mode, v_name, v_phone, v_email, v_note,
          case when p_locale = 'en' then 'en' else 'sq' end);

  return query select v_code, v_slot.starts_at, v_slot.practitioner_id, p_mode;
end;
$$;

-- Looks up a booking by its code and the phone number used to book it.
create or replace function public.find_booking(p_code text, p_phone text)
returns table (
  code text,
  status public.booking_status,
  starts_at timestamptz,
  mode public.visit_mode,
  patient_name text,
  practitioner_id text,
  can_cancel boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.code, b.status, b.starts_at, b.mode, b.patient_name, b.practitioner_id,
         (b.status = 'confirmed' and b.starts_at > now() + interval '2 hours') as can_cancel
  from public.bookings b
  where b.code = upper(btrim(coalesce(p_code, '')))
    and char_length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) >= 8
    and right(regexp_replace(b.patient_phone, '[^0-9]', '', 'g'), 8)
      = right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 8)
  limit 1;
$$;

-- Cancels a booking (up to 2 hours before it starts) and frees the slot.
create or replace function public.cancel_booking(p_code text, p_phone text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.bookings%rowtype;
begin
  select * into v
  from public.bookings b
  where b.code = upper(btrim(coalesce(p_code, '')))
    and char_length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) >= 8
    and right(regexp_replace(b.patient_phone, '[^0-9]', '', 'g'), 8)
      = right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 8)
  for update;

  if not found then
    raise exception 'not_found';
  end if;
  if v.status <> 'confirmed' then
    raise exception 'already_cancelled';
  end if;
  if v.starts_at <= now() + interval '2 hours' then
    raise exception 'too_late';
  end if;

  update public.bookings set status = 'cancelled', cancelled_at = now() where id = v.id;
  update public.slots set is_booked = false where id = v.slot_id;
  return true;
end;
$$;

-- Only the booking functions and free_slots are callable from the website.
revoke all on function public.free_slots(int, int) from public;
revoke all on function public.generate_slots(int, numeric) from public, anon, authenticated;
revoke all on function public.book_slot(bigint, text, text, text, public.visit_mode, text, text) from public;
revoke all on function public.find_booking(text, text) from public;
revoke all on function public.cancel_booking(text, text) from public;

grant execute on function public.free_slots(int, int) to anon, authenticated;
grant execute on function public.book_slot(bigint, text, text, text, public.visit_mode, text, text) to anon, authenticated;
grant execute on function public.find_booking(text, text) to anon, authenticated;
grant execute on function public.cancel_booking(text, text) to anon, authenticated;
