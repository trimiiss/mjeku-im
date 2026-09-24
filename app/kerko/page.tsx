import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingPage, listingMetadata, type SearchParams } from "@/components/results/ListingPage";
import { currentLang } from "@/lib/lang";
import type { Base } from "@/lib/listing";
import { specialtyHref } from "@/lib/routes";
import { cityName, norm } from "@/lib/search";
import { loadListing } from "@/lib/serverData";
import { clinicTypes } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

const one = (sp: SearchParams, key: string) => {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s.trim().slice(0, 80) : "";
};

/** /kerko?q=glaukoma&qyteti=prizren: free-text search, institution types and all doctors. */
async function resolve({ searchParams }: Props) {
  const [sp, lang, listing] = await Promise.all([searchParams, currentLang(), loadListing()]);
  const d = listing.directory;
  const q = one(sp, "q");
  const city = d.cities.find((c) => c.id === one(sp, "qyteti"));
  const type = clinicTypes[one(sp, "lloji")] ? one(sp, "lloji") : undefined;
  const video = one(sp, "video") === "1";
  // Typing a specialty's exact name leads to that specialty's page.
  const specialty = q ? d.specialties.find((s) => [s.name_sq, s.name_sq_f, s.name_en].some((n) => norm(n) === norm(q))) : undefined;
  const base: Base = { kind: "search", q: q || undefined, cityId: city?.id, clinicType: type, video };
  return { sp, lang, listing, q, city, type, video, specialty, base };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { lang, city, base } = await resolve(props);
  return listingMetadata(base, lang, undefined, city);
}

export default async function SearchPage(props: Props) {
  const { sp, lang, listing, q, city, type, video, specialty, base } = await resolve(props);
  if (specialty) redirect(specialtyHref(specialty.id, video ? undefined : city?.id, { video: video ? "1" : undefined }));
  const typeLabel = type ? clinicTypes[type][lang] : undefined;
  return (
    <ListingPage
      lang={lang}
      listing={listing}
      base={base}
      params={sp}
      initialQuery={{
        q: q || typeLabel || "",
        label: typeLabel,
        clinicType: type,
        city: video || !city ? "" : cityName(city, lang),
        cityId: video ? undefined : city?.id,
        mode: video ? "video" : "in_person",
      }}
    />
  );
}
