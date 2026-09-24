import type { SupabaseClient } from "@supabase/supabase-js";
import { addDaysKey, dayKey, localToUtcIso } from "./format";
import { offlineDirectory, offlineSchedules } from "./mock";
import { PROFILE_DAYS } from "./profileText";
import { getSupabase } from "./supabase";
import type { City, Clinic, Directory, Practitioner, Schedule, Slot, Specialty } from "./types";

const PRACTITIONER_COLUMNS =
  "id, title, full_name, gender, specialty_id, clinic_id, languages, offers_video, open_saturday, price_eur, price_from, duration_min, years_experience, accepts_new_patients, featured";

/** Cities, specialties, clinics and practitioners: everything except availability. */
async function loadBase(sb: SupabaseClient) {
  const [cities, specialties, clinics, practitioners] = await Promise.all([
    sb.from("cities").select("id, name_sq, name_en, aliases, sort").order("sort"),
    sb.from("specialties").select("id, name_sq, name_sq_f, name_en, keywords, sort").order("sort"),
    sb.from("clinics").select("id, name, type, city_id, neighborhood, postal_code, lat, lng"),
    sb
      .from("practitioners")
      .select(PRACTITIONER_COLUMNS)
      .order("featured", { ascending: false })
      .order("full_name"),
  ]);
  const error = cities.error ?? specialties.error ?? clinics.error ?? practitioners.error;
  if (error) throw error;
  return {
    cities: (cities.data ?? []) as City[],
    specialties: (specialties.data ?? []) as Specialty[],
    clinics: (clinics.data ?? []) as Clinic[],
    practitioners: (practitioners.data ?? []) as Practitioner[],
  };
}

/** Everything the home page needs: the directory plus free slots for the next 4 days. */
export async function getDirectory(): Promise<Directory> {
  const sb = getSupabase();
  if (!sb) return offlineDirectory();

  try {
    const [base, slots] = await Promise.all([loadBase(sb), sb.rpc("free_slots", { p_days: 4, p_per_day: 8 })]);
    if (slots.error) throw slots.error;
    return { ...base, slots: (slots.data ?? []) as Slot[], source: "live" };
  } catch (err) {
    console.error("Supabase request failed, showing offline demo data instead.", err);
    return offlineDirectory();
  }
}

export type Profile = { directory: Directory; practitioner: Practitioner; schedules: Schedule[] };

/** One practitioner's profile: the directory (for names and places), their free slots and opening hours. */
export async function getProfile(id: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return offlineProfile(id);

  try {
    const now = Date.now();
    const from = new Date(now + 15 * 60_000).toISOString();
    const until = localToUtcIso(addDaysKey(dayKey(now), PROFILE_DAYS), "00:00");

    const [base, slots, schedules] = await Promise.all([
      loadBase(sb),
      sb
        .from("slots")
        .select("id, practitioner_id, starts_at, duration_min")
        .eq("practitioner_id", id)
        .eq("is_booked", false)
        .gt("starts_at", from)
        .lt("starts_at", until)
        .order("starts_at")
        .limit(600),
      sb.from("schedules").select("weekday, start_time, end_time").eq("practitioner_id", id).order("weekday").order("start_time"),
    ]);
    const error = slots.error ?? schedules.error;
    if (error) throw error;

    const practitioner = base.practitioners.find((p) => p.id === id);
    if (!practitioner) return null;
    return {
      directory: { ...base, slots: (slots.data ?? []) as Slot[], source: "live" },
      practitioner,
      schedules: (schedules.data ?? []) as Schedule[],
    };
  } catch (err) {
    console.error("Supabase request failed, showing offline demo data instead.", err);
    return offlineProfile(id);
  }
}

function offlineProfile(id: string): Profile | null {
  const directory = offlineDirectory({ days: PROFILE_DAYS, perDay: 99, practitionerId: id });
  const practitioner = directory.practitioners.find((p) => p.id === id);
  if (!practitioner) return null;
  return { directory, practitioner, schedules: offlineSchedules(id) };
}

/** Directory plus the first free slot of every practitioner (for availability filters and sorting). */
export type Listing = { directory: Directory; nextFree: Record<string, string> };

export async function getListing(): Promise<Listing> {
  const sb = getSupabase();
  const [directory, next] = await Promise.all([
    getDirectory(),
    sb ? sb.rpc("next_free_slots").then((r) => r, () => null) : Promise.resolve(null),
  ]);

  const nextFree: Record<string, string> = {};
  if (directory.source === "live" && next && !next.error && Array.isArray(next.data)) {
    for (const row of next.data as { practitioner_id: string; starts_at: string }[]) nextFree[row.practitioner_id] = row.starts_at;
    return { directory, nextFree };
  }

  // Offline, or the function failed: look two weeks ahead in the demo data, or use the slots already loaded.
  const source = directory.source === "offline" ? offlineDirectory({ days: PROFILE_DAYS, perDay: 1 }).slots : directory.slots;
  for (const s of source) if (!nextFree[s.practitioner_id]) nextFree[s.practitioner_id] = s.starts_at;
  return { directory, nextFree };
}
