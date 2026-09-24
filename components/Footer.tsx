"use client";

import Link from "next/link";
import { paths, searchPageHref, specialtyHref } from "@/lib/routes";
import { specialtyName } from "@/lib/search";
import { clinicTypes, expertise } from "@/lib/taxonomy";
import type { Lang } from "@/lib/types";
import { useApp } from "./AppContext";
import { Logo } from "./Logo";

const socials = ["Facebook", "LinkedIn", "Instagram", "X", "YouTube"];

type ColumnItem = { key: string; label: string; href: string };

function Column({ title, all, items }: { title: string; all: ColumnItem; items: ColumnItem[] }) {
  return (
    <div className="footer-col">
      <h3>{title}</h3>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <Link href={it.href}>{it.label}</Link>
          </li>
        ))}
        <li>
          <Link href={all.href} className="footer-all">
            {all.label}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function Footer() {
  const { t, lang, setLang, dir, notify } = useApp();
  const f = t.footer;
  const soon = (what: string) => () => notify(t.common.soonTitle(what), t.common.soonBody);

  const specialists = dir.specialties
    .slice(0, 8)
    .map((s) => ({ key: s.id, label: specialtyName(s, lang), href: specialtyHref(s.id) }));
  const services = expertise.slice(0, 8).map((e) => ({ key: e.id, label: e[lang], href: searchPageHref({ q: e[lang] }) }));
  const institutions = Array.from(new Set(dir.clinics.map((c) => c.type)))
    .slice(0, 8)
    .map((type) => ({ key: type, label: clinicTypes[type]?.[lang] ?? type, href: searchPageHref({ type }) }));

  const langs: { code: Lang; name: string }[] = [
    { code: "sq", name: "Shqip" },
    { code: "en", name: "English" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href={paths.home} className="brand" aria-label={t.nav.home}>
              <Logo />
            </Link>
            <p>{f.tagline}</p>
            <p className="muted small">{f.about}</p>
          </div>

          <div className="footer-col">
            <h3>{f.company}</h3>
            <ul>
              <li>
                <Link href={paths.pros}>{f.links.pros}</Link>
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
                <Link href="/#privacy">{f.links.privacy}</Link>
              </li>
              <li>
                <button type="button" onClick={soon(f.links.cookies)}>
                  {f.links.cookies}
                </button>
              </li>
              <li>
                <Link href={paths.help}>{f.links.help}</Link>
              </li>
            </ul>
          </div>

          <Column title={f.specialists} all={{ key: "all", label: f.allSpecialists, href: paths.specialties }} items={specialists} />
          <Column
            title={f.expertise}
            all={{ key: "all", label: f.allExpertise, href: `${paths.specialties}#sherbimet` }}
            items={services}
          />
          <Column
            title={f.institutions}
            all={{ key: "all", label: f.allInstitutions, href: `${paths.specialties}#institucionet` }}
            items={institutions}
          />
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
