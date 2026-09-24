"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addDaysKey, dayKey, formatPrice, formatTime, relativeDay, shortDate } from "@/lib/format";
import { profileDicts } from "@/lib/profileText";
import { profileHref, specialtyHref } from "@/lib/routes";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import { heroChips, languageNames } from "@/lib/taxonomy";
import type { Slot } from "@/lib/types";
import { useApp } from "./AppContext";
import { ArrowRightIcon, LanguagesIcon, PinIcon, SunIcon, VideoIcon } from "./Icons";
import { SearchPanel } from "./SearchPanel";

function SlotCard() {
  const { t, lang, dir, idx, todayKey, openBooking } = useApp();
  const doc = dir.practitioners.find((p) => p.featured) ?? dir.practitioners[0];
  const clinic = doc ? idx.clinicById.get(doc.clinic_id) : undefined;
  const slots = useMemo(() => (doc ? idx.slotsByPractitioner.get(doc.id) ?? [] : []), [doc, idx]);

  const days = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const key = addDaysKey(todayKey, i);
        return { key, slots: slots.filter((s) => dayKey(s.starts_at) === key) };
      }),
    [slots, todayKey],
  );

  const firstOpen = Math.max(
    0,
    days.findIndex((d) => d.slots.length > 0),
  );
  const [day, setDay] = useState(firstOpen);
  const [picked, setPicked] = useState<Slot | null>(null);

  useEffect(() => {
    setDay(firstOpen);
    setPicked(null);
  }, [firstOpen, slots]);

  if (!doc) return null;
  const current = days[day];
  const speaks = doc.languages.map((l) => languageNames[l]?.[lang] ?? l).join(", ");

  return (
    <aside className="slot-card" aria-label={`${t.booking.title}: ${displayName(doc)}`}>
      <p className="eyebrow">{t.slotCard.eyebrow}</p>

      <div className="doc-head">
        <span className="avatar" aria-hidden="true">
          {initials(doc.full_name)}
        </span>
        <div>
          <p className="doc-name">
            <Link href={profileHref(doc.id)} className="doc-link">
              {displayName(doc)}
            </Link>
          </p>
          <p className="doc-meta">{specialtyName(idx.specialtyById.get(doc.specialty_id), lang, doc.gender)}</p>
        </div>
        <Link href={profileHref(doc.id)} className="profile-mini">
          <span>{profileDicts[lang].viewProfile}</span>
          <ArrowRightIcon width={15} height={15} />
        </Link>
      </div>

      <ul className="doc-facts">
        <li>
          <PinIcon width={17} height={17} />
          {clinic?.name}, {clinic?.neighborhood ? `${clinic.neighborhood}, ` : ""}
          {cityName(clinic && idx.cityById.get(clinic.city_id), lang)}
        </li>
        <li>
          <LanguagesIcon width={17} height={17} />
          {t.common.speaks(speaks)}
        </li>
      </ul>

      <div className="badges">
        {doc.price_eur !== null && (
          <span className="badge badge--price">
            {doc.price_from ? `${t.common.from} ` : ""}
            {formatPrice(doc.price_eur, lang)} {t.common.perVisit}
          </span>
        )}
        {doc.offers_video && (
          <span className="badge">
            <VideoIcon width={14} height={14} />
            {t.slotCard.video}
          </span>
        )}
        {doc.open_saturday && (
          <span className="badge">
            <SunIcon width={14} height={14} />
            {t.slotCard.saturday}
          </span>
        )}
      </div>

      <div className="day-tabs" role="tablist" aria-label={t.slotCard.dayTabs}>
        {days.map((d, i) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            className="day-tab"
            aria-selected={day === i}
            onClick={() => {
              setDay(i);
              setPicked(null);
            }}
          >
            <b>{relativeDay(d.key, todayKey, lang)}</b>
            <span>{shortDate(d.key, lang)}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={relativeDay(current.key, todayKey, lang)}>
        {current.slots.length > 0 ? (
          <div className="slots">
            {current.slots.map((s) => (
              <button
                key={s.id}
                type="button"
                className="slot"
                aria-pressed={picked?.id === s.id}
                onClick={() => setPicked(picked?.id === s.id ? null : s)}
              >
                {formatTime(s.starts_at, lang)}
              </button>
            ))}
          </div>
        ) : (
          <p className="slot-empty">{t.slotCard.empty}</p>
        )}
      </div>

      <div className="slot-foot">
        {picked ? (
          <>
            <p>
              <strong>
                {relativeDay(current.key, todayKey, lang)}, {formatTime(picked.starts_at, lang)}
              </strong>
              <br />
              {t.common.inPerson} · {t.common.minutes(picked.duration_min)}
            </p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openBooking(picked)}>
              {t.slotCard.continue}
              <ArrowRightIcon />
            </button>
          </>
        ) : (
          <p>{t.slotCard.hint}</p>
        )}
      </div>
    </aside>
  );
}

export function Hero() {
  const { t, lang, idx } = useApp();

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>
            {t.hero.titleStart} <span className="hl">{t.hero.titleHighlight}</span>
          </h1>
          <p className="lede">{t.hero.lede}</p>

          <SearchPanel />

          <div className="chips" aria-label={t.hero.popular}>
            <span className="chips-label">{t.hero.popular}</span>
            {heroChips.map((id) => {
              const label = specialtyName(idx.specialtyById.get(id), lang);
              if (!label) return null;
              return (
                <Link key={id} href={specialtyHref(id)} className="chip">
                  {label}
                </Link>
              );
            })}
          </div>

          <ul className="news">
            {t.hero.news.map((n) => (
              <li key={n.href + n.tag}>
                <a href={n.href}>
                  <span className={n.tag === t.hero.news[0].tag ? "tag" : "tag tag--soft"}>{n.tag}</span>
                  {n.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <SlotCard />
      </div>
    </section>
  );
}
