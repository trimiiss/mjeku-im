-- Every municipality in Kosovo, and the real practices, clinics and health centres that aren't on Mjeku.Im yet,
-- so a page like /pediater/gjilan can show everyone in that municipality.
-- Only public details (name, address, phone, website), each with the sources it came from.
-- They can't be booked online; the site shows them with their phone number instead.

-- The 28 municipalities the demo didn't have yet (the first 10 are in seed.sql).
insert into public.cities (id, name_sq, name_en, aliases, sort) values
  ('decan', 'Deçan', 'Deçan', 'decani dečani', 11),
  ('dragash', 'Dragash', 'Dragash', 'dragashi dragaš', 12),
  ('drenas', 'Drenas', 'Drenas', 'drenasi gllogoc glogovac', 13),
  ('gracanice', 'Graçanicë', 'Gračanica', 'gracanica gračanica', 14),
  ('hani-i-elezit', 'Hani i Elezit', 'Hani i Elezit', 'elez han general jankovic', 15),
  ('istog', 'Istog', 'Istog', 'istogu istok', 16),
  ('junik', 'Junik', 'Junik', 'juniku', 17),
  ('kacanik', 'Kaçanik', 'Kaçanik', 'kacaniku kačanik', 18),
  ('kamenice', 'Kamenicë', 'Kamenica', 'kamenica', 19),
  ('kline', 'Klinë', 'Klina', 'klina', 20),
  ('kllokot', 'Kllokot', 'Klokot', 'kllokoti klokot', 21),
  ('leposaviq', 'Leposaviq', 'Leposavić', 'leposavic', 22),
  ('lipjan', 'Lipjan', 'Lipjan', 'lipjani lipljan', 23),
  ('malisheve', 'Malishevë', 'Malisheva', 'malisheva mališevo malisevo', 24),
  ('mamushe', 'Mamushë', 'Mamusha', 'mamusha mamuša', 25),
  ('mitrovice-e-veriut', 'Mitrovicë e Veriut', 'North Mitrovica', 'mitrovica veriore severna kosovska', 26),
  ('novoberde', 'Novobërdë', 'Novo Brdo', 'novoberda novo brdo', 27),
  ('obiliq', 'Obiliq', 'Obiliq', 'obiliqi obilić obilic', 28),
  ('partesh', 'Partesh', 'Partesh', 'parteshi parteš', 29),
  ('rahovec', 'Rahovec', 'Rahovec', 'rahoveci orahovac', 30),
  ('ranillug', 'Ranillug', 'Ranilug', 'ranillugu ranilug', 31),
  ('shterpce', 'Shtërpcë', 'Shtërpcë', 'shterpca štrpce strpce', 32),
  ('shtime', 'Shtime', 'Shtime', 'shtimja štimlje stimlje', 33),
  ('skenderaj', 'Skënderaj', 'Skenderaj', 'skenderaji srbica', 34),
  ('suhareke', 'Suharekë', 'Suhareka', 'suhareka suva reka', 35),
  ('viti', 'Viti', 'Viti', 'vitia vitina', 36),
  ('zubin-potok', 'Zubin Potok', 'Zubin Potok', 'zubin potok', 37),
  ('zvecan', 'Zveçan', 'Zvečan', 'zveçani zvecan', 38)
on conflict (id) do nothing;

create table public.listed_practices (
  id text primary key,
  name text not null,
  -- A clinic type from lib/taxonomy.ts (dental, polyclinic, family_center, hospital, ...).
  kind text not null,
  sector text check (sector in ('public', 'private')),
  -- A polyclinic can have several specialties.
  specialty_ids text[] not null check (cardinality(specialty_ids) > 0),
  city_id text not null references public.cities (id),
  neighborhood text,
  address text,
  phone text,
  website text,
  lat double precision,
  lng double precision,
  osm_id text,
  sources text[] not null default '{}',
  checked_on date not null default current_date,
  active boolean not null default true
);
create index listed_practices_city_id_idx on public.listed_practices (city_id);
create index listed_practices_specialty_ids_idx on public.listed_practices using gin (specialty_ids);

alter table public.listed_practices enable row level security;
create policy "Anyone can read active listed practices" on public.listed_practices
  for select to anon, authenticated using (active);
revoke insert, update, delete, truncate on public.listed_practices from anon, authenticated;
