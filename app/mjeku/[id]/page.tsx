import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PageShell } from "@/components/PageShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { getProfile } from "@/lib/directory";
import { dayKey, localNow } from "@/lib/format";
import { currentLang } from "@/lib/lang";
import { bioParagraphs } from "@/lib/profileText";
import { cityName, displayName, specialtyName } from "@/lib/search";

// Free slots change all the time, so render on every request.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// generateMetadata and the page share one database round trip per request.
const loadProfile = cache(getProfile);

/** The id from the address, or "" when it isn't valid URL encoding. */
function decodeId(id: string) {
  try {
    return decodeURIComponent(id);
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [lang, profile] = await Promise.all([currentLang(), loadProfile(decodeId(id))]);
  if (!profile) return { title: "Mjeku.Im" };

  const { directory: d, practitioner: p } = profile;
  const specialty = specialtyName(d.specialties.find((s) => s.id === p.specialty_id), lang, p.gender);
  const clinic = d.clinics.find((c) => c.id === p.clinic_id);
  const city = cityName(d.cities.find((c) => c.id === clinic?.city_id), lang);
  const title = `${displayName(p)} – ${specialty}, ${city} | Mjeku.Im`;
  const description = bioParagraphs(p, specialty, clinic?.name ?? "", city, lang)[0];

  return {
    title,
    description,
    openGraph: { title, description, type: "profile", locale: lang === "en" ? "en_GB" : "sq_XK" },
    // The demo practitioners are fictional, so keep their pages out of search engines.
    robots: { index: false, follow: true },
  };
}

export default async function PractitionerPage({ params }: Props) {
  const { id } = await params;
  const [lang, profile] = await Promise.all([currentLang(), loadProfile(decodeId(id))]);
  if (!profile) notFound();

  const now = Date.now();
  return (
    <PageShell lang={lang} directory={profile.directory} todayKey={dayKey(now)}>
      <ProfileView practitioner={profile.practitioner} schedules={profile.schedules} clock={localNow(now)} />
    </PageShell>
  );
}
