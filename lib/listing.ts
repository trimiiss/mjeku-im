// Filtering and sorting for the listing pages. Shared by the server (first render) and the browser.
import { dayKey, daysBetween } from "./format";
import { pagesDicts } from "./pagesText";
import { cityName, prefixMatch, specialtyName, type Index } from "./search";
import { clinicTypes } from "./taxonomy";
import type { City, Lang, Practitioner, Specialty } from "./types";

/** What the page is about, from its address: /stomatolog/prishtine, /kerko?q=..., /konsultime-video. */
export type Base = {
  kind: "specialty" | "search" | "video";
  specialtyId?: string;
  cityId?: string;
  q?: string;
  clinicType?: string;
  video?: boolean;
};

/** The filters the visitor can change on the page. */
export type Filters = {
  newPatients: boolean;
  language: string;
  gender: "" | "f" | "m";
  within: "" | "today" | "3" | "7" | "14";
  page: number;
};

export const PAGE_SIZE = 10;
export const WITHIN = ["today", "3", "7", "14"] as const;

type Params = Record<string, string | string[] | undefined>;

function one(params: Params, key: string) {
  const v = params[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s.trim().slice(0, 80) : "";
}

export function parseFilters(params: Params): Filters {
  const gender = one(params, "gjinia");
  const within = one(params, "disp");
  const page = Number.parseInt(one(params, "faqja"), 10);
  return {
    newPatients: one(params, "te-rinj") === "1",
    language: /^[a-z]{2}$/.test(one(params, "gjuha")) ? one(params, "gjuha") : "",
    gender: gender === "f" || gender === "m" ? gender : "",
    within: (WITHIN as readonly string[]).includes(within) ? (within as Filters["within"]) : "",
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** Filters as URL parameters (empty ones left out). */
export function filterParams(f: Filters): Record<string, string | undefined> {
  return {
    "te-rinj": f.newPatients ? "1" : undefined,
    gjuha: f.language || undefined,
    gjinia: f.gender || undefined,
    disp: f.within || undefined,
    faqja: f.page > 1 ? String(f.page) : undefined,
  };
}

export const activeFilterCount = (f: Filters) =>
  [f.newPatients, Boolean(f.language), Boolean(f.gender), Boolean(f.within)].filter(Boolean).length;

export function matchesBase(p: Practitioner, base: Base, idx: Index) {
  if (base.video && !p.offers_video) return false;
  if (base.specialtyId && p.specialty_id !== base.specialtyId) return false;
  const clinic = idx.clinicById.get(p.clinic_id);
  if (base.clinicType && clinic?.type !== base.clinicType) return false;
  if (!base.video && base.cityId && clinic?.city_id !== base.cityId) return false;
  if (base.q && !prefixMatch(base.q, idx.haystackById.get(p.id) ?? "")) return false;
  return true;
}

export function matchesFilters(p: Practitioner, f: Filters, nextFree: Record<string, string>, todayKey: string) {
  if (f.newPatients && !p.accepts_new_patients) return false;
  if (f.language && !p.languages.includes(f.language)) return false;
  if (f.gender && p.gender !== f.gender) return false;
  if (f.within) {
    const next = nextFree[p.id];
    if (!next) return false;
    const limit = f.within === "today" ? 1 : Number(f.within);
    if (daysBetween(todayKey, dayKey(next)) >= limit) return false;
  }
  return true;
}

/** Earliest free slot first; practitioners without free slots last. Plain comparisons so server and browser agree. */
export function byAvailability(nextFree: Record<string, string>) {
  const cmp = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
  return (a: Practitioner, b: Practitioner) => cmp(nextFree[a.id] ?? "9999", nextFree[b.id] ?? "9999") || cmp(a.id, b.id);
}

/** The page title (H1), e.g. "Stomatolog në Prishtinë: rezervo termin online". */
export function listingTitle(base: Base, lang: Lang, specialty?: Specialty, city?: City) {
  const pd = pagesDicts[lang];
  const r = pd.results;
  const c = base.video ? undefined : city;
  const place = c ? cityName(c, lang) : pd.kosovo;
  if (base.kind === "video") return r.videoTitle;
  if (specialty) {
    const name = specialtyName(specialty, lang);
    return base.video ? r.specialtyVideoTitle(name) : r.specialtyTitle(name, place);
  }
  if (base.q) return r.searchTitle(base.q, c ? cityName(c, lang) : undefined);
  const type = base.clinicType ? clinicTypes[base.clinicType]?.[lang] : undefined;
  if (type) return r.typeTitle(type, place);
  if (base.video) return r.videoTitle;
  return r.allTitle(place);
}

/** The meta description for search engines and link previews. */
export function listingDescription(base: Base, lang: Lang, specialty?: Specialty, city?: City) {
  const pd = pagesDicts[lang];
  const c = base.video ? undefined : city;
  const place = c ? cityName(c, lang) : pd.kosovo;
  const what = specialty
    ? specialtyName(specialty, lang)
    : base.q
      ? `“${base.q}”`
      : base.clinicType
        ? (clinicTypes[base.clinicType]?.[lang] ?? "")
        : lang === "sq"
          ? "Mjekë"
          : "Doctors";
  return pd.results.metaDescription(what, place);
}
