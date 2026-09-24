import type { Metadata } from "next";
import { ListingPage, listingMetadata, type SearchParams } from "@/components/results/ListingPage";
import { currentLang } from "@/lib/lang";
import type { Base } from "@/lib/listing";
import { loadListing } from "@/lib/serverData";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

const base: Base = { kind: "video", video: true };

export async function generateMetadata(): Promise<Metadata> {
  return listingMetadata(base, await currentLang());
}

/** /konsultime-video: how video consultations work, then every doctor who offers them. */
export default async function VideoPage({ searchParams }: Props) {
  const [sp, lang, listing] = await Promise.all([searchParams, currentLang(), loadListing()]);
  return <ListingPage lang={lang} listing={listing} base={base} params={sp} initialQuery={{ q: "", city: "", mode: "video" }} />;
}
