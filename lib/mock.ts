import seed from "./seed.json";
import { addDaysKey, dayKey, isoWeekday, localToUtcIso } from "./format";
import type { City, Clinic, Directory, Practitioner, Schedule, Slot, Specialty } from "./types";

type SeedPractitioner = Practitioner & { week: [string, string]; sat: [string, string] | null };

const seedPractitioners = seed.practitioners as SeedPractitioner[];

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

type Options = { days?: number; perDay?: number; practitionerId?: string };

/** The demo data from lib/seed.json, with slots generated for the next few days. Used when Supabase isn't configured. */
export function offlineDirectory({ days = 4, perDay = 8, practitionerId }: Options = {}): Directory {
  const now = Date.now();
  const today = dayKey(now);
  const slots: Slot[] = [];
  // Negative ids can never match a real slot in the database.
  let id = -1;

  for (let i = 0; i < days; i++) {
    const key = addDaysKey(today, i);
    const weekday = isoWeekday(key);
    for (const p of seedPractitioners) {
      if (practitionerId && p.id !== practitionerId) continue;
      const hours = weekday <= 5 ? p.week : weekday === 6 ? p.sat : null;
      if (!hours) continue;
      let count = 0;
      for (let t = toMinutes(hours[0]); t + p.duration_min <= toMinutes(hours[1]) && count < perDay; t += p.duration_min) {
        const iso = localToUtcIso(key, toHhmm(t));
        if (Date.parse(iso) < now + 15 * 60_000 || taken(p.id, iso)) continue;
        slots.push({ id: id--, practitioner_id: p.id, starts_at: iso, duration_min: p.duration_min });
        count++;
      }
    }
  }

  return {
    cities: seed.cities as City[],
    specialties: seed.specialties as Specialty[],
    clinics: seed.clinics as Clinic[],
    practitioners: seedPractitioners.map(({ week: _w, sat: _s, ...p }) => p),
    slots: slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    source: "offline",
  };
}

/** Weekly opening hours from lib/seed.json: the same hours Monday to Friday, plus Saturday where open. */
export function offlineSchedules(practitionerId: string): Schedule[] {
  const p = seedPractitioners.find((x) => x.id === practitionerId);
  if (!p) return [];
  const week = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, start_time: p.week[0], end_time: p.week[1] }));
  return p.sat ? [...week, { weekday: 6, start_time: p.sat[0], end_time: p.sat[1] }] : week;
}
