import type { Metadata, Viewport } from "next";
import { Figtree, Gabarito } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// next/font downloads these at build time and serves them from the site itself,
// so visitors' browsers never contact Google (good for nFADP/GDPR).
const display = Gabarito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.fullName} | Book a doctor in ${site.country}`,
  description: site.description,
  openGraph: {
    title: `${site.fullName} | Book a doctor in ${site.country}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#89CFF0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
