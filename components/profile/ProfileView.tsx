"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { dayName, formatPrice } from "@/lib/format";
import {
  bioParagraphs,
  hoursSummary,
  joinList,
  openStatus,
  profileDicts,
  specialtyInfo,
  weeklyHours,
} from "@/lib/profileText";
import { paths, specialtyHref } from "@/lib/routes";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import { languageNames } from "@/lib/taxonomy";
import type { Practitioner, ProfileDetails, Schedule } from "@/lib/types";
import { useApp } from "../AppContext";
import {
  CheckIcon,
  ChevronDownIcon,
  HeartChatIcon,
  HouseCrossIcon,
  LanguagesIcon,
  PhoneIcon,
  PinIcon,
  PlusIcon,
  StethoscopeIcon,
  SunIcon,
  UsersIcon,
  VideoIcon,
  WalletIcon,
} from "../Icons";
import { AwardIcon, ClockIcon, EuroIcon, ExternalIcon, FlaskIcon } from "../IconsExtra";
import { BookingWidget } from "./BookingWidget";

type Clock = { key: string; weekday: number; minutes: number };

const SECTIONS = ["summary", "map", "presentation", "questions"] as const;
type SectionId = (typeof SECTIONS)[number];

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="fact">
      <span className="fact-ico" aria-hidden="true">
        {icon}
      </span>
      <div className="fact-body">
        <h3>{label}</h3>
        {children}
      </div>
    </div>
  );
}

/** Sticky in-page tabs that follow the scroll position. */
function ProfileTabs() {
  const { lang } = useApp();
  const tabs = profileDicts[lang].tabs;
  const labels: Record<SectionId, string> = {
    summary: tabs.summary,
    map: tabs.map,
    presentation: tabs.presentation,
    questions: tabs.faq,
  };
  const [active, setActive] = useState<SectionId>("summary");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = document.querySelector(".profile-tabs");
      const line = (nav?.getBoundingClientRect().bottom ?? 120) + 24;
      let current: SectionId = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className="profile-tabs" aria-label={profileDicts[lang].sectionsLabel}>
      <div className="container">
        <ul>
          {SECTIONS.map((id) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? "true" : undefined}>
                {labels[id]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** On small screens, a "Book" button stays at the bottom once the booking box has scrolled away. */
function MobileBookBar({ label }: { label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById("book");
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`book-bar${show ? " is-shown" : ""}`} aria-hidden={!show}>
      <a href="#book" className="btn btn-primary btn-block" tabIndex={show ? undefined : -1}>
        {label}
      </a>
    </div>
  );
}

export function ProfileView({
  practitioner: p,
  schedules,
  clock,
  details,
}: {
  practitioner: Practitioner;
  schedules: Schedule[];
  clock: Clock;
  details: ProfileDetails;
}) {
  const { t, lang, idx } = useApp();
  const pt = profileDicts[lang];
  const [bioOpen, setBioOpen] = useState(false);

  const specialty = idx.specialtyById.get(p.specialty_id);
  const clinic = idx.clinicById.get(p.clinic_id);
  const city = clinic ? idx.cityById.get(clinic.city_id) : undefined;
  const cityLabel = cityName(city, lang);
  const name = displayName(p);
  const person = p.gender !== null;
  const spec = specialtyName(specialty, lang, p.gender);
  const specPlain = specialtyName(specialty, lang);
  const focus = specialtyInfo[p.specialty_id]?.focus[lang] ?? [];
  const slots = idx.slotsByPractitioner.get(p.id) ?? [];
  const languages = p.languages.map((l) => languageNames[l]?.[lang] ?? l);
  // The practitioner's own text when they wrote one, otherwise one generated from the profile.
  const bio = details.about
    ? details.about.split(/\n+/).map((s) => s.trim()).filter(Boolean)
    : bioParagraphs(p, spec, clinic?.name ?? "", cityLabel, lang);
  const status = openStatus(schedules, clock, lang);
  const week = weeklyHours(schedules);
  const place = [clinic?.neighborhood, [clinic?.postal_code, cityLabel].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const price = p.price_eur !== null ? `${p.price_from ? `${t.common.from} ` : ""}${formatPrice(p.price_eur, lang)}` : null;

  const hasMap = clinic?.lat != null && clinic?.lng != null;
  const lat = clinic?.lat ?? 0;
  const lng = clinic?.lng ?? 0;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008},${lat - 0.004},${lng + 0.008},${lat + 0.004}&layer=mapnik&marker=${lat},${lng}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  const capitalized = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const faq = [
    { q: pt.faq.address(name), a: `${clinic?.name ?? ""}, ${place}.` },
    { q: pt.faq.languages(name, person), a: `${capitalized(joinList(languages, lang))}.` },
    { q: pt.faq.hours(name), a: schedules.length ? `${hoursSummary(schedules, lang)}.` : pt.closed },
    { q: pt.faq.phone(name), a: details.phone ? pt.faq.phoneIs(details.phone) : pt.faq.phoneAnswer },
    { q: pt.faq.newPatients(name), a: p.accepts_new_patients ? pt.faq.newPatientsYes(name) : pt.faq.newPatientsNo(name) },
    { q: pt.faq.specialties(name), a: `${spec}.` },
    { q: pt.faq.expertises(name), a: `${capitalized(joinList(focus.map((f) => f.charAt(0).toLowerCase() + f.slice(1)), lang))}.` },
    { q: pt.faq.consults(name), a: pt.faq.consultsAnswer(p.offers_video) },
  ];

  return (
    <div className="profile">
      <div className="profile-top">
        <div className="container">
          <nav className="crumbs" aria-label={pt.breadcrumb}>
            <ol>
              <li>
                <Link href={paths.home}>{pt.home}</Link>
              </li>
              <li>
                <Link href={specialtyHref(p.specialty_id)}>{specPlain}</Link>
              </li>
              {city && (
                <li>
                  <Link href={specialtyHref(p.specialty_id, city.id)}>{cityLabel}</Link>
                </li>
              )}
              <li aria-current="page">{name}</li>
            </ol>
          </nav>

          <header className="profile-head">
            <span className="avatar avatar--xl" aria-hidden="true">
              {person ? initials(p.full_name) : <FlaskIcon width={40} height={40} />}
            </span>
            <div className="profile-id">
              <h1>{name}</h1>
              <p className="profile-spec">{spec}</p>
              <p className="profile-where">
                <PinIcon width={17} height={17} />
                <span>
                  {clinic?.name} · {place}
                </span>
              </p>
              <div className="badges">
                {p.accepts_new_patients && (
                  <span className="badge badge--ok">
                    <CheckIcon width={14} height={14} />
                    {pt.acceptsNewShort}
                  </span>
                )}
                {p.offers_video && (
                  <span className="badge">
                    <VideoIcon width={14} height={14} />
                    {t.common.video}
                  </span>
                )}
                {p.open_saturday && (
                  <span className="badge">
                    <SunIcon width={14} height={14} />
                    {t.common.saturday}
                  </span>
                )}
                {p.years_experience ? <span className="badge">{pt.experience(p.years_experience)}</span> : null}
              </div>
              {p.self_registered && !p.verified && <p className="profile-note">{pt.unverified}</p>}
            </div>
          </header>
        </div>
      </div>

      <ProfileTabs />

      <div className="container profile-grid">
        <div className="profile-main">
          <section id="summary" className="p-section" aria-labelledby="summary-title">
            <h2 id="summary-title" className="p-title">
              {pt.tabs.summary}
            </h2>
            <div className="facts">
              <Fact icon={<UsersIcon width={20} height={20} />} label={pt.accepted}>
                <p className={p.accepts_new_patients ? "fact-ok" : undefined}>
                  {p.accepts_new_patients && <CheckIcon width={18} height={18} />}
                  {p.accepts_new_patients ? pt.acceptsNew(name) : pt.notAcceptingNew(name)}
                </p>
              </Fact>
              <Fact icon={<StethoscopeIcon width={20} height={20} />} label={pt.specialties}>
                <ul className="tags">
                  <li>{spec}</li>
                </ul>
              </Fact>
              {focus.length > 0 && (
                <Fact icon={<AwardIcon width={20} height={20} />} label={pt.expertises}>
                  <ul className="tags">
                    {focus.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </Fact>
              )}
              <Fact icon={<HeartChatIcon width={20} height={20} />} label={pt.consultTypes}>
                <ul className="tags">
                  <li>
                    <HouseCrossIcon width={16} height={16} />
                    {pt.atClinic}
                  </li>
                  {p.offers_video && (
                    <li>
                      <VideoIcon width={16} height={16} />
                      {pt.byVideo}
                    </li>
                  )}
                </ul>
              </Fact>
              {price && (
                <Fact icon={<EuroIcon width={20} height={20} />} label={pt.price}>
                  <p>
                    <b>{price}</b> {t.common.perVisit} · {t.common.minutes(p.duration_min)}
                  </p>
                </Fact>
              )}
            </div>
          </section>

          <section id="map" className="p-section" aria-labelledby="map-title">
            <h2 id="map-title" className="p-title">
              {pt.mapTitle}
            </h2>
            {hasMap && (
              <div className="map-frame">
                <iframe title={pt.mapLabel(clinic?.name ?? name)} src={mapSrc} loading="lazy" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="map-info">
              <div className="map-block">
                <h3>
                  <PinIcon width={18} height={18} />
                  {pt.address}
                </h3>
                <address>
                  <b>{clinic?.name}</b>
                  <br />
                  {details.address && (
                    <>
                      {details.address}
                      <br />
                    </>
                  )}
                  {clinic?.neighborhood && (
                    <>
                      {clinic.neighborhood}
                      <br />
                    </>
                  )}
                  {[clinic?.postal_code, cityLabel].filter(Boolean).join(" ")}
                  <br />
                  {pt.country}
                </address>
                {(details.phone || details.website) && (
                  <p className="contact-lines">
                    {details.phone && (
                      <a className="link" href={`tel:${details.phone.replace(/[^\d+]/g, "")}`}>
                        <PhoneIcon width={16} height={16} />
                        {details.phone}
                      </a>
                    )}
                    {details.website && (
                      <a className="link" href={details.website} target="_blank" rel="noopener noreferrer nofollow">
                        {pt.websiteLabel}
                        <ExternalIcon width={16} height={16} />
                      </a>
                    )}
                  </p>
                )}
                {hasMap && (
                  <a className="link" href={mapLink} target="_blank" rel="noopener noreferrer">
                    {pt.openInMaps}
                    <ExternalIcon width={16} height={16} />
                    <span className="sr-only">{lang === "sq" ? "(hapet në dritare të re)" : "(opens in a new tab)"}</span>
                  </a>
                )}
              </div>

              <div className="map-block">
                <h3>
                  <ClockIcon width={18} height={18} />
                  {pt.hours}
                </h3>
                <details className="hours">
                  <summary>
                    <span className={`hours-dot${status.open ? " is-open" : ""}`} aria-hidden="true" />
                    <span className="hours-status">{status.text}</span>
                    <ChevronDownIcon width={18} height={18} />
                  </summary>
                  <table className="hours-table">
                    <caption className="sr-only">{pt.hours}</caption>
                    <tbody>
                      {week.map((row) => (
                        <tr key={row.weekday} className={row.weekday === clock.weekday ? "is-today" : undefined}>
                          <th scope="row">
                            {dayName(row.weekday, lang)}
                            {row.weekday === clock.weekday && <span className="today-tag">{pt.todayTag}</span>}
                          </th>
                          <td>{row.ranges.length ? row.ranges.join(", ") : pt.closed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </div>
            </div>
          </section>

          <section id="presentation" className="p-section" aria-labelledby="presentation-title">
            <h2 id="presentation-title" className="p-title">
              {person ? pt.presentationTitle : pt.presentationTitlePlace}
            </h2>
            <div className={`bio${bioOpen ? " is-open" : ""}`} id="bio-text">
              {bio.map((para) => (
                <p key={para}>{para}</p>
              ))}
              {focus.length > 0 && (
                <>
                  <h3>{pt.focusTitle}</h3>
                  <ul className="bullets">
                    {focus.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <button
              type="button"
              className="link bio-toggle"
              aria-expanded={bioOpen}
              aria-controls="bio-text"
              onClick={() => setBioOpen((o) => !o)}
            >
              {bioOpen ? pt.viewLess : pt.viewMore}
              <ChevronDownIcon width={18} height={18} />
            </button>

            <div className="p-sub">
              <h3>
                <LanguagesIcon width={18} height={18} />
                {person ? pt.languages : pt.languagesPlace}
              </h3>
              <ul className="tags">
                {languages.map((l) => (
                  <li key={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</li>
                ))}
              </ul>
            </div>

            <div className="p-sub">
              <h3>
                <WalletIcon width={18} height={18} />
                {pt.payment}
              </h3>
              <p className="muted">{pt.paymentText}</p>
            </div>
          </section>

          <section id="questions" className="p-section" aria-labelledby="questions-title">
            <h2 id="questions-title" className="p-title">
              {pt.faqTitle}
            </h2>
            <div className="faq">
              {faq.map((f) => (
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
        </div>

        <aside className="profile-aside" id="book">
          <BookingWidget p={p} slots={slots} />
        </aside>
      </div>

      <MobileBookBar label={pt.bookCta} />
    </div>
  );
}
