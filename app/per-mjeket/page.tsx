import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ProsView } from "@/components/pages/ProsView";
import { getDirectory } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { dictionaries } from "@/lib/i18n";
import { currentLang } from "@/lib/lang";
import { pagesDicts } from "@/lib/pagesText";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await currentLang();
  return { title: `${pagesDicts[lang].prosPage.metaTitle} | Mjeku.Im`, description: dictionaries[lang].pro.lede };
}

export default async function ProsPage() {
  const [lang, directory] = await Promise.all([currentLang(), getDirectory()]);
  return (
    <PageShell lang={lang} directory={directory} todayKey={dayKey(Date.now())}>
      <ProsView />
    </PageShell>
  );
}
