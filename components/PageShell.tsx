import type { ReactNode } from "react";
import type { Directory, Lang, Query } from "@/lib/types";
import { AppProvider } from "./AppContext";
import { BookingDialog } from "./BookingDialog";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ManageBooking } from "./ManageBooking";

/** Header, footer and the booking dialogs around every page. */
export function PageShell({
  lang,
  directory,
  todayKey,
  initialQuery,
  children,
}: {
  lang: Lang;
  directory: Directory;
  todayKey: string;
  initialQuery?: Query | null;
  children: ReactNode;
}) {
  return (
    <AppProvider initialLang={lang} directory={directory} todayKey={todayKey} initialQuery={initialQuery}>
      <a className="skip" href="#main">
        {lang === "sq" ? "Kalo te përmbajtja" : "Skip to content"}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <BookingDialog />
      <ManageBooking />
    </AppProvider>
  );
}
