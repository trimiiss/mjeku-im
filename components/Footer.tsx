"use client";

import { specialtyName } from "@/lib/search";
import { clinicTypes, expertise } from "@/lib/taxonomy";
import type { Lang, Query } from "@/lib/types";
import { useApp } from "./AppContext";
import { Logo } from "./Logo";

const socials = ["Facebook", "LinkedIn", "Instagram", "X", "YouTube"];
const base: Partial<Query> = { city: "", cityId: undefined, clinicType: undefined, specialtyId: undefined, mode: "in_person" };

function Column({ title, all, items }: { title: string; all: string; items: { key: string; label: string; query: Partial<Query> }[] }) {
  const { runSearch } = useApp();
  return (
    <div className="footer-col">
      <h3>{title}</h3>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <button type="button" onClick={() => runSearch(it.query)}>
              {it.label}
            </button>
          </li>
        ))}
        <li>
          <a href="#directory" className="footer-all">
            {all}
          </a>
        </li>
      </ul>
    </div>
  );
}

export function Footer() {
  const { t, lang, setLang, dir, notify } = useApp();
  const f = t.footer;
  const soon = (what: string) => () => notify(t.common.soonTitle(what), t.common.soonBody);

  const specialists = dir.specialties.slice(0, 8).map((s) => {
    const label = specialtyName(s, lang);
    return { key: s.id, label, query: { ...base, q: label, label, specialtyId: s.id } };
  });
  const services = expertise.slice(0, 8).map((e) => ({
    key: e.id,
    label: e[lang],
    query: { ...base, q: e[lang], label: e[lang], specialtyId: e.specialtyId },
  }));
  const institutions = Array.from(new Set(dir.clinics.map((c) => c.type)))
    .slice(0, 8)
    .map((type) => {
      const label = clinicTypes[type]?.[lang] ?? type;
      return { key: type, label, query: { ...base, q: label, label, clinicType: type } };
    });

  const langs: { code: Lang; name: string }[] = [
    { code: "sq", name: "Shqip" },
    { code: "en", name: "English" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#top" className="brand" aria-label={t.nav.home}>
              <Logo />
            </a>
            <p>{f.tagline}</p>
            <p className="muted small">{f.about}</p>
          </div>

          <div className="footer-col">
            <h3>{f.company}</h3>
            <ul>
              <li>
                <a href="#pro">{f.links.pros}</a>
              </li>
              <li>
                <button type="button" onClick={soon(f.links.about)}>
                  {f.links.about}
                </button>
              </li>
              <li>
                <button type="button" onClick={soon(f.links.press)}>
                  {f.links.press}
                </button>
              </li>
              <li>
                <button type="button" onClick={soon(f.links.careers)}>
                  {f.links.careers}
                </button>
              </li>
              <li>
                <a href="#privacy">{f.links.privacy}</a>
              </li>
              <li>
                <button type="button" onClick={soon(f.links.cookies)}>
                  {f.links.cookies}
                </button>
              </li>
              <li>
                <a href="#faq">{f.links.help}</a>
              </li>
            </ul>
          </div>

          <Column title={f.specialists} all={f.allSpecialists} items={specialists} />
          <Column title={f.expertise} all={f.allExpertise} items={services} />
          <Column title={f.institutions} all={f.allInstitutions} items={institutions} />
        </div>

        <div className="footer-mid">
          <div className="footer-langs">
            <span className="footer-mini">{f.language}</span>
            {langs.map((l) => (
              <button
                key={l.code}
                type="button"
                lang={l.code}
                aria-current={lang === l.code ? "true" : undefined}
                onClick={() => setLang(l.code)}
              >
                {l.name}
              </button>
            ))}
          </div>
          <div className="footer-social">
            <span className="footer-mini">{f.follow}</span>
            {socials.map((s) => (
              <button key={s} type="button" onClick={soon(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Mjeku.Im. {f.rights}
          </p>
          <div className="footer-legal">
            <button type="button" onClick={soon(f.terms)}>
              {f.terms}
            </button>
            <button type="button" onClick={soon(f.legal)}>
              {f.legal}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
