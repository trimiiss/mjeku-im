"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { dayKey, formatPrice, formatTime, relativeDay } from "@/lib/format";
import { pagesDicts } from "@/lib/pagesText";
import { profileDicts } from "@/lib/profileText";
import { paths, profileHref, specialtyHref } from "@/lib/routes";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import { languageNames } from "@/lib/taxonomy";
import type { Practitioner, Slot } from "@/lib/types";
import { useApp } from "./AppContext";
import { ArrowRightIcon, LanguagesIcon, PinIcon, SunIcon, VideoIcon } from "./Icons";

const PAGE = 6;

function DocCard({ p, slots }: { p: Practitioner; slots: Slot[] }) {
  const { t, lang, idx, todayKey, openBooking } = useApp();
  const [expanded, setExpanded] = useState(false);
  const clinic = idx.clinicById.get(p.clinic_id);
  const firstDay = slots[0] ? dayKey(slots[0].starts_at) : null;
  const daySlots = firstDay ? slots.filter((s) => dayKey(s.starts_at) === firstDay) : [];
  const shown = expanded ? daySlots : daySlots.slice(0, 4);
  const speaks = p.languages.map((l) => languageNames[l]?.[lang] ?? l).join(", ");

  return (
    <li className="doc-card">
      <div className="doc-head">
        <span className="avatar" aria-hidden="true">
          {initials(p.full_name)}
        </span>
        <div>
          <p className="doc-name">
            <Link href={profileHref(p.id)} className="doc-link">
              {displayName(p)}
            </Link>
          </p>
          <p className="doc-meta">{specialtyName(idx.specialtyById.get(p.specialty_id), lang, p.gender)}</p>
        </div>
      </div>
      <ul className="doc-facts">
        <li>
          <PinIcon width={17} height={17} />
          {clinic?.name}, {cityName(clinic && idx.cityById.get(clinic.city_id), lang)}
        </li>
        <li>
          <LanguagesIcon width={17} height={17} />
          {t.common.speaks(speaks)}
        </li>
      </ul>
      <div className="badges">
        {p.price_eur !== null && (
          <span className="badge badge--price">
            {p.price_from ? `${t.common.from} ` : ""}
            {formatPrice(p.price_eur, lang)}
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
      </div>
      <div className="today">
        {firstDay ? (
          <>
            <p className={`today-label${firstDay === todayKey ? "" : " is-later"}`}>
              {t.available.free(relativeDay(firstDay, todayKey, lang))}
            </p>
            <div className="slots">
              {shown.map((s) => (
                <button key={s.id} type="button" className="slot" onClick={() => openBooking(s)}>
                  {formatTime(s.starts_at, lang)}
                </button>
              ))}
              {!expanded && daySlots.length > shown.length && (
                <button type="button" className="slot slot--more" onClick={() => setExpanded(true)}>
                  +{daySlots.length - shown.length}
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="today-none">{t.available.noSlots}</p>
        )}
      </div>
      <Link href={profileHref(p.id)} className="link card-profile">
        {profileDicts[lang].viewProfile}
        <ArrowRightIcon width={16} height={16} />
      </Link>
    </li>
  );
}

/** Home page teaser: who has free slots soonest, with links to every specialty page and to all results. */
export function AvailableToday() {
  const { t, lang, dir, idx } = useApp();
  const pd = pagesDicts[lang];

  const categories = useMemo(() => {
    const used = new Set(dir.practitioners.map((p) => p.specialty_id));
    return dir.specialties.filter((s) => used.has(s.id));
  }, [dir]);

  const soonest = useMemo(() => {
    const first = (p: Practitioner) => idx.slotsByPractitioner.get(p.id)?.[0]?.starts_at ?? "9999";
    return [...dir.practitioners].sort((a, b) => first(a).localeCompare(first(b))).slice(0, PAGE);
  }, [dir, idx]);

  return (
    <section className="section section--mist" id="available" aria-labelledby="available-title">
      <div className="container">
        <div className="avail-head">
          <div className="stack">
            <p className="eyebrow">{t.available.eyebrow}</p>
            <h2 id="available-title" className="h2">
              {t.available.title}
            </h2>
            <p className="lede">{t.available.lede}</p>
          </div>
          <Link className="btn btn-outline" href={paths.search}>
            {pd.allDoctors}
          </Link>
        </div>

        <nav className="filter-row" aria-label={t.available.filterLabel}>
          {categories.map((c) => (
            <Link key={c.id} className="chip" href={specialtyHref(c.id)}>
              {specialtyName(c, lang)}
            </Link>
          ))}
        </nav>

        <ul className="doc-grid">
          {soonest.map((p) => (
            <DocCard key={p.id} p={p} slots={idx.slotsByPractitioner.get(p.id) ?? []} />
          ))}
        </ul>

        <div className="more-row">
          <Link className="btn btn-primary" href={paths.search}>
            {pd.allDoctors}
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
