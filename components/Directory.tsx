"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  expertiseDirectory,
  institutionDirectory,
  popularExpertiseSearches,
  popularSpecialtySearches,
  specialtiesDirectory,
  type DirectoryItem,
} from "@/lib/data";
import { ChevronLeftIcon, ChevronRightIcon, PinIcon } from "./Icons";
import { useSearch } from "./SearchContext";

const tabs: { id: string; label: string; heading: string; all: string; items: DirectoryItem[] }[] = [
  { id: "specialists", label: "Specialists", heading: "Find a specialist", all: "All specialties", items: specialtiesDirectory },
  { id: "expertise", label: "Expertise", heading: "Find an expertise", all: "All expertise", items: expertiseDirectory },
  { id: "institutions", label: "Institutions", heading: "Find an institution", all: "All institutions", items: institutionDirectory },
];

function Rail({ title, items }: { title: string; items: { label: string; q: string; city: string }[] }) {
  const { runSearch } = useSearch();
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
          <button type="button" aria-label={`Scroll ${title} left`} onClick={() => nudge(-1)}>
            <ChevronLeftIcon width={18} height={18} />
          </button>
          <button type="button" aria-label={`Scroll ${title} right`} onClick={() => nudge(1)}>
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>
      </div>
      <div className="rail" ref={ref}>
        {items.map((it) => (
          <button
            key={`${it.label}-${it.city}`}
            type="button"
            onClick={() => runSearch({ q: it.q, city: it.city, mode: "in-person" })}
          >
            <b>{it.label}</b>
            <span>
              <PinIcon width={14} height={14} />
              <span className="sr-only">in </span>
              {it.city}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Directory() {
  const { runSearch, clearSearch, focusSearch } = useSearch();
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
          <p className="eyebrow">Directory</p>
          <h2 id="directory-title" className="h2">
            Find care near you
          </h2>
        </div>

        <div className="tabs" role="tablist" aria-label="Browse by">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              className="tab"
              aria-selected={tab === i}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={onTabKey}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          <h3 className="sr-only">{current.heading}</h3>
          <ul className="dir-list">
            {current.items.map((it) => (
              <li key={it.label}>
                <button type="button" onClick={() => runSearch({ q: it.label, city: "", mode: "in-person" })}>
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
            {current.all}
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>

        <div className="popular">
          <Rail
            title="Frequent specialties"
            items={popularSpecialtySearches.map((s) => ({ label: s.q, q: s.q, city: s.city }))}
          />
          <Rail
            title="Frequent expertise"
            items={popularExpertiseSearches.map((s) => ({ label: s.label, q: s.q, city: s.city }))}
          />
        </div>
      </div>
    </section>
  );
}
