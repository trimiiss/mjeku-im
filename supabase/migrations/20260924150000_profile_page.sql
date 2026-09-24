-- Doctor profile page: map location, experience, public opening hours and the visit reason on bookings.

alter table public.clinics
  add column postal_code text,
  add column lat double precision,
  add column lng double precision;

alter table public.practitioners
  add column years_experience int check (years_experience between 0 and 60),
  add column accepts_new_patients boolean not null default true,
  add column photo_url text;

alter table public.bookings
  add column reason text check (char_length(reason) <= 80);

-- Opening hours are public information, shown on each profile.
grant select on public.schedules to anon, authenticated;
create policy "Anyone can read opening hours" on public.schedules for select to anon, authenticated using (true);

-- book_slot now also stores the visit reason.
drop function public.book_slot(bigint, text, text, text, public.visit_mode, text, text);

create function public.book_slot(
  p_slot_id bigint,
  p_name text,
  p_phone text,
  p_email text default null,
  p_mode public.visit_mode default 'in_person',
  p_note text default null,
  p_locale text default 'sq',
  p_reason text default null
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
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
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
  if v_reason is not null and char_length(v_reason) > 80 then
    v_reason := left(v_reason, 80);
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

  insert into public.bookings (code, slot_id, practitioner_id, starts_at, mode, patient_name, patient_phone, patient_email, note, locale, reason)
  values (v_code, v_slot.id, v_slot.practitioner_id, v_slot.starts_at, p_mode, v_name, v_phone, v_email, v_note,
          case when p_locale = 'en' then 'en' else 'sq' end, v_reason);

  return query select v_code, v_slot.starts_at, v_slot.practitioner_id, p_mode;
end;
$$;

revoke all on function public.book_slot(bigint, text, text, text, public.visit_mode, text, text, text) from public;
grant execute on function public.book_slot(bigint, text, text, text, public.visit_mode, text, text, text) to anon, authenticated;
