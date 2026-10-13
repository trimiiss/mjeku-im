import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SpecialtiesView } from "@/components/pages/SpecialtiesView";
import { getDirectory, getListedCounts } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { currentLang } from "@/lib/lang";
import { pagesDicts } from "@/lib/pagesText";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const sp = pagesDicts[await currentLang()].specialtiesPage;
  return { title: `${sp.title} | Mjeku.Im`, description: sp.lede };
}

export default async function SpecialtiesPage() {
  const [lang, directory, listedCounts] = await Promise.all([currentLang(), getDirectory(), getListedCounts()]);
  return (
    <PageShell lang={lang} directory={directory} todayKey={dayKey(Date.now())}>
      <SpecialtiesView listedCounts={listedCounts} />
    </PageShell>
  );
}
