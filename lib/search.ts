import { specialtyInfo } from "./profileText";
import { clinicTypes, expertise } from "./taxonomy";
import type { City, Clinic, Directory, Lang, Practitioner, Slot, Specialty } from "./types";

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
      const focus = specialtyInfo[p.specialty_id];
      const areas = focus ? [...focus.focus.sq, ...focus.focus.en] : [];
      return [
        p.id,
        [p.full_name, sp?.name_sq, sp?.name_sq_f, sp?.name_en, sp?.keywords, cl?.name, type?.sq, type?.en, ...services, ...areas].join(" "),
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
