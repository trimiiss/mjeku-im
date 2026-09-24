"use client";

import { footerExpertises, footerInstitutions, footerSpecialties, type DirectoryItem } from "@/lib/data";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { useSearch } from "./SearchContext";

const socials = ["Facebook", "LinkedIn", "Instagram", "X", "YouTube"];

function SearchColumn({ title, items, all }: { title: string; items: DirectoryItem[]; all: string }) {
  const { runSearch } = useSearch();
  return (
    <div className="footer-col">
      <h3>{title}</h3>
      <ul>
        {items.map((it) => (
          <li key={it.label}>
            <button type="button" onClick={() => runSearch({ q: it.label, city: "", mode: "in-person" })}>
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
  const { notify } = useSearch();
  const soon = (what: string) => () => notify(`${what} is coming soon`, `This page isn't part of the ${site.fullName} preview yet.`);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#top" className="brand" aria-label={`${site.fullName} home`}>
              <Logo />
            </a>
            <p>{site.tagline}</p>
            <p className="muted small">
              Book doctors, dentists and therapists across {site.country}, in person or by video.
            </p>
          </div>

          <div className="footer-col">
            <h3>{site.fullName}</h3>
            <ul>
              <li>
                <a href="#pro">I&apos;m a healthcare professional</a>
              </li>
              <li>
                <button type="button" onClick={soon("About us")}>
                  About us
                </button>
              </li>
              <li>
                <button type="button" onClick={soon("The press page")}>
                  Press
                </button>
              </li>
              <li>
                <button type="button" onClick={soon("The careers page")}>
                  Careers
                </button>
              </li>
              <li>
                <a href="#privacy">Privacy centre</a>
              </li>
              <li>
                <button type="button" onClick={soon("Cookie settings")}>
                  Cookie settings
                </button>
              </li>
              <li>
                <a href="#faq">Help centre</a>
              </li>
            </ul>
          </div>

          <SearchColumn title="Find a specialist" items={footerSpecialties} all="All specialties" />
          <SearchColumn title="Find an expertise" items={footerExpertises} all="All expertise" />
          <SearchColumn title="Find an institution" items={footerInstitutions} all="All institutions" />
        </div>

        <div className="footer-mid">
          <div className="footer-langs">
            <span className="footer-mini">Languages</span>
            <span aria-current="true">English</span>
            <span>Shqip</span>
            <span>Deutsch</span>
            <span>Français</span>
            <span>Italiano</span>
          </div>
          <div className="footer-social">
            <span className="footer-mini">Follow us</span>
            {socials.map((s) => (
              <button key={s} type="button" onClick={soon(`Our ${s} page`)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </p>
          <div className="footer-legal">
            <button type="button" onClick={soon("Terms of use")}>
              Terms of use
            </button>
            <button type="button" onClick={soon("The legal notice")}>
              Legal notice
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
