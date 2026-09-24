import { AppPromo } from "@/components/AppPromo";
import { AvailableToday } from "@/components/AvailableToday";
import { Directory } from "@/components/Directory";
import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { ForPractitioners } from "@/components/ForPractitioners";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchProvider } from "@/components/SearchContext";
import { Security } from "@/components/Security";
import { VideoConsult } from "@/components/VideoConsult";

export default function Home() {
  return (
    <SearchProvider>
      <a className="skip" href="#main">
        Skip to content
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
    </SearchProvider>
  );
}
