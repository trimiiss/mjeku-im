-- Practitioner accounts: a doctor signs up (Supabase Auth), fills in their profile, practice and opening hours,
-- appears on the site and sees the bookings patients make. Everything goes through the functions below;
-- the tables stay read-only for the website, like bookings.

alter table public.clinics
  add column address text,
  add column phone text,
  add column website text;

alter table public.practitioners
  add column self_registered boolean not null default false,
  -- Set by Mjeku.Im (in the table editor) once a self-registered practitioner is checked.
  add column verified boolean not null default false,
  add column about text check (char_length(about) <= 1500),
  -- The listed practice this profile says it is. Once verified, the listing is hidden in favour of the profile.
  add column listed_practice_id text references public.listed_practices (id) on delete set null;

-- Which login owns which profile. No API access at all.
create table public.accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  practitioner_id text not null unique references public.practitioners (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security;
revoke all on public.accounts from anon, authenticated;

-- Listed practices without a verified profile that replaces them.
create view public.open_listed_practices with (security_invoker = true) as
  select lp.id, lp.name, lp.kind, lp.sector, lp.specialty_ids, lp.city_id, lp.neighborhood, lp.address,
         lp.phone, lp.website, lp.lat, lp.lng, lp.checked_on
  from public.listed_practices lp
  where lp.active
    and not exists (
      select 1 from public.practitioners p where p.listed_practice_id = lp.id and p.active and p.verified
    );
grant select on public.open_listed_practices to anon, authenticated;

-- ---------- Slots ----------

-- Creates slots from the weekly schedules for the coming p_days days, for everyone or one practitioner
-- (used when they save their opening hours). Self-registered practitioners never get demo "taken" slots.
create function public.fill_slots(p_days int, p_prefill numeric, p_practitioner_id text default null)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  with days as (
    select ((now() at time zone 'Europe/Tirane')::date + g)::date as d
    from generate_series(0, p_days) g
  ),
  sched as (
    select sc.practitioner_id, sc.slot_min, sc.start_time, sc.end_time, d.d, p.self_registered
    from public.schedules sc
    join public.practitioners p on p.id = sc.practitioner_id and p.active
    join days d on extract(isodow from d.d)::int = sc.weekday
    where p_practitioner_id is null or sc.practitioner_id = p_practitioner_id
  ),
  times as (
    select practitioner_id, slot_min, self_registered,
           generate_series(d + start_time, d + end_time - make_interval(mins => slot_min), make_interval(mins => slot_min)) as local_ts
    from sched
  ),
  ins as (
    insert into public.slots (practitioner_id, starts_at, duration_min, is_booked)
    select practitioner_id, local_ts at time zone 'Europe/Tirane', slot_min, not self_registered and random() < p_prefill
    from times
    where local_ts at time zone 'Europe/Tirane' > now()
    on conflict (practitioner_id, starts_at) do nothing
    returning 1
  )
  select count(*) into v_count from ins;

  return v_count;
end;
$$;

-- The nightly job: remove old unused slots, then fill the next p_days days. Same signature as before.
create or replace function public.generate_slots(p_days int default 21, p_prefill numeric default 0)
returns int
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.slots s
  where s.starts_at < now() - interval '2 days'
    and not exists (select 1 from public.bookings b where b.slot_id = s.id);

  return public.fill_slots(p_days, p_prefill);
end;
$$;

revoke all on function public.fill_slots(int, numeric, text) from public, anon, authenticated;

-- ---------- The signed-in practitioner's own profile ----------

-- Their profile, practice and opening hours, or null before they first save.
create function public.my_profile()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'practitioner', to_jsonb(p) - 'featured',
    'clinic', to_jsonb(c),
    'hours', coalesce((
      select jsonb_agg(jsonb_build_object('weekday', s.weekday, 'start', to_char(s.start_time, 'HH24:MI'), 'end', to_char(s.end_time, 'HH24:MI'))
                       order by s.weekday, s.start_time)
      from public.schedules s
      where s.practitioner_id = p.id
    ), '[]'::jsonb)
  )
  from public.accounts a
  join public.practitioners p on p.id = a.practitioner_id
  join public.clinics c on c.id = p.clinic_id
  where a.user_id = (select auth.uid());
$$;

-- Creates or updates their profile. Errors are codes the website translates (invalid_name, invalid_phone, ...).
create function public.save_my_profile(p_profile jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  pr jsonb := coalesce(p_profile -> 'practitioner', '{}'::jsonb);
  cl jsonb := coalesce(p_profile -> 'clinic', '{}'::jsonb);
  hrs jsonb := coalesce(p_profile -> 'hours', '[]'::jsonb);
  v_title text := btrim(coalesce(pr ->> 'title', ''));
  v_name text := btrim(regexp_replace(coalesce(pr ->> 'full_name', ''), '\s+', ' ', 'g'));
  v_gender text := pr ->> 'gender';
  v_specialty text := pr ->> 'specialty_id';
  v_languages text[];
  v_price text := nullif(btrim(coalesce(pr ->> 'price_eur', '')), '');
  v_duration text := coalesce(pr ->> 'duration_min', '');
  v_years text := nullif(btrim(coalesce(pr ->> 'years_experience', '')), '');
  v_about text := nullif(btrim(coalesce(pr ->> 'about', '')), '');
  v_listed text := nullif(btrim(coalesce(p_profile ->> 'listed_practice_id', '')), '');
  v_active boolean := coalesce(p_profile ->> 'published', 'false') = 'true';
  v_cname text := btrim(regexp_replace(coalesce(cl ->> 'name', ''), '\s+', ' ', 'g'));
  v_ctype text := cl ->> 'type';
  v_city text := cl ->> 'city_id';
  v_hood text := nullif(btrim(coalesce(cl ->> 'neighborhood', '')), '');
  v_address text := nullif(btrim(coalesce(cl ->> 'address', '')), '');
  v_postal text := nullif(btrim(coalesce(cl ->> 'postal_code', '')), '');
  v_phone text := nullif(btrim(coalesce(cl ->> 'phone', '')), '');
  v_website text := nullif(btrim(coalesce(cl ->> 'website', '')), '');
  v_lat double precision;
  v_lng double precision;
  v_pid text;
  v_cid text;
  v_base text;
  v_n int := 1;
begin
  if v_uid is null then
    raise exception 'not_signed_in';
  end if;

  if v_title not in ('', 'Dr.', 'Dr. sc.', 'Mr. sc.', 'Prof. Dr.', 'Prof. Asoc. Dr.') then
    raise exception 'invalid_title';
  end if;
  if char_length(v_name) < 3 or char_length(v_name) > 80 then
    raise exception 'invalid_name';
  end if;
  if v_gender is null or v_gender not in ('f', 'm') then
    raise exception 'invalid_gender';
  end if;
  if not exists (select 1 from public.specialties s where s.id = v_specialty) then
    raise exception 'invalid_specialty';
  end if;
  if jsonb_typeof(pr -> 'languages') is distinct from 'array' then
    raise exception 'invalid_languages';
  end if;
  select coalesce(array_agg(distinct x), '{}') into v_languages from jsonb_array_elements_text(pr -> 'languages') x;
  if cardinality(v_languages) = 0 or not v_languages <@ array['sq', 'en', 'de', 'it', 'tr', 'sr'] then
    raise exception 'invalid_languages';
  end if;
  -- CASE so the casts only run on values that passed the format check.
  if v_price is not null and case when v_price ~ '^\d{1,4}$' then v_price::int > 2000 else true end then
    raise exception 'invalid_price';
  end if;
  if v_duration not in ('10', '15', '20', '30', '45', '60', '90') then
    raise exception 'invalid_duration';
  end if;
  if v_years is not null and case when v_years ~ '^\d{1,2}$' then v_years::int > 60 else true end then
    raise exception 'invalid_experience';
  end if;
  if char_length(v_about) > 1500 then
    raise exception 'invalid_about';
  end if;

  if char_length(v_cname) < 2 or char_length(v_cname) > 100 then
    raise exception 'invalid_clinic_name';
  end if;
  if v_ctype is null or v_ctype not in ('polyclinic', 'practice', 'dental', 'pediatric', 'physio', 'psychology', 'eye', 'lab', 'nutrition', 'family_center', 'hospital') then
    raise exception 'invalid_clinic_type';
  end if;
  if not exists (select 1 from public.cities c where c.id = v_city) then
    raise exception 'invalid_city';
  end if;
  if char_length(v_hood) > 60 or char_length(v_address) > 120 then
    raise exception 'invalid_address';
  end if;
  if v_postal is not null and v_postal !~ '^\d{5}$' then
    raise exception 'invalid_postal_code';
  end if;
  if v_phone is not null and (v_phone !~ '^\+?[0-9 ()/-]{8,22}$'
      or char_length(regexp_replace(v_phone, '[^0-9]', '', 'g')) not between 8 and 15) then
    raise exception 'invalid_phone';
  end if;
  if v_website is not null and (char_length(v_website) > 200 or v_website !~ '^https?://[^\s/$.?#][^\s]*$') then
    raise exception 'invalid_website';
  end if;

  -- Opening hours: at most one range per weekday, on a 5-minute grid, between 05:00 and 23:30.
  if jsonb_typeof(hrs) is distinct from 'array' then
    raise exception 'invalid_hours';
  end if;
  if jsonb_array_length(hrs) > 7 or exists (
    select 1 from jsonb_array_elements(hrs) x
    where case
      when jsonb_typeof(x) <> 'object'
        or coalesce(x ->> 'weekday', '') !~ '^[1-7]$'
        or coalesce(x ->> 'start', '') !~ '^([01]\d|2[0-3]):[0-5][05]$'
        or coalesce(x ->> 'end', '') !~ '^([01]\d|2[0-3]):[0-5][05]$' then true
      else (x ->> 'start')::time < '05:00' or (x ->> 'end')::time > '23:30'
        or (x ->> 'end')::time < (x ->> 'start')::time + make_interval(mins => v_duration::int)
    end
  ) or (select count(distinct x ->> 'weekday') from jsonb_array_elements(hrs) x) <> jsonb_array_length(hrs) then
    raise exception 'invalid_hours';
  end if;

  if v_listed is not null then
    select lp.lat, lp.lng into v_lat, v_lng from public.listed_practices lp where lp.id = v_listed and lp.active;
    if not found then
      raise exception 'invalid_listing';
    end if;
  end if;

  select a.practitioner_id into v_pid from public.accounts a where a.user_id = v_uid;

  if v_pid is null then
    -- New profile: the address is /mjeku/<name>, e.g. /mjeku/arben-gashi or /mjeku/arben-gashi-2.
    v_base := left(btrim(regexp_replace(lower(translate(v_name,
      'ËÇÁÀÂÄÃÅÉÈÊÍÌÎÏÓÒÔÖÕÚÙÛÜÑŠŽĆČĐĞŞİëçáàâäãåéèêíìîïóòôöõúùûüñšžćčđğşı',
      'ECAAAAAAEEEIIIIOOOOOUUUUNSZCCDGSIecaaaaaaeeeiiiiooooouuuunszccdgsi')), '[^a-z0-9]+', '-', 'g'), '-'), 60);
    if v_base = '' then
      v_base := 'mjeku';
    end if;
    v_pid := v_base;
    while exists (select 1 from public.practitioners p where p.id = v_pid)
       or exists (select 1 from public.clinics c where c.id = 'k-' || v_pid) loop
      v_n := v_n + 1;
      v_pid := v_base || '-' || v_n;
    end loop;
    v_cid := 'k-' || v_pid;

    insert into public.clinics (id, name, type, city_id, neighborhood, postal_code, address, phone, website, lat, lng)
    values (v_cid, v_cname, v_ctype, v_city, v_hood, v_postal, v_address, v_phone, v_website, v_lat, v_lng);

    insert into public.practitioners (
      id, title, full_name, gender, specialty_id, clinic_id, languages, offers_video, open_saturday, price_eur, price_from,
      duration_min, years_experience, accepts_new_patients, featured, active, self_registered, about, listed_practice_id
    ) values (
      v_pid, v_title, v_name, v_gender, v_specialty, v_cid, v_languages, coalesce(pr ->> 'offers_video', 'false') = 'true',
      exists (select 1 from jsonb_array_elements(hrs) x where x ->> 'weekday' = '6'),
      v_price::int, coalesce(pr ->> 'price_from', 'false') = 'true', v_duration::int, v_years::int,
      coalesce(pr ->> 'accepts_new_patients', 'true') = 'true', false, v_active, true, v_about, v_listed
    );

    insert into public.accounts (user_id, practitioner_id) values (v_uid, v_pid);
  else
    select p.clinic_id into v_cid from public.practitioners p where p.id = v_pid;

    update public.clinics c set
      name = v_cname, type = v_ctype, city_id = v_city, neighborhood = v_hood, postal_code = v_postal,
      address = v_address, phone = v_phone, website = v_website,
      lat = case when v_listed is not null and v_listed is distinct from (select p.listed_practice_id from public.practitioners p where p.id = v_pid)
                 then v_lat else c.lat end,
      lng = case when v_listed is not null and v_listed is distinct from (select p.listed_practice_id from public.practitioners p where p.id = v_pid)
                 then v_lng else c.lng end
    where c.id = v_cid;

    update public.practitioners p set
      title = v_title, full_name = v_name, gender = v_gender, specialty_id = v_specialty, languages = v_languages,
      offers_video = coalesce(pr ->> 'offers_video', 'false') = 'true',
      open_saturday = exists (select 1 from jsonb_array_elements(hrs) x where x ->> 'weekday' = '6'),
      price_eur = v_price::int, price_from = coalesce(pr ->> 'price_from', 'false') = 'true',
      duration_min = v_duration::int, years_experience = v_years::int,
      accepts_new_patients = coalesce(pr ->> 'accepts_new_patients', 'true') = 'true',
      active = v_active, about = v_about, listed_practice_id = v_listed,
      -- Changing who you are or where you work needs checking again.
      verified = p.verified and p.full_name = v_name and p.specialty_id = v_specialty
                 and p.listed_practice_id is not distinct from v_listed
    where p.id = v_pid;
  end if;

  -- Replace the opening hours, then rebuild the next three weeks of free slots. Booked slots stay.
  delete from public.schedules s where s.practitioner_id = v_pid;
  insert into public.schedules (practitioner_id, weekday, start_time, end_time, slot_min)
  select v_pid, (x ->> 'weekday')::int, (x ->> 'start')::time, (x ->> 'end')::time, v_duration::int
  from jsonb_array_elements(hrs) x;

  delete from public.slots s
  where s.practitioner_id = v_pid and not s.is_booked and s.starts_at > now()
    and not exists (select 1 from public.bookings b where b.slot_id = s.id);
  -- Free slots that had a cancelled booking can't be deleted; close the ones outside the new hours.
  update public.slots s set is_booked = true
  where s.practitioner_id = v_pid and not s.is_booked and s.starts_at > now()
    and not exists (
      select 1 from public.schedules sc
      where sc.practitioner_id = v_pid
        and sc.weekday = extract(isodow from s.starts_at at time zone 'Europe/Tirane')::int
        and (s.starts_at at time zone 'Europe/Tirane')::time >= sc.start_time
        and (s.starts_at at time zone 'Europe/Tirane')::time + make_interval(mins => s.duration_min) <= sc.end_time
    );
  perform public.fill_slots(21, 0, v_pid);

  return public.my_profile();
end;
$$;

-- Bookings with them from 30 days ago onwards, for their dashboard.
create function public.my_bookings()
returns table (
  code text,
  starts_at timestamptz,
  mode public.visit_mode,
  status public.booking_status,
  patient_name text,
  patient_phone text,
  patient_email text,
  note text,
  reason text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.code, b.starts_at, b.mode, b.status, b.patient_name, b.patient_phone, b.patient_email, b.note, b.reason, b.created_at
  from public.accounts a
  join public.bookings b on b.practitioner_id = a.practitioner_id
  where a.user_id = (select auth.uid())
    and b.starts_at > now() - interval '30 days'
  order by b.starts_at
  limit 500;
$$;

revoke all on function public.my_profile() from public, anon;
revoke all on function public.save_my_profile(jsonb) from public, anon;
revoke all on function public.my_bookings() from public, anon;
grant execute on function public.my_profile() to authenticated;
grant execute on function public.save_my_profile(jsonb) to authenticated;
grant execute on function public.my_bookings() to authenticated;
