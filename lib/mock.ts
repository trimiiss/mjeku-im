import seed from "./seed.json";
import { addDaysKey, dayKey, isoWeekday, localToUtcIso } from "./format";
import type { City, Clinic, Directory, Practitioner, Slot, Specialty } from "./types";

type SeedPractitioner = Practitioner & { week: [string, string]; sat: [string, string] | null };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// Small deterministic hash so the same slots look "taken" on every render.
function taken(id: string, iso: string) {
  let h = 2166136261;
  for (const c of id + iso) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 100) < 30;
}

/** The demo data from lib/seed.json, with slots generated for the next few days. Used when Supabase isn't configured. */
export function offlineDirectory(days = 4, perDay = 8): Directory {
  const practitioners = seed.practitioners as SeedPractitioner[];
  const now = Date.now();
  const today = dayKey(now);
  const slots: Slot[] = [];
  let id = 1;

  for (let i = 0; i < days; i++) {
    const key = addDaysKey(today, i);
    const weekday = isoWeekday(key);
    for (const p of practitioners) {
      const hours = weekday <= 5 ? p.week : weekday === 6 ? p.sat : null;
      if (!hours) continue;
      let count = 0;
      for (let t = toMinutes(hours[0]); t + p.duration_min <= toMinutes(hours[1]) && count < perDay; t += p.duration_min) {
        const iso = localToUtcIso(key, toHhmm(t));
        if (Date.parse(iso) < now + 15 * 60_000 || taken(p.id, iso)) continue;
        slots.push({ id: id++, practitioner_id: p.id, starts_at: iso, duration_min: p.duration_min });
        count++;
      }
    }
  }

  return {
    cities: seed.cities as City[],
    specialties: seed.specialties as Specialty[],
    clinics: seed.clinics as Clinic[],
    practitioners: practitioners.map(({ week: _w, sat: _s, ...p }) => p),
    slots: slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    source: "offline",
  };
}
