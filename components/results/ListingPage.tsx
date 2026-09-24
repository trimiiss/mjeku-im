import type { Metadata } from "next";
import type { Listing } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { listingDescription, listingTitle, parseFilters, type Base } from "@/lib/listing";
import type { City, Lang, Query, Specialty } from "@/lib/types";
import { PageShell } from "../PageShell";
import { ResultsView } from "./ResultsView";

export type SearchParams = Record<string, string | string[] | undefined>;

/** Server side of every listing page: header and footer around the results view. */
export function ListingPage({
  lang,
  listing,
  base,
  params,
  initialQuery,
}: {
  lang: Lang;
  listing: Listing;
  base: Base;
  params: SearchParams;
  initialQuery: Query;
}) {
  return (
    <PageShell lang={lang} directory={listing.directory} todayKey={dayKey(Date.now())} initialQuery={initialQuery}>
      <ResultsView base={base} nextFree={listing.nextFree} initialFilters={parseFilters(params)} />
    </PageShell>
  );
}

export function listingMetadata(base: Base, lang: Lang, specialty?: Specialty, city?: City): Metadata {
  const title = `${listingTitle(base, lang, specialty, city)} | Mjeku.Im`;
  const description = listingDescription(base, lang, specialty, city);
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: lang === "en" ? "en_GB" : "sq_XK" },
    // The demo practitioners are fictional, so keep these pages out of search engines for now.
    robots: { index: false, follow: true },
  };
}
