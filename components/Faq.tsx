"use client";

import Link from "next/link";
import { pagesDicts } from "@/lib/pagesText";
import { paths } from "@/lib/routes";
import { useApp } from "./AppContext";
import { ArrowRightIcon, PlusIcon } from "./Icons";

export function Faq() {
  const { t, lang } = useApp();
  return (
    <section className="section section--mist" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <div className="stack">
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 id="faq-title" className="h2">
            {t.faq.title}
          </h2>
          <p className="muted">{t.faq.lede}</p>
          <Link className="link" href={paths.help}>
            {pagesDicts[lang].moreFaq}
            <ArrowRightIcon width={18} height={18} />
          </Link>
        </div>
        <div className="faq">
          {t.faq.items.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <PlusIcon width={20} height={20} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
