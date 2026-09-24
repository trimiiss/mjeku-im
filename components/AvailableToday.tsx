"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dayKey, formatPrice, formatTime, relativeDay } from "@/lib/format";
import { profileDicts } from "@/lib/profileText";
import { cityName, displayName, initials, matches, prefixMatch, profileHref, specialtyName } from "@/lib/search";
import { languageNames } from "@/lib/taxonomy";
import type { Practitioner, Slot } from "@/lib/types";
import { useApp } from "./AppContext";
import { ArrowRightIcon, CloseIcon, LanguagesIcon, PinIcon, SunIcon, VideoIcon } from "./Icons";

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

export function AvailableToday() {
  const { t, lang, dir, idx, applied, clearSearch, focusSearch } = useApp();
  const [cat, setCat] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setCat("all");
    setShowAll(false);
  }, [applied]);

  const categories = useMemo(() => {
    const used = new Set(dir.practitioners.map((p) => p.specialty_id));
    return dir.specialties.filter((s) => used.has(s.id));
  }, [dir]);

  const results = useMemo(() => {
    const list = dir.practitioners.filter(
      (p) => (!applied || matches(p, applied, idx)) && (cat === "all" || p.specialty_id === cat),
    );
    const first = (p: Practitioner) => idx.slotsByPractitioner.get(p.id)?.[0]?.starts_at ?? "9999";
    return list.sort((a, b) => first(a).localeCompare(first(b)));
  }, [dir, idx, applied, cat]);

  const visible = showAll ? results : results.slice(0, PAGE);

  let summary: string | null = null;
  if (applied) {
    const what = applied.label || applied.q.trim() || t.available.allPractitioners;
    const where =
      applied.mode === "video"
        ? t.available.byVideo
        : applied.cityId
          ? t.available.inCity(cityName(idx.cityById.get(applied.cityId), lang))
          : applied.city.trim()
            ? t.available.inCity(
                cityName(
                  dir.cities.find((c) => prefixMatch(applied.city, `${c.name_sq} ${c.name_en} ${c.aliases}`)),
                  lang,
                ) || applied.city.trim(),
              )
            : t.available.everywhere;
    summary = `${t.available.results(results.length)} “${what}” ${where}`;
  }

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
          <button type="button" className="btn btn-outline" onClick={focusSearch}>
            {t.available.another}
          </button>
        </div>

        {summary && (
          <div className="result-bar" role="status">
            <p>{summary}</p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>
              <CloseIcon width={16} height={16} />
              {t.available.clear}
            </button>
          </div>
        )}

        <div className="filter-row" role="group" aria-label={t.available.filterLabel}>
          <button
            type="button"
            className="chip"
            aria-pressed={cat === "all"}
            onClick={() => {
              setCat("all");
              setShowAll(false);
            }}
          >
            {t.available.all}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={cat === c.id}
              onClick={() => {
                setCat(c.id);
                setShowAll(false);
              }}
            >
              {specialtyName(c, lang)}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <ul className="doc-grid">
            {visible.map((p) => (
              <DocCard key={p.id} p={p} slots={idx.slotsByPractitioner.get(p.id) ?? []} />
            ))}
          </ul>
        ) : (
          <div className="empty">
            <b>{t.available.emptyTitle}</b>
            <p className="muted">{t.available.emptyText}</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                clearSearch();
                setCat("all");
              }}
            >
              {t.available.emptyCta}
            </button>
          </div>
        )}

        {results.length > PAGE && (
          <div className="more-row">
            <button type="button" className="btn btn-outline" onClick={() => setShowAll((s) => !s)}>
              {showAll ? t.available.showFewer : t.available.showAll(results.length)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
