"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { paths } from "@/lib/routes";
import type { Lang } from "@/lib/types";
import { useApp } from "./AppContext";
import { CloseIcon, MenuIcon, SearchIcon } from "./Icons";
import { TicketIcon } from "./IconsExtra";
import { Logo } from "./Logo";

function LangToggle() {
  const { lang, setLang, t } = useApp();
  const options: { code: Lang; label: string; name: string }[] = [
    { code: "sq", label: "SQ", name: "Shqip" },
    { code: "en", label: "EN", name: "English" },
  ];
  return (
    <div className="lang-toggle" role="group" aria-label={t.nav.language}>
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          lang={o.code}
          aria-pressed={lang === o.code}
          aria-label={o.name}
          onClick={() => setLang(o.code)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t, setManageOpen } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const myBooking = () => {
    close();
    setManageOpen(true);
  };

  const links = [
    { href: paths.search, label: t.nav.search, search: true },
    { href: paths.video, label: t.nav.video },
    { href: paths.pros, label: t.nav.pros },
    { href: paths.help, label: t.nav.help },
  ];
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <>
      <p className="demo-banner">{t.demoBanner}</p>
      <header className="site-header">
        <div className="container header-inner">
          <Link href={paths.home} className="brand" aria-label={t.nav.home}>
            <Logo />
          </Link>

          <nav className="main-nav" aria-label="Main">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                {l.search && <SearchIcon width={17} height={17} />}
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <LangToggle />
            <button type="button" className="btn btn-outline btn-sm signin" onClick={myBooking}>
              <TicketIcon />
              {t.nav.myBooking}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm menu-btn"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <CloseIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
              <span className="sr-only">{t.nav.menu}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" className="container mobile-nav" aria-label={t.nav.menu}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={current(l.href)} onClick={close}>
                {l.label}
              </Link>
            ))}
            <button type="button" className="btn btn-primary" onClick={myBooking}>
              <TicketIcon />
              {t.nav.myBooking}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
