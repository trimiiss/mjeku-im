import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";
import { PageShell } from "@/components/PageShell";
import { accountDicts } from "@/lib/accountText";
import { getDirectory, getListedPractice } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { currentLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  return { title: `${accountDicts[lang].metaTitle} | Mjeku.Im`, description: accountDicts[lang].lede, robots: { index: false, follow: false } };
}

/** /llogaria: practitioners sign up or log in, edit their profile and hours, and see their bookings. */
export default async function AccountPage({ searchParams }: Props) {
  const sp = await searchParams;
  // /llogaria?praktika=<id>: started from "This is my practice" on a listing page.
  const claimId = typeof sp.praktika === "string" ? sp.praktika.slice(0, 120) : "";
  const [lang, directory, claim] = await Promise.all([currentLang(), getDirectory(), claimId ? getListedPractice(claimId) : null]);
  return (
    <PageShell lang={lang} directory={directory} todayKey={dayKey(Date.now())}>
      <AccountView claim={claim} />
    </PageShell>
  );
}
