"use client";

import { pagesDicts } from "@/lib/pagesText";
import { useApp } from "../AppContext";
import { ForPractitioners } from "../ForPractitioners";
import { PlusIcon } from "../Icons";

/** /per-mjeket: what Mjeku.Im Pro offers practices, how to start and common questions. */
export function ProsView() {
  const { lang } = useApp();
  const pp = pagesDicts[lang].prosPage;

  return (
    <>
      <ForPractitioners asPage />

      <section className="section" aria-labelledby="pro-steps-title">
        <div className="container">
          <div className="section-head">
            <h2 id="pro-steps-title" className="h2">
              {pp.stepsTitle}
            </h2>
          </div>
          <ol className="pro-steps">
            {pp.steps.map((s, i) => (
              <li key={s.title}>
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--mist" aria-labelledby="pro-faq-title">
        <div className="container faq-wrap">
          <div className="stack">
            <h2 id="pro-faq-title" className="h2">
              {pp.faqTitle}
            </h2>
          </div>
          <div className="faq">
            {pp.faq.map((f) => (
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
    </>
  );
}
