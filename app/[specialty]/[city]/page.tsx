import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage, listingMetadata, type SearchParams } from "@/components/results/ListingPage";
import { currentLang } from "@/lib/lang";
import type { Base } from "@/lib/listing";
import { specialtyIdFromSlug } from "@/lib/routes";
import { cityName, specialtyName } from "@/lib/search";
import { loadListed, loadListing } from "@/lib/serverData";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ specialty: string; city: string }>; searchParams: Promise<SearchParams> };

/** /stomatolog/prishtine: dentists in one city, like OneDoc's /en/physiotherapist/zurich. */
async function resolve({ params, searchParams }: Props) {
  const { specialty: slug, city: cityId } = await params;
  const id = specialtyIdFromSlug(slug);
  if (!id) return null;
  const [sp, lang, listing, listed] = await Promise.all([searchParams, currentLang(), loadListing(), loadListed(id, cityId)]);
  const specialty = listing.directory.specialties.find((s) => s.id === id);
  const city = listing.directory.cities.find((c) => c.id === cityId);
  if (!specialty || !city) return null;
  const base: Base = { kind: "specialty", specialtyId: specialty.id, cityId: city.id, video: sp.video === "1" };
  return { sp, lang, listing, listed, specialty, city, base };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await resolve(props);
  return r ? listingMetadata(r.base, r.lang, r.specialty, r.city) : { title: "Mjeku.Im" };
}

export default async function SpecialtyCityPage(props: Props) {
  const r = await resolve(props);
  if (!r) notFound();
  const { sp, lang, listing, listed, specialty, city, base } = r;
  const label = specialtyName(specialty, lang);
  return (
    <ListingPage
      lang={lang}
      listing={listing}
      listed={listed}
      base={base}
      params={sp}
      initialQuery={{
        q: label,
        label,
        specialtyId: specialty.id,
        city: base.video ? "" : cityName(city, lang),
        cityId: base.video ? undefined : city.id,
        mode: base.video ? "video" : "in_person",
      }}
    />
  );
}
