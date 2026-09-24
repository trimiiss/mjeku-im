import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { HelpView } from "@/components/pages/HelpView";
import { getDirectory } from "@/lib/directory";
import { dayKey } from "@/lib/format";
import { currentLang } from "@/lib/lang";
import { pagesDicts } from "@/lib/pagesText";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = pagesDicts[await currentLang()].help;
  return { title: `${h.title} | Mjeku.Im`, description: h.lede };
}

export default async function HelpPage() {
  const [lang, directory] = await Promise.all([currentLang(), getDirectory()]);
  return (
    <PageShell lang={lang} directory={directory} todayKey={dayKey(Date.now())}>
      <HelpView />
    </PageShell>
  );
}
