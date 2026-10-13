// Builds supabase/seed.sql from lib/seed.json: the municipalities and specialties a new database starts with.
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

const cityCols = ["id", "name_sq", "name_en", "aliases", "sort"];
const specCols = ["id", "name_sq", "name_sq_f", "name_en", "keywords", "sort"];

const sql = `-- Reference data for Mjeku.Im (Kosovo): municipalities and specialties.
-- Generated from lib/seed.json by scripts/make-seed-sql.mjs. Doctors add themselves through their accounts;
-- the real practices not on Mjeku.Im yet are in supabase/listed.sql.

insert into public.cities (${cityCols.join(", ")}) values
${rows(seed.cities, cityCols)}
on conflict (id) do nothing;

insert into public.specialties (${specCols.join(", ")}) values
${rows(seed.specialties, specCols)}
on conflict (id) do nothing;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql: ${seed.cities.length} cities, ${seed.specialties.length} specialties`);
