import seed from "./seed.json";
import type { City, Directory, Specialty } from "./types";

/** Municipalities and specialties from lib/seed.json, and no practitioners: used when Supabase isn't configured or fails. */
export function offlineDirectory(): Directory {
  return {
    cities: seed.cities as City[],
    specialties: seed.specialties as Specialty[],
    clinics: [],
    practitioners: [],
    slots: [],
    source: "offline",
  };
}
