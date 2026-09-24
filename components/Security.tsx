"use client";

import { useApp } from "./AppContext";
import { ArrowRightIcon, CheckIcon, LockIcon, ServerIcon, ShieldIcon, UsersIcon } from "./Icons";

const pointIcons = [LockIcon, ServerIcon, UsersIcon];
const barWidths = ["86%", "62%", "74%", "48%"];

export function Security() {
  const { t } = useApp();
  const s = t.security;

  return (
    <section className="section section--mist" id="privacy" aria-labelledby="privacy-title">
      <div className="container split">
        <div className="stack">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="privacy-title" className="h2">
            {s.title}
          </h2>
          <p className="lede">{s.lede}</p>
          <ul className="checklist">
            {s.points.map((p, i) => {
              const Icon = pointIcons[i];
              return (
                <li key={p}>
                  <span className="tick">
                    <Icon width={16} height={16} />
                  </span>
                  {p}
                </li>
              );
            })}
          </ul>
          <a className="link" href="#faq">
            {s.link}
            <ArrowRightIcon width={18} height={18} />
          </a>
        </div>

        <div className="vault" aria-hidden="true">
          <div className="vault-card">
            <div className="vault-top">
              <span className="vault-lock">
                <ShieldIcon />
              </span>
              <div>
                <b>{s.fileTitle}</b>
                <span>{s.fileSub}</span>
              </div>
            </div>
            <div className="vault-rows">
              {s.rows.map((r, i) => (
                <div className="vault-row" key={r}>
                  <span>{r}</span>
                  <i style={{ width: barWidths[i] }} />
                </div>
              ))}
            </div>
            <div className="vault-foot">
              <span className="ch">EU</span>
              {s.stored}
              <span className="vault-ok">
                <CheckIcon width={14} height={14} />
                {s.law}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
