"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Listed } from "@/lib/directory";
import {
  activeFilterCount,
  byAvailability,
  filterParams,
  matchesBase,
  matchesFilters,
  PAGE_SIZE,
  listingTitle,
  WITHIN,
  type Base,
  type Filters,
} from "@/lib/listing";
import { pagesDicts } from "@/lib/pagesText";
import { paths, specialtyHref } from "@/lib/routes";
import { cityName, specialtyName } from "@/lib/search";
import { languageNames } from "@/lib/taxonomy";
import { useApp } from "../AppContext";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, HouseCrossIcon, VideoIcon } from "../Icons";
import { SearchPanel } from "../SearchPanel";
import { ListedPractices } from "./ListedPractices";
import { ListingSections } from "./ListingSections";
import { ResultCard } from "./ResultCard";

const FILTER_KEYS = ["te-rinj", "gjuha", "gjinia", "disp", "faqja"];

/** A OneDoc-style listing page: breadcrumbs, title, search bar, filters, result cards, pages, then related links. */
export function ResultsView({
  base,
  nextFree,
  initialFilters,
  listed,
}: {
  base: Base;
  nextFree: Record<string, string>;
  initialFilters: Filters;
  /** Real practices not on Mjeku.Im yet, for specialty and city pages. */
  listed: Listed;
}) {
  const { t, lang, dir, idx, todayKey } = useApp();
  const pd = pagesDicts[lang];
  const r = pd.results;
  const l = pd.listed;
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [panelOpen, setPanelOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const specialty = base.specialtyId ? idx.specialtyById.get(base.specialtyId) : undefined;
  const city = base.cityId && !base.video ? idx.cityById.get(base.cityId) : undefined;
  const cityLabel = cityName(city, lang);

  const title = listingTitle(base, lang, specialty, city);

  const crumbs: { label: string; href?: string }[] = [{ label: "Mjeku.Im", href: paths.home }];
  if (base.kind === "video") crumbs.push({ label: t.nav.video });
  else if (specialty) {
    crumbs.push(city ? { label: specialtyName(specialty, lang), href: specialtyHref(specialty.id) } : { label: specialtyName(specialty, lang) });
    if (city) crumbs.push({ label: cityLabel });
  } else crumbs.push({ label: pd.crumbSearch });

  const matching = useMemo(
    () => dir.practitioners.filter((p) => matchesBase(p, base, idx)).sort(byAvailability(nextFree)),
    [dir, base, idx, nextFree],
  );
  const results = useMemo(
    () => matching.filter((p) => matchesFilters(p, filters, nextFree, todayKey)),
    [matching, filters, nextFree, todayKey],
  );
  const languages = useMemo(() => {
    const used = new Set(matching.flatMap((p) => p.languages));
    return Object.keys(languageNames).filter((code) => used.has(code));
  }, [matching]);

  // On a specialty page without a city: every municipality with someone for it, bookable or listed.
  const byCity = useMemo(() => {
    if (!specialty || city || base.video) return [];
    const counts = new Map<string, number>(Object.entries(listed.byCity));
    for (const p of matching) {
      const c = idx.clinicById.get(p.clinic_id)?.city_id;
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return dir.cities.filter((c) => counts.has(c.id)).map((c) => ({ city: c, n: counts.get(c.id) ?? 0 }));
  }, [specialty, city, base.video, listed.byCity, matching, idx, dir.cities]);
  const listedHere = specialty && city && !base.video ? listed.practices : [];

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = activeFilterCount(filters);

  const update = (patch: Partial<Filters>, scroll = false) => {
    const next = { ...filters, page: 1, ...patch };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const key of FILTER_KEYS) url.searchParams.delete(key);
    for (const [key, value] of Object.entries(filterParams(next))) if (value) url.searchParams.set(key, value);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    if (scroll) listRef.current?.scrollIntoView({ block: "start" });
  };

  const clear = () => update({ newPatients: false, language: "", gender: "", within: "" });

  return (
    <div className="listing">
      <div className="profile-top listing-top">
        <div className="container">
          <nav className="crumbs" aria-label={lang === "sq" ? "Vendndodhja në faqe" : "Breadcrumb"}>
            <ol>
              {crumbs.map((c, i) => (
                <li key={c.label} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                  {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : c.label}
                </li>
              ))}
            </ol>
          </nav>

          {base.kind === "video" ? (
            <div className="listing-intro">
              <p className="eyebrow">{pd.video.eyebrow}</p>
              <h1>{pd.video.title}</h1>
              <p className="lede">{pd.video.lede}</p>
              <ol className="listing-steps">
                {t.video.steps.map((s, i) => (
                  <li key={s.title}>
                    <span className="step-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h2>{s.title}</h2>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <h1 className="listing-title">{title}</h1>
          )}

          {base.kind !== "video" && <SearchPanel className="search--listing" />}
        </div>
      </div>

      <div className="container listing-body" ref={listRef}>
        <div className="listing-bar">
          <p className="listing-count" role="status">
            <b>{base.kind === "video" ? pd.video.listTitle : r.count(results.length)}</b>
            {base.kind === "video" ? ` · ${r.count(results.length)}` : ` · ${r.sortedBy}`}
          </p>
          <button
            type="button"
            className="btn btn-outline btn-sm filters-toggle"
            aria-expanded={panelOpen}
            aria-controls="filters"
            onClick={() => setPanelOpen((o) => !o)}
          >
            {active ? r.filtersActive(active) : r.filters}
            <ChevronDownIcon width={16} height={16} />
          </button>
        </div>

        <div id="filters" className={`filters${panelOpen ? " is-open" : ""}`} role="group" aria-label={r.filters}>
          <label className="filter-check">
            <input type="checkbox" checked={filters.newPatients} onChange={(e) => update({ newPatients: e.target.checked })} />
            <span>{r.acceptsNew}</span>
          </label>

          <div className="filter-field">
            <label htmlFor="f-language">{r.language}</label>
            <div className="select">
              <select id="f-language" value={filters.language} onChange={(e) => update({ language: e.target.value })}>
                <option value="">{r.anyLanguage}</option>
                {languages.map((code) => (
                  <option key={code} value={code}>
                    {(languageNames[code]?.[lang] ?? code).replace(/^./, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
              <ChevronDownIcon width={18} height={18} />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="f-gender">{r.gender}</label>
            <div className="select">
              <select id="f-gender" value={filters.gender} onChange={(e) => update({ gender: e.target.value as Filters["gender"] })}>
                <option value="">{r.anyGender}</option>
                <option value="f">{r.female}</option>
                <option value="m">{r.male}</option>
              </select>
              <ChevronDownIcon width={18} height={18} />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="f-within">{r.availability}</label>
            <div className="select">
              <select id="f-within" value={filters.within} onChange={(e) => update({ within: e.target.value as Filters["within"] })}>
                <option value="">{r.anyTime}</option>
                {WITHIN.map((w) => (
                  <option key={w} value={w}>
                    {w === "today" ? r.today : r.within(Number(w))}
                  </option>
                ))}
              </select>
              <ChevronDownIcon width={18} height={18} />
            </div>
          </div>

          {active > 0 && (
            <button type="button" className="btn btn-ghost btn-sm filter-clear" onClick={clear}>
              <CloseIcon width={16} height={16} />
              {r.clear}
            </button>
          )}
        </div>

        <h2 className="sr-only">{r.count(results.length)}</h2>
        {visible.length > 0 ? (
          <ul className="rlist">
            {visible.map((p) => (
              <ResultCard key={p.id} p={p} nextFree={nextFree[p.id]} />
            ))}
          </ul>
        ) : active === 0 && listedHere.length > 0 ? (
          <div className="empty empty--soft">
            <b>{l.noneOnlineTitle}</b>
            <p className="muted">{l.noneOnlineText(listedHere.length)}</p>
            <a className="btn btn-primary btn-sm" href="#te-tjere">
              {l.noneOnlineCta}
            </a>
          </div>
        ) : (
          <div className="empty">
            <b>{r.emptyTitle}</b>
            <p className="muted">{r.emptyText}</p>
            <div className="actions">
              {active > 0 && (
                <button type="button" className="btn btn-primary btn-sm" onClick={clear}>
                  {r.clear}
                </button>
              )}
              {specialty && city && (
                <Link className="btn btn-outline btn-sm" href={specialtyHref(specialty.id)}>
                  {r.emptyEverywhere}
                </Link>
              )}
              {!base.video && (
                <Link className="btn btn-outline btn-sm" href={specialty ? specialtyHref(specialty.id, undefined, { video: "1" }) : paths.video}>
                  <VideoIcon />
                  {t.common.video}
                </Link>
              )}
              {base.video && specialty && (
                <Link className="btn btn-outline btn-sm" href={specialtyHref(specialty.id)}>
                  <HouseCrossIcon />
                  {t.common.inPerson}
                </Link>
              )}
            </div>
          </div>
        )}

        {pages > 1 && (
          <nav className="pager" aria-label={r.pages}>
            <button type="button" aria-label={r.prev} disabled={page === 1} onClick={() => update({ page: page - 1 }, true)}>
              <ChevronLeftIcon width={18} height={18} />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-label={r.page(n)}
                aria-current={n === page ? "page" : undefined}
                onClick={() => update({ page: n }, true)}
              >
                {n}
              </button>
            ))}
            <button type="button" aria-label={r.next} disabled={page === pages} onClick={() => update({ page: page + 1 }, true)}>
              <ChevronRightIcon width={18} height={18} />
            </button>
          </nav>
        )}

        {specialty && city && listedHere.length > 0 && <ListedPractices practices={listedHere} specialty={specialty} city={city} />}

        {specialty && byCity.length > 0 && (
          <section className="listed" aria-labelledby="bycity-title">
            <h2 id="bycity-title" className="lblock-title">
              {l.byCity(specialtyName(specialty, lang))}
            </h2>
            <ul className="bycity">
              {byCity.map(({ city: c, n }) => (
                <li key={c.id}>
                  <Link href={specialtyHref(specialty.id, c.id)}>
                    <b>{cityName(c, lang)}</b>
                    <span>{l.places(n)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ListingSections base={base} matching={matching} listed={listed} />
    </div>
  );
}
