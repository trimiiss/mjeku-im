// Builds supabase/listed.sql from lib/listed.json (the real practices not on Mjeku.Im yet).
// Run: node scripts/make-listed-sql.mjs, then run supabase/listed.sql in the SQL editor.
// Re-running it updates changed practices and adds new ones; practices removed from the JSON are deactivated.
import { readFileSync, writeFileSync } from "node:fs";

const listed = JSON.parse(readFileSync(new URL("../lib/listed.json", import.meta.url), "utf8"));

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(", ")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const cols = [
  "id", "name", "kind", "sector", "specialty_ids", "city_id", "neighborhood", "address",
  "phone", "website", "lat", "lng", "osm_id", "sources", "checked_on",
];
const rows = listed.map((p) => `  (${cols.map((c) => q(p[c])).join(", ")})`).join(",\n");

const sql = `-- Real practices, clinics and health centres in Kosovo that aren't on Mjeku.Im yet.
-- Generated from lib/listed.json by scripts/make-listed-sql.mjs. Sources: OpenStreetMap
-- (© OpenStreetMap contributors, ODbL) and the practices' own public pages, listed per row.

insert into public.listed_practices (${cols.join(", ")}) values
${rows}
on conflict (id) do update set
${cols.filter((c) => c !== "id").map((c) => `  ${c} = excluded.${c}`).join(",\n")},
  active = true;

update public.listed_practices set active = false
where id <> all (array[${listed.map((p) => q(p.id)).join(", ")}]);
`;

writeFileSync(new URL("../supabase/listed.sql", import.meta.url), sql);
console.log(`supabase/listed.sql: ${listed.length} practices`);
