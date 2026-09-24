import { clinicTypes, expertise } from "./taxonomy";
import type { City, Clinic, Directory, Lang, Practitioner, Query, Slot, Specialty } from "./types";

export function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function words(s: string) {
  return norm(s).split(/[^a-z0-9]+/).filter(Boolean);
}

/** Every typed word must be the start of some word in the haystack. */
export function prefixMatch(needle: string, haystack: string) {
  const want = words(needle);
  if (want.length === 0) return true;
  const have = words(haystack);
  return want.every((w) => have.some((h) => h.startsWith(w)));
}

export type Index = {
  cityById: Map<string, City>;
  specialtyById: Map<string, Specialty>;
  clinicById: Map<string, Clinic>;
  practitionerById: Map<string, Practitioner>;
  slotsByPractitioner: Map<string, Slot[]>;
  haystackById: Map<string, string>;
};

export function buildIndex(d: Directory): Index {
  const cityById = new Map(d.cities.map((c) => [c.id, c]));
  const specialtyById = new Map(d.specialties.map((s) => [s.id, s]));
  const clinicById = new Map(d.clinics.map((c) => [c.id, c]));
  const practitionerById = new Map(d.practitioners.map((p) => [p.id, p]));
  const slotsByPractitioner = new Map<string, Slot[]>();
  for (const s of d.slots) {
    const list = slotsByPractitioner.get(s.practitioner_id) ?? [];
    list.push(s);
    slotsByPractitioner.set(s.practitioner_id, list);
  }
  const haystackById = new Map(
    d.practitioners.map((p) => {
      const sp = specialtyById.get(p.specialty_id);
      const cl = clinicById.get(p.clinic_id);
      const type = cl ? clinicTypes[cl.type] : undefined;
      const services = expertise.filter((e) => e.specialtyId === p.specialty_id).map((e) => `${e.sq} ${e.en}`);
      return [
        p.id,
        [p.full_name, sp?.name_sq, sp?.name_sq_f, sp?.name_en, sp?.keywords, cl?.name, type?.sq, type?.en, ...services].join(" "),
      ];
    }),
  );
  return { cityById, specialtyById, clinicById, practitionerById, slotsByPractitioner, haystackById };
}

export const displayName = (p: Practitioner) => [p.title, p.full_name].filter(Boolean).join(" ");

export function specialtyName(s: Specialty | undefined, lang: Lang, gender?: Practitioner["gender"]) {
  if (!s) return "";
  if (lang === "en") return s.name_en;
  return gender === "f" ? s.name_sq_f : s.name_sq;
}

export const cityName = (c: City | undefined, lang: Lang) => (c ? (lang === "sq" ? c.name_sq : c.name_en) : "");

export function matches(p: Practitioner, q: Query, idx: Index) {
  if (q.mode === "video" && !p.offers_video) return false;
  if (q.specialtyId && p.specialty_id !== q.specialtyId) return false;

  const clinic = idx.clinicById.get(p.clinic_id);
  if (q.clinicType && clinic?.type !== q.clinicType) return false;

  if (!q.specialtyId && !q.clinicType && q.q.trim() && !prefixMatch(q.q, idx.haystackById.get(p.id) ?? "")) {
    return false;
  }

  if (q.mode !== "video") {
    if (q.cityId && clinic?.city_id !== q.cityId) return false;
    if (!q.cityId && q.city.trim()) {
      const city = clinic ? idx.cityById.get(clinic.city_id) : undefined;
      if (!city || !prefixMatch(q.city, `${city.name_sq} ${city.name_en} ${city.aliases}`)) return false;
    }
  }
  return true;
}

export type Suggestion =
  | { kind: "specialty"; id: string; label: string }
  | { kind: "practitioner"; id: string; label: string; hint: string; initials: string }
  | { kind: "clinic"; id: string; label: string; hint: string };

export type SuggestionGroup = { key: "popular" | "specialties" | "practitioners" | "clinics"; items: Suggestion[] };

export function suggest(input: string, lang: Lang, d: Directory, idx: Index, limit = 4): SuggestionGroup[] {
  const text = input.trim();

  const specialties = d.specialties
    .filter((s) => !text || prefixMatch(text, `${s.name_sq} ${s.name_sq_f} ${s.name_en} ${s.keywords}`))
    .slice(0, text ? limit : 6)
    .map<Suggestion>((s) => ({ kind: "specialty", id: s.id, label: specialtyName(s, lang) }));

  const people = text
    ? d.practitioners
        .filter((p) => p.specialty_id !== "lab" && prefixMatch(text, `${p.full_name} ${p.title}`))
        .slice(0, limit)
        .map<Suggestion>((p) => {
          const clinic = idx.clinicById.get(p.clinic_id);
          return {
            kind: "practitioner",
            id: p.id,
            label: displayName(p),
            hint: `${specialtyName(idx.specialtyById.get(p.specialty_id), lang, p.gender)} · ${cityName(clinic && idx.cityById.get(clinic.city_id), lang)}`,
            initials: initials(p.full_name),
          };
        })
    : [];

  const clinics = text
    ? d.clinics
        .filter((c) => prefixMatch(text, `${c.name} ${clinicTypes[c.type]?.sq ?? ""} ${clinicTypes[c.type]?.en ?? ""}`))
        .slice(0, limit)
        .map<Suggestion>((c) => ({
          kind: "clinic",
          id: c.id,
          label: c.name,
          hint: `${clinicTypes[c.type]?.[lang] ?? ""} · ${cityName(idx.cityById.get(c.city_id), lang)}`,
        }))
    : [];

  const groups: SuggestionGroup[] = [
    { key: text ? "specialties" : "popular", items: specialties },
    { key: "practitioners", items: people },
    { key: "clinics", items: clinics },
  ];
  return groups.filter((g) => g.items.length > 0);
}

export function initials(name: string) {
  return name
    .replace(/,.*$/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Link to a practitioner's profile page. */
export const profileHref = (id: string) => `/mjeku/${encodeURIComponent(id)}`;

/** Home page link that opens the results for a search, e.g. "/?s=dentist&c=prishtine#available". */
export function queryHref(q: Partial<Query>) {
  const sp = new URLSearchParams();
  if (q.specialtyId) sp.set("s", q.specialtyId);
  if (q.clinicType) sp.set("t", q.clinicType);
  if (q.mode === "video") sp.set("m", "video");
  else if (q.cityId) sp.set("c", q.cityId);
  else if (q.city?.trim()) sp.set("city", q.city.trim());
  if (q.label) sp.set("l", q.label);
  else if (q.q?.trim()) sp.set("q", q.q.trim());
  const s = sp.toString();
  return `/${s ? `?${s}` : ""}#available`;
}

type Params = Record<string, string | string[] | undefined>;

/** Reads a search from the home page URL (see queryHref). Unknown ids are ignored. */
export function parseQuery(params: Params, d: Directory, lang: Lang): Query | null {
  const get = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return typeof s === "string" ? s.trim().slice(0, 80) : "";
  };
  const specialty = d.specialties.find((s) => s.id === get("s"));
  const city = d.cities.find((c) => c.id === get("c"));
  const clinicType = clinicTypes[get("t")] ? get("t") : undefined;
  const mode = get("m") === "video" ? "video" : "in_person";
  const label = get("l") || (specialty ? specialtyName(specialty, lang) : clinicType ? clinicTypes[clinicType][lang] : "");
  const text = get("q");
  const cityText = get("city");

  if (!specialty && !city && !clinicType && !label && !text && !cityText && mode !== "video") return null;
  return {
    q: label || text,
    city: city ? cityName(city, lang) : cityText,
    mode,
    specialtyId: specialty?.id,
    cityId: city?.id,
    clinicType,
    label: label || undefined,
  };
}
