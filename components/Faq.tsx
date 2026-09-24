"use client";

import { useApp } from "./AppContext";
import { PlusIcon } from "./Icons";

export function Faq() {
  const { t } = useApp();
  return (
    <section className="section section--mist" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <div className="stack">
          <p className="eyebrow">{t.faq.eyebrow}</p>
          <h2 id="faq-title" className="h2">
            {t.faq.title}
          </h2>
          <p className="muted">{t.faq.lede}</p>
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
