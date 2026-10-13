import type { Metadata, Viewport } from "next";
import { Figtree, Gabarito } from "next/font/google";
import { dictionaries } from "@/lib/i18n";
import { currentLang } from "@/lib/lang";
import "./globals.css";
import "./booking.css";
import "./profile.css";
import "./pages.css";
import "./account.css";

// next/font downloads these at build time and serves them from the site itself,
// so visitors' browsers never contact Google (good for GDPR).
const display = Gabarito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = dictionaries[await currentLang()];
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: { title: t.meta.title, description: t.meta.description, type: "website", locale: "sq_XK" },
  };
}

export const viewport: Viewport = {
  themeColor: "#89CFF0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await currentLang();
  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
