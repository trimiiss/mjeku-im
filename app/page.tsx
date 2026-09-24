import { cookies } from "next/headers";
import { AppProvider } from "@/components/AppContext";
import { AppPromo } from "@/components/AppPromo";
import { AvailableToday } from "@/components/AvailableToday";
import { BookingDialog } from "@/components/BookingDialog";
import { Directory } from "@/components/Directory";
import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { ForPractitioners } from "@/components/ForPractitioners";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ManageBooking } from "@/components/ManageBooking";
import { Security } from "@/components/Security";
import { VideoConsult } from "@/components/VideoConsult";
import { getDirectory } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { parseQuery } from "@/lib/search";
import type { Lang } from "@/lib/types";

// Availability changes all the time, so render on every request.
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lang: Lang = (await cookies()).get("lang")?.value === "en" ? "en" : "sq";
  const [directory, params] = await Promise.all([getDirectory(), searchParams]);
  const todayKey = dayKey(Date.now());
  // Links such as /?s=dentist&c=prishtine (from a profile's breadcrumbs) open with that search applied.
  const initialQuery = parseQuery(params, directory, lang);

  return (
    <AppProvider initialLang={lang} directory={directory} todayKey={todayKey} initialQuery={initialQuery}>
      <a className="skip" href="#main">
        {lang === "sq" ? "Kalo te përmbajtja" : "Skip to content"}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <Security />
        <VideoConsult />
        <AvailableToday />
        <AppPromo />
        <ForPractitioners />
        <Directory />
        <Faq />
      </main>
      <Footer />
      <BookingDialog />
      <ManageBooking />
    </AppProvider>
  );
}
