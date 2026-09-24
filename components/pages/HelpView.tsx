"use client";

import Link from "next/link";
import { pagesDicts } from "@/lib/pagesText";
import { paths } from "@/lib/routes";
import { useApp } from "../AppContext";
import { ArrowRightIcon, PlusIcon, ShieldIcon, UsersIcon, VideoIcon } from "../Icons";
import { TicketIcon } from "../IconsExtra";

/** /ndihme: manage a booking, quick links and every patient question. */
export function HelpView() {
  const { t, lang, setManageOpen } = useApp();
  const h = pagesDicts[lang].help;

  return (
    <div className="listing">
      <div className="profile-top listing-top">
        <div className="container">
          <nav className="crumbs" aria-label={lang === "sq" ? "Vendndodhja në faqe" : "Breadcrumb"}>
            <ol>
              <li>
                <Link href={paths.home}>Mjeku.Im</Link>
              </li>
              <li aria-current="page">{t.nav.help}</li>
            </ol>
          </nav>
          <h1 className="listing-title">{h.title}</h1>
          <p className="lede">{h.lede}</p>
        </div>
      </div>

      <div className="container listing-body">
        <ul className="help-cards">
          <li className="help-card">
            <span className="fact-ico" aria-hidden="true">
              <TicketIcon width={20} height={20} />
            </span>
            <h2>{h.manageTitle}</h2>
            <p>{h.manageText}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setManageOpen(true)}>
              {h.manageCta}
            </button>
          </li>
          <li className="help-card">
            <span className="fact-ico" aria-hidden="true">
              <VideoIcon width={20} height={20} />
            </span>
            <h2>{h.videoTitle}</h2>
            <p>{h.videoText}</p>
            <Link className="link" href={paths.video}>
              {h.videoCta}
              <ArrowRightIcon width={18} height={18} />
            </Link>
          </li>
          <li className="help-card">
            <span className="fact-ico" aria-hidden="true">
              <ShieldIcon width={20} height={20} />
            </span>
            <h2>{h.privacyTitle}</h2>
            <p>{h.privacyText}</p>
            <Link className="link" href="/#privacy">
              {h.privacyCta}
              <ArrowRightIcon width={18} height={18} />
            </Link>
          </li>
        </ul>

        <section className="help-faq" aria-labelledby="help-faq-title">
          <h2 id="help-faq-title" className="lblock-title">
            {h.faqTitle}
          </h2>
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
        </section>

        <div className="help-pro">
          <span className="fact-ico" aria-hidden="true">
            <UsersIcon width={20} height={20} />
          </span>
          <div>
            <h2>{h.prosTitle}</h2>
            <p>{h.prosText}</p>
          </div>
          <Link className="btn btn-outline btn-sm" href={paths.pros}>
            {h.prosCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
