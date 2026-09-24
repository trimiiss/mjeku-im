// Builds supabase/seed.sql from lib/seed.json (the single source for the demo data).
// Run: node scripts/make-seed-sql.mjs
import { readFileSync, writeFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../lib/seed.json", import.meta.url), "utf8"));

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(", ")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const rows = (list, cols) => list.map((r) => `  (${cols.map((c) => q(r[c])).join(", ")})`).join(",\n");

const hours = seed.practitioners
  .map((p) => `  (${[p.id, p.week[0], p.week[1], p.sat ? p.sat[0] : null, p.sat ? p.sat[1] : null].map(q).join(", ")})`)
  .join(",\n");

const cityCols = ["id", "name_sq", "name_en", "aliases", "sort"];
const specCols = ["id", "name_sq", "name_sq_f", "name_en", "keywords", "sort"];
const clinicCols = ["id", "name", "type", "city_id", "neighborhood", "postal_code", "lat", "lng"];
const prCols = [
  "id", "title", "full_name", "gender", "specialty_id", "clinic_id", "languages",
  "offers_video", "open_saturday", "price_eur", "price_from", "duration_min", "years_experience",
  "accepts_new_patients", "featured",
];

const sql = `-- Demo data for Mjeku.Im (Kosovo). Generated from lib/seed.json by scripts/make-seed-sql.mjs.
-- All practitioners and clinics are fictional.

insert into public.cities (${cityCols.join(", ")}) values
${rows(seed.cities, cityCols)}
on conflict (id) do nothing;

insert into public.specialties (${specCols.join(", ")}) values
${rows(seed.specialties, specCols)}
on conflict (id) do nothing;

insert into public.clinics (${clinicCols.join(", ")}) values
${rows(seed.clinics, clinicCols)}
on conflict (id) do nothing;

insert into public.practitioners (${prCols.join(", ")}) values
${rows(seed.practitioners, prCols)}
on conflict (id) do nothing;

-- Opening hours: the same hours Monday to Friday, plus Saturday where open.
with hours (id, week_start, week_end, sat_start, sat_end) as (values
${hours}
)
insert into public.schedules (practitioner_id, weekday, start_time, end_time, slot_min)
select h.id, d, h.week_start::time, h.week_end::time, p.duration_min
from hours h
join public.practitioners p on p.id = h.id
cross join generate_series(1, 5) d
union all
select h.id, 6, h.sat_start::time, h.sat_end::time, p.duration_min
from hours h
join public.practitioners p on p.id = h.id
where h.sat_start is not null;

-- Three weeks of slots, about 30% already taken so the calendar looks realistic.
select public.generate_slots(21, 0.3);
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql: ${seed.cities.length} cities, ${seed.specialties.length} specialties, ${seed.clinics.length} clinics, ${seed.practitioners.length} practitioners`);
