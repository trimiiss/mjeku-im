"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { addDaysKey, dayKey, formatPrice, formatTime, relativeDay, shortDate } from "@/lib/format";
import { profileDicts } from "@/lib/profileText";
import { cityName, displayName, initials, profileHref, specialtyName, suggest, type Suggestion } from "@/lib/search";
import { heroChips, languageNames } from "@/lib/taxonomy";
import type { Slot } from "@/lib/types";
import { useApp } from "./AppContext";
import {
  ArrowRightIcon,
  BuildingIcon,
  HouseCrossIcon,
  LanguagesIcon,
  PinIcon,
  SearchIcon,
  StethoscopeIcon,
  SunIcon,
  VideoIcon,
} from "./Icons";

function SearchPanel() {
  const { t, lang, dir, idx, mode, setMode, draft, setDraft, runSearch, registerSearchInput } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => suggest(draft.q, lang, dir, idx), [draft.q, lang, dir, idx]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (s: Suggestion) => {
    setOpen(false);
    setActive(-1);
    if (s.kind === "practitioner") {
      router.push(profileHref(s.id));
      return;
    }
    if (s.kind === "specialty") {
      setDraft({ q: s.label, specialtyId: s.id, label: s.label, clinicType: undefined });
      if (mode === "in_person" && !draft.city.trim()) {
        cityRef.current?.focus();
        return;
      }
      runSearch({ q: s.label, specialtyId: s.id, label: s.label, clinicType: undefined });
      return;
    }
    runSearch({ q: s.label, specialtyId: undefined, label: undefined, clinicType: undefined, city: "", cityId: undefined });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter" && open && active >= 0 && flat[active]) {
      e.preventDefault();
      choose(flat[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  let optionIndex = -1;

  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(false);
        runSearch();
      }}
    >
      <div className="mode-toggle" role="group" aria-label={t.hero.modeLabel}>
        <button type="button" aria-pressed={mode === "in_person"} onClick={() => setMode("in_person")}>
          <HouseCrossIcon width={18} height={18} />
          {t.hero.inPerson}
        </button>
        <button type="button" aria-pressed={mode === "video"} onClick={() => setMode("video")}>
          <VideoIcon width={18} height={18} />
          {t.hero.video}
        </button>
      </div>

      <div className="search-row">
        <div className="field field--combo" ref={boxRef}>
          <SearchIcon />
          <label htmlFor="search-q" className="sr-only">
            {t.hero.qLabel}
          </label>
          <input
            id="search-q"
            ref={registerSearchInput}
            type="text"
            autoComplete="off"
            placeholder={t.hero.qPlaceholder}
            value={draft.q}
            role="combobox"
            aria-expanded={open && flat.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setDraft({ q: e.target.value, specialtyId: undefined, label: undefined, clinicType: undefined });
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
          />
          {open && flat.length > 0 && (
            <div className="suggest" id={listId} role="listbox" aria-label={t.hero.qLabel}>
              {groups.map((g) => (
                <div className="suggest-group" role="group" aria-label={t.hero.groups[g.key]} key={g.key}>
                  <p className="suggest-label" aria-hidden="true">
                    {t.hero.groups[g.key]}
                  </p>
                  {g.items.map((s) => {
                    optionIndex += 1;
                    const i = optionIndex;
                    return (
                      <div
                        key={`${s.kind}-${s.id}`}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={active === i}
                        className="suggest-opt"
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(s)}
                      >
                        <span className="suggest-ico" aria-hidden="true">
                          {s.kind === "practitioner" ? (
                            s.initials
                          ) : s.kind === "clinic" ? (
                            <BuildingIcon width={16} height={16} />
                          ) : (
                            <StethoscopeIcon width={16} height={16} />
                          )}
                        </span>
                        <span className="suggest-text">
                          <span>{s.label}</span>
                          {s.kind !== "specialty" && <small>{s.hint}</small>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`field${mode === "video" ? " is-disabled" : ""}`}>
          <PinIcon />
          <label htmlFor="search-city" className="sr-only">
            {t.hero.cityLabel}
          </label>
          <input
            id="search-city"
            ref={cityRef}
            type="text"
            list="city-list"
            autoComplete="off"
            placeholder={mode === "video" ? t.hero.cityVideo : t.hero.cityPlaceholder}
            value={mode === "video" ? "" : draft.city}
            disabled={mode === "video"}
            onChange={(e) => setDraft({ city: e.target.value, cityId: undefined })}
          />
          <datalist id="city-list">
            {dir.cities.map((c) => (
              <option key={c.id} value={cityName(c, lang)} />
            ))}
          </datalist>
        </div>

        <button type="submit" className="btn btn-primary search-btn">
          <SearchIcon />
          {t.hero.search}
        </button>
      </div>
    </form>
  );
}

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
  const { t, lang, idx, runSearch } = useApp();

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
                <button
                  key={id}
                  type="button"
                  className="chip"
                  onClick={() => runSearch({ q: label, specialtyId: id, label, clinicType: undefined })}
                >
                  {label}
                </button>
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
