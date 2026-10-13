import type { SupabaseClient } from "@supabase/supabase-js";
import { addDaysKey, dayKey, localToUtcIso } from "./format";
import listedSeed from "./listed.json";
import { offlineDirectory } from "./offline";
import { PROFILE_DAYS } from "./profileText";
import { getSupabase } from "./supabase";
import type { City, Clinic, Directory, ListedPractice, Practitioner, ProfileDetails, Schedule, Slot, Specialty } from "./types";

const PRACTITIONER_COLUMNS =
  "id, title, full_name, gender, specialty_id, clinic_id, languages, offers_video, open_saturday, price_eur, price_from, duration_min, years_experience, accepts_new_patients, featured, self_registered, verified";
const LISTED_COLUMNS = "id, name, kind, sector, specialty_ids, city_id, neighborhood, address, phone, website, lat, lng, checked_on";

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
    console.error("Supabase request failed, showing no practitioners instead.", err);
    return offlineDirectory();
  }
}

export type Profile = { directory: Directory; practitioner: Practitioner; schedules: Schedule[]; details: ProfileDetails };

const NO_DETAILS: ProfileDetails = { about: null, address: null, phone: null, website: null };

/** One practitioner's profile: the directory (for names and places), their free slots and opening hours. */
export async function getProfile(id: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const now = Date.now();
    const from = new Date(now + 15 * 60_000).toISOString();
    const until = localToUtcIso(addDaysKey(dayKey(now), PROFILE_DAYS), "00:00");

    const [base, slots, schedules, extra] = await Promise.all([
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
      sb.from("practitioners").select("about, clinics(address, phone, website)").eq("id", id).maybeSingle(),
    ]);
    const error = slots.error ?? schedules.error;
    if (error) throw error;

    const practitioner = base.practitioners.find((p) => p.id === id);
    if (!practitioner) return null;
    // Missing before the accounts migration: the profile still works, just without these extras.
    const row = extra.error ? null : (extra.data as { about: string | null; clinics: Omit<ProfileDetails, "about"> | null } | null);
    return {
      directory: { ...base, slots: (slots.data ?? []) as Slot[], source: "live" },
      practitioner,
      schedules: (schedules.data ?? []) as Schedule[],
      details: row ? { ...NO_DETAILS, ...row.clinics, about: row.about } : NO_DETAILS,
    };
  } catch (err) {
    console.error("Supabase request failed, can't show this profile.", err);
    return null;
  }
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

  // The function failed: use the slots already loaded.
  for (const s of directory.slots) if (!nextFree[s.practitioner_id]) nextFree[s.practitioner_id] = s.starts_at;
  return { directory, nextFree };
}

/** Real practices that aren't on Mjeku.Im yet, for a listing page. */
export type Listed = {
  /** The ones for the page's specialty in the page's city (empty without both). */
  practices: ListedPractice[];
  /** For the page's specialty: how many each city has. */
  byCity: Record<string, number>;
  /** In the page's city: how many each specialty has. */
  bySpecialty: Record<string, number>;
};

function countBy(keys: string[]) {
  const out: Record<string, number> = {};
  for (const k of keys) out[k] = (out[k] ?? 0) + 1;
  return out;
}

/** Those with a phone number first, then by name. Sorted here so server and browser agree. */
const sortListed = (list: ListedPractice[]) =>
  [...list].sort((a, b) => Number(Boolean(b.phone)) - Number(Boolean(a.phone)) || a.name.localeCompare(b.name, "sq"));

export async function getListed(specialtyId?: string, cityId?: string): Promise<Listed> {
  const sb = getSupabase();
  if (!sb) return offlineListed(specialtyId, cityId);

  try {
    const view = () => sb.from("open_listed_practices");
    const [practices, cities, specialties] = await Promise.all([
      specialtyId && cityId
        ? view().select(LISTED_COLUMNS).eq("city_id", cityId).contains("specialty_ids", [specialtyId]).limit(1000)
        : null,
      specialtyId ? view().select("city_id").contains("specialty_ids", [specialtyId]).limit(5000) : null,
      cityId ? view().select("specialty_ids").eq("city_id", cityId).limit(5000) : null,
    ]);
    const error = practices?.error ?? cities?.error ?? specialties?.error;
    if (error) throw error;
    return {
      practices: sortListed((practices?.data ?? []) as ListedPractice[]),
      byCity: countBy(((cities?.data ?? []) as { city_id: string }[]).map((r) => r.city_id)),
      bySpecialty: countBy(((specialties?.data ?? []) as { specialty_ids: string[] }[]).flatMap((r) => r.specialty_ids)),
    };
  } catch (err) {
    console.error("Supabase request failed, showing the bundled listed practices instead.", err);
    return offlineListed(specialtyId, cityId);
  }
}

/** The same from lib/listed.json, when Supabase isn't configured or fails. */
function offlineListed(specialtyId?: string, cityId?: string): Listed {
  const all = listedSeed as unknown as ListedPractice[];
  const forSpecialty = specialtyId ? all.filter((p) => p.specialty_ids.includes(specialtyId)) : [];
  return {
    practices: cityId ? sortListed(forSpecialty.filter((p) => p.city_id === cityId)) : [],
    byCity: countBy(forSpecialty.map((p) => p.city_id)),
    bySpecialty: cityId ? countBy(all.filter((p) => p.city_id === cityId).flatMap((p) => p.specialty_ids)) : {},
  };
}

/** For every specialty, how many listed practices each city has (the specialties page). */
export async function getListedCounts(): Promise<Record<string, Record<string, number>>> {
  const sb = getSupabase();
  let rows = listedSeed as unknown as Pick<ListedPractice, "specialty_ids" | "city_id">[];
  if (sb) {
    const { data, error } = await sb.from("open_listed_practices").select("specialty_ids, city_id").limit(5000);
    if (!error) rows = (data ?? []) as typeof rows;
    else console.error("Supabase request failed, counting the bundled listed practices instead.", error);
  }
  const out: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    for (const s of r.specialty_ids) {
      const byCity = (out[s] ??= {});
      byCity[r.city_id] = (byCity[r.city_id] ?? 0) + 1;
    }
  }
  return out;
}

/** One listed practice, for "this is my practice" on the account page. */
export async function getListedPractice(id: string): Promise<ListedPractice | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from("listed_practices").select(LISTED_COLUMNS).eq("id", id).maybeSingle();
    if (!error) return (data as ListedPractice | null) ?? null;
    console.error("Supabase request failed, looking in the bundled listed practices instead.", error);
  }
  return (listedSeed as unknown as ListedPractice[]).find((p) => p.id === id) ?? null;
}
