// Page addresses. Albanian slugs, like OneDoc's /en/physiotherapist/zurich:
// /stomatolog, /stomatolog/prishtine, /mjeku/arta-krasniqi, /kerko?q=...
import { prefixMatch } from "./search";
import type { Directory, Query } from "./types";

export const specialtySlugs: Record<string, string> = {
  gp: "mjek-i-familjes",
  dentist: "stomatolog",
  pediatrician: "pediater",
  gynecologist: "gjinekolog",
  dermatologist: "dermatolog",
  cardiologist: "kardiolog",
  internist: "internist",
  ophthalmologist: "okulist",
  orthopedist: "ortoped",
  physiotherapist: "fizioterapeut",
  psychologist: "psikolog",
  ent: "mjek-orl",
  neurologist: "neurolog",
  nutritionist: "nutricionist",
  lab: "laborator",
};

const idBySlug: Record<string, string> = Object.fromEntries(Object.entries(specialtySlugs).map(([id, slug]) => [slug, id]));

export const specialtyIdFromSlug = (slug: string): string | undefined =>
  Object.prototype.hasOwnProperty.call(idBySlug, slug) ? idBySlug[slug] : undefined;

export const paths = {
  home: "/",
  search: "/kerko",
  video: "/konsultime-video",
  specialties: "/specialitetet",
  pros: "/per-mjeket",
  help: "/ndihme",
  account: "/llogaria",
};

/** The practitioner account page, optionally starting from a listed practice ("this is my practice"). */
export const accountHref = (listedPracticeId?: string) =>
  listedPracticeId ? `${paths.account}?praktika=${encodeURIComponent(listedPracticeId)}` : paths.account;

type Params = Record<string, string | undefined>;

function withParams(path: string, params?: Params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
}

/** "/stomatolog" or "/stomatolog/prishtine". */
export function specialtyHref(specialtyId: string, cityId?: string, params?: Params) {
  const slug = specialtySlugs[specialtyId] ?? specialtyId;
  return withParams(cityId ? `/${slug}/${cityId}` : `/${slug}`, params);
}

export const profileHref = (id: string) => `/mjeku/${encodeURIComponent(id)}`;

/** The search page, e.g. "/kerko?q=glaukoma&qyteti=prizren". */
export function searchPageHref(params?: { q?: string; cityId?: string; type?: string; video?: boolean }) {
  return withParams(paths.search, {
    q: params?.q?.trim() || undefined,
    qyteti: params?.video ? undefined : params?.cityId,
    lloji: params?.type,
    video: params?.video ? "1" : undefined,
  });
}

/** Resolves a typed city ("prishtina", "Prizren") to a city id. */
export function findCityId(text: string | undefined, d: Directory) {
  const t = text?.trim();
  if (!t) return undefined;
  return d.cities.find((c) => prefixMatch(t, `${c.name_sq} ${c.name_en} ${c.aliases}`))?.id;
}

/** Where the search bar leads: the specialty page when a specialty is chosen, otherwise the search page. */
export function searchHref(q: Partial<Query>, d: Directory) {
  const video = q.mode === "video";
  const cityId = video ? undefined : (q.cityId ?? findCityId(q.city, d));
  if (q.specialtyId) return specialtyHref(q.specialtyId, cityId, { video: video ? "1" : undefined });
  return searchPageHref({ q: q.clinicType ? undefined : q.q, cityId, type: q.clinicType, video });
}
