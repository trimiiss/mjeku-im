import { redirect } from "next/navigation";
import { AppPromo } from "@/components/AppPromo";
import { AvailableToday } from "@/components/AvailableToday";
import { Directory } from "@/components/Directory";
import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { ForPractitioners } from "@/components/ForPractitioners";
import { Hero } from "@/components/Hero";
import { PageShell } from "@/components/PageShell";
import { Security } from "@/components/Security";
import { VideoConsult } from "@/components/VideoConsult";
import { getDirectory } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { currentLang } from "@/lib/lang";
import { searchPageHref, specialtyHref } from "@/lib/routes";
import { clinicTypes } from "@/lib/taxonomy";
import type { Directory as Dir } from "@/lib/types";

// Availability changes all the time, so render on every request.
export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;

/** Search links from the earlier single-page version (/?s=dentist&c=prishtine) now have their own pages. */
function legacyHref(params: Params, d: Dir) {
  const get = (k: string) => {
    const v = params[k];
    return typeof v === "string" ? v.trim().slice(0, 80) : "";
  };
  const s = get("s");
  const c = d.cities.some((x) => x.id === get("c")) ? get("c") : undefined;
  const t = clinicTypes[get("t")] ? get("t") : undefined;
  const q = get("q") || get("l");
  const video = get("m") === "video";
  if (s && d.specialties.some((x) => x.id === s)) return specialtyHref(s, video ? undefined : c, { video: video ? "1" : undefined });
  if (c || t || q || video) return searchPageHref({ q, cityId: c, type: t, video });
  return null;
}

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const [lang, directory, params] = await Promise.all([currentLang(), getDirectory(), searchParams]);
  const legacy = legacyHref(params, directory);
  if (legacy) redirect(legacy);

  return (
    <PageShell lang={lang} directory={directory} todayKey={dayKey(Date.now())}>
      <Hero />
      <Features />
      <Security />
      <VideoConsult />
      <AvailableToday />
      <AppPromo />
      <ForPractitioners />
      <Directory />
      <Faq />
    </PageShell>
  );
}
