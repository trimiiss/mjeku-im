"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cityName, specialtyName } from "@/lib/search";
import { clinicTypes, expertise, popularExpertiseCities, popularSpecialtyCities } from "@/lib/taxonomy";
import type { Query } from "@/lib/types";
import { useApp } from "./AppContext";
import { ChevronLeftIcon, ChevronRightIcon, PinIcon } from "./Icons";

type Item = { key: string; label: string; query: Partial<Query> };
type RailItem = Item & { city: string };

const base: Partial<Query> = { city: "", cityId: undefined, clinicType: undefined, specialtyId: undefined, mode: "in_person" };

function Rail({ title, items }: { title: string; items: RailItem[] }) {
  const { t, runSearch } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="rail-block">
      <div className="rail-head">
        <h3>{title}</h3>
        <div className="rail-nav">
          <button type="button" aria-label={t.directory.scrollLeft(title)} onClick={() => nudge(-1)}>
            <ChevronLeftIcon width={18} height={18} />
          </button>
          <button type="button" aria-label={t.directory.scrollRight(title)} onClick={() => nudge(1)}>
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="rail" ref={ref}>
        {items.map((it) => (
          <button key={it.key} type="button" onClick={() => runSearch(it.query)}>
            <b>{it.label}</b>
            <span>
              <PinIcon width={14} height={14} />
              <span className="sr-only">{t.directory.inWord} </span>
              {it.city}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Directory() {
  const { t, lang, dir, idx, runSearch, clearSearch, focusSearch } = useApp();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = useMemo(() => {
    const specialists: Item[] = dir.specialties.map((s) => {
      const label = specialtyName(s, lang);
      return { key: s.id, label, query: { ...base, q: label, label, specialtyId: s.id } };
    });
    const services: Item[] = expertise.map((e) => ({
      key: e.id,
      label: e[lang],
      query: { ...base, q: e[lang], label: e[lang], specialtyId: e.specialtyId },
    }));
    const types = Array.from(new Set(dir.clinics.map((c) => c.type)));
    const institutions: Item[] = types.map((type) => {
      const label = clinicTypes[type]?.[lang] ?? type;
      return { key: type, label, query: { ...base, q: label, label, clinicType: type } };
    });
    return [
      { id: "specialists" as const, items: specialists },
      { id: "expertise" as const, items: services },
      { id: "institutions" as const, items: institutions },
    ];
  }, [dir, lang]);

  const rails = useMemo(() => {
    const specialtyRail: RailItem[] = popularSpecialtyCities.flatMap(([sid, cid]) => {
      const s = idx.specialtyById.get(sid);
      const c = idx.cityById.get(cid);
      if (!s || !c) return [];
      const label = specialtyName(s, lang);
      const city = cityName(c, lang);
      return [{ key: `${sid}-${cid}`, label, city, query: { ...base, q: label, label, specialtyId: sid, cityId: cid, city } }];
    });
    const expertiseRail: RailItem[] = popularExpertiseCities.flatMap(([eid, cid]) => {
      const e = expertise.find((x) => x.id === eid);
      const c = idx.cityById.get(cid);
      if (!e || !c) return [];
      const city = cityName(c, lang);
      return [
        { key: `${eid}-${cid}`, label: e[lang], city, query: { ...base, q: e[lang], label: e[lang], specialtyId: e.specialtyId, cityId: cid, city } },
      ];
    });
    return { specialtyRail, expertiseRail };
  }, [idx, lang]);

  const current = tabs[tab];

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (tab + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="section" id="directory" aria-labelledby="directory-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t.directory.eyebrow}</p>
          <h2 id="directory-title" className="h2">
            {t.directory.title}
          </h2>
        </div>

        <div className="tabs" role="tablist" aria-label={t.directory.browse}>
          {tabs.map((tb, i) => (
            <button
              key={tb.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tb.id}`}
              className="tab"
              aria-selected={tab === i}
              aria-controls={`panel-${tb.id}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={onTabKey}
            >
              {t.directory.tabs[tb.id]}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          <h3 className="sr-only">{t.directory.headings[current.id]}</h3>
          <ul className="dir-list">
            {current.items.map((it) => (
              <li key={it.key}>
                <button type="button" onClick={() => runSearch(it.query)}>
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="link dir-all"
            onClick={() => {
              clearSearch();
              focusSearch();
            }}
          >
            {t.directory.all[current.id]}
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>

        <div className="popular">
          <Rail title={t.directory.railSpecialties} items={rails.specialtyRail} />
          <Rail title={t.directory.railExpertise} items={rails.expertiseRail} />
        </div>
      </div>
    </section>
  );
}
