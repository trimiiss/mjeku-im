"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { ChevronDownIcon, CloseIcon, GlobeIcon, MenuIcon, SearchIcon } from "./Icons";
import { useSearch } from "./SearchContext";

const languages = [
  { code: "EN", name: "English", live: true },
  { code: "SQ", name: "Shqip", live: false },
  { code: "DE", name: "Deutsch", live: false },
  { code: "FR", name: "Français", live: false },
  { code: "IT", name: "Italiano", live: false },
];

function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button
        type="button"
        className="btn btn-ghost btn-sm lang-btn"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <GlobeIcon width={18} height={18} />
        EN
        <ChevronDownIcon width={16} height={16} />
      </button>
      {open && (
        <ul className="lang-menu" aria-label="Language">
          {languages.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                aria-current={l.live ? "true" : undefined}
                aria-disabled={!l.live}
                onClick={() => l.live && setOpen(false)}
              >
                <span>
                  <b>{l.code}</b> {l.name}
                </span>
                {l.live ? <span className="lang-on">Current</span> : <span className="soon">Soon</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const { focusSearch, notify } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);

  const signIn = () => {
    setMenuOpen(false);
    notify("Sign in opens at launch", `Patient accounts for ${site.fullName} aren't live in this preview yet.`);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label={`${site.fullName} home`}>
          <Logo />
        </a>

        <nav className="main-nav" aria-label="Main">
          <button type="button" onClick={focusSearch}>
            <SearchIcon width={17} height={17} />
            Search
          </button>
          <a href="#video">Video consultations</a>
          <a href="#pro">I&apos;m a healthcare professional</a>
          <a href="#faq">Help centre</a>
        </nav>

        <div className="header-actions">
          <LanguageMenu />
          <button type="button" className="btn btn-outline btn-sm signin" onClick={signIn}>
            Sign in
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon width={20} height={20} /> : <MenuIcon width={20} height={20} />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="container mobile-nav" aria-label="Mobile">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              focusSearch();
            }}
          >
            Search
          </button>
          <a href="#video" onClick={closeMenu}>
            Video consultations
          </a>
          <a href="#pro" onClick={closeMenu}>
            I&apos;m a healthcare professional
          </a>
          <a href="#faq" onClick={closeMenu}>
            Help centre
          </a>
          <button type="button" className="btn btn-primary" onClick={signIn}>
            Sign in
          </button>
        </nav>
      )}
    </header>
  );
}
