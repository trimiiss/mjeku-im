import { offlineDirectory } from "./mock";
import { getSupabase } from "./supabase";
import type { Directory } from "./types";

/** Everything the page needs: the directory plus free slots for the next 4 days. */
export async function getDirectory(): Promise<Directory> {
  const sb = getSupabase();
  if (!sb) return offlineDirectory();

  try {
    const [cities, specialties, clinics, practitioners, slots] = await Promise.all([
      sb.from("cities").select("id, name_sq, name_en, aliases, sort").order("sort"),
      sb.from("specialties").select("id, name_sq, name_sq_f, name_en, keywords, sort").order("sort"),
      sb.from("clinics").select("id, name, type, city_id, neighborhood"),
      sb
        .from("practitioners")
        .select(
          "id, title, full_name, gender, specialty_id, clinic_id, languages, offers_video, open_saturday, price_eur, price_from, duration_min, featured",
        )
        .order("featured", { ascending: false })
        .order("full_name"),
      sb.rpc("free_slots", { p_days: 4, p_per_day: 8 }),
    ]);

    const error = cities.error ?? specialties.error ?? clinics.error ?? practitioners.error ?? slots.error;
    if (error) throw error;

    return {
      cities: cities.data ?? [],
      specialties: specialties.data ?? [],
      clinics: clinics.data ?? [],
      practitioners: practitioners.data ?? [],
      slots: slots.data ?? [],
      source: "live",
    };
  } catch (err) {
    console.error("Supabase request failed, showing offline demo data instead.", err);
    return offlineDirectory();
  }
}
