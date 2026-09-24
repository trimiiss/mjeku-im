import {
  cityAliases,
  expertiseDirectory,
  institutionDirectory,
  institutions,
  practitioners,
  specialtiesDirectory,
  type Practitioner,
} from "./data";

export type Mode = "in-person" | "video";
export type Query = { q: string; city: string; mode: Mode };

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

// Every typed word must be the start of some word in the haystack.
function prefixMatch(needle: string, haystack: string) {
  const want = words(needle);
  if (want.length === 0) return true;
  const have = words(haystack);
  return want.every((w) => have.some((h) => h.startsWith(w)));
}

// Directory labels ("General practitioner (GP)") map to the terms they search for.
const labelToQuery = new Map(
  [...specialtiesDirectory, ...expertiseDirectory, ...institutionDirectory].map((d) => [norm(d.label), d.q]),
);

export function resolveQuery(text: string) {
  return labelToQuery.get(norm(text)) ?? text;
}

export function matches(p: Practitioner, query: Query) {
  if (query.mode === "video" && !p.video) return false;
  const q = resolveQuery(query.q);
  if (!prefixMatch(q, `${p.name} ${p.specialty} ${p.practice} ${p.keywords}`)) return false;
  if (query.mode !== "video" && !prefixMatch(query.city, `${p.city} ${p.postcode} ${cityAliases[p.city] ?? ""}`)) {
    return false;
  }
  return true;
}

export function filterPractitioners(query: Query | null) {
  if (!query) return practitioners;
  return practitioners.filter((p) => matches(p, query));
}

export type Suggestion = {
  kind: "specialty" | "practitioner" | "institution";
  label: string;
  hint: string;
  initials?: string;
};

export type SuggestionGroup = { title: string; items: Suggestion[] };

export function suggest(input: string, limitPerGroup = 4): SuggestionGroup[] {
  const text = input.trim();

  const specialties = specialtiesDirectory
    .filter((s) => !text || prefixMatch(text, s.label))
    .slice(0, text ? limitPerGroup : 6)
    .map<Suggestion>((s) => ({ kind: "specialty", label: s.label, hint: "Specialty" }));

  const docs = text
    ? practitioners
        .filter((p) => p.name !== p.practice && prefixMatch(text, `${p.name} ${p.specialty}`))
        .slice(0, limitPerGroup)
        .map<Suggestion>((p) => ({
          kind: "practitioner",
          label: p.name,
          hint: `${p.specialty} · ${p.city}`,
          initials: p.initials,
        }))
    : [];

  const places = text
    ? institutions
        .filter((i) => prefixMatch(text, `${i.name} ${i.type}`))
        .slice(0, limitPerGroup)
        .map<Suggestion>((i) => ({ kind: "institution", label: i.name, hint: `${i.type} · ${i.city}` }))
    : [];

  return [
    { title: text ? "Specialties" : "Popular specialties", items: specialties },
    { title: "Practitioners", items: docs },
    { title: "Institutions", items: places },
  ].filter((g) => g.items.length > 0);
}
