import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage, listingMetadata, type SearchParams } from "@/components/results/ListingPage";
import { currentLang } from "@/lib/lang";
import type { Base } from "@/lib/listing";
import { specialtyIdFromSlug } from "@/lib/routes";
import { specialtyName } from "@/lib/search";
import { loadListed, loadListing } from "@/lib/serverData";

// Free slots change all the time, so render on every request.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ specialty: string }>; searchParams: Promise<SearchParams> };

/** /stomatolog: every dentist in Kosovo, like OneDoc's /en/physiotherapist. */
async function resolve({ params, searchParams }: Props) {
  // Unknown addresses (e.g. /robots.txt) stop here, before any database call.
  const id = specialtyIdFromSlug((await params).specialty);
  if (!id) return null;
  const [sp, lang, listing, listed] = await Promise.all([searchParams, currentLang(), loadListing(), loadListed(id)]);
  const specialty = listing.directory.specialties.find((s) => s.id === id);
  if (!specialty) return null;
  const base: Base = { kind: "specialty", specialtyId: specialty.id, video: sp.video === "1" };
  return { sp, lang, listing, listed, specialty, base };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await resolve(props);
  return r ? listingMetadata(r.base, r.lang, r.specialty) : { title: "Mjeku.Im" };
}

export default async function SpecialtyPage(props: Props) {
  const r = await resolve(props);
  if (!r) notFound();
  const { sp, lang, listing, listed, specialty, base } = r;
  const label = specialtyName(specialty, lang);
  return (
    <ListingPage
      lang={lang}
      listing={listing}
      listed={listed}
      base={base}
      params={sp}
      initialQuery={{ q: label, label, specialtyId: specialty.id, city: "", mode: base.video ? "video" : "in_person" }}
    />
  );
}
