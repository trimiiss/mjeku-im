"use client";

import { useState } from "react";
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
  const { t, focusSearch, setManageOpen, onHome, homeHref } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const myBooking = () => {
    close();
    setManageOpen(true);
  };

  return (
    <>
      <p className="demo-banner">{t.demoBanner}</p>
      <header className="site-header">
        <div className="container header-inner">
          <a href={onHome ? "#top" : "/"} className="brand" aria-label={t.nav.home}>
            <Logo />
          </a>

          <nav className="main-nav" aria-label="Main">
            <button type="button" onClick={focusSearch}>
              <SearchIcon width={17} height={17} />
              {t.nav.search}
            </button>
            <a href={homeHref("#video")}>{t.nav.video}</a>
            <a href={homeHref("#pro")}>{t.nav.pros}</a>
            <a href={homeHref("#faq")}>{t.nav.help}</a>
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
            <button
              type="button"
              onClick={() => {
                close();
                focusSearch();
              }}
            >
              {t.nav.search}
            </button>
            <a href={homeHref("#video")} onClick={close}>
              {t.nav.video}
            </a>
            <a href={homeHref("#pro")} onClick={close}>
              {t.nav.pros}
            </a>
            <a href={homeHref("#faq")} onClick={close}>
              {t.nav.help}
            </a>
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
