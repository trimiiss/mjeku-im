"use client";

import { useEffect, useMemo, useState } from "react";
import { practitioners } from "@/lib/data";
import { filterPractitioners } from "@/lib/search";
import { site } from "@/lib/site";
import { CloseIcon, LanguagesIcon, PinIcon, SunIcon, VideoIcon } from "./Icons";
import { PREVIEW_NOTE, useSearch } from "./SearchContext";

const categories = ["All", ...Array.from(new Set(practitioners.map((p) => p.specialty)))];
const PAGE = 6;

export function AvailableToday() {
  const { applied, clearSearch, notify, focusSearch } = useSearch();
  const [cat, setCat] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setCat("All");
    setShowAll(false);
  }, [applied]);

  const results = useMemo(
    () => filterPractitioners(applied).filter((p) => cat === "All" || p.specialty === cat),
    [applied, cat],
  );
  const visible = showAll ? results : results.slice(0, PAGE);

  const summary = applied
    ? [
        applied.q.trim() ? `“${applied.q.trim()}”` : "All practitioners",
        applied.mode === "video" ? "by video" : applied.city.trim() ? `in ${applied.city.trim()}` : `across ${site.country}`,
      ].join(" ")
    : null;

  return (
    <section className="section section--mist" id="available" aria-labelledby="available-title">
      <div className="container">
        <div className="avail-head">
          <div className="stack">
            <p className="eyebrow">Same-day appointments</p>
            <h2 id="available-title" className="h2">
              Find a practitioner available today, even on Saturday
            </h2>
            <p className="lede">
              Need to see someone quickly? Book a doctor, dentist or therapist with a free slot today, near you or by
              video.
            </p>
          </div>
          <button type="button" className="btn btn-outline" onClick={focusSearch}>
            Search another specialty
          </button>
        </div>

        {summary && (
          <div className="result-bar" role="status">
            <p>
              <b>{results.length}</b> {results.length === 1 ? "result" : "results"} for {summary}
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>
              <CloseIcon width={16} height={16} />
              Clear search
            </button>
          </div>
        )}

        <div className="filter-row" role="group" aria-label="Filter by specialty">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={cat === c}
              onClick={() => {
                setCat(c);
                setShowAll(false);
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <ul className="doc-grid">
            {visible.map((p) => (
              <li className="doc-card" key={p.id}>
                <div className="doc-head">
                  <span className="avatar" aria-hidden="true">
                    {p.initials}
                  </span>
                  <div>
                    <p className="doc-name">{p.name}</p>
                    <p className="doc-meta">{p.specialty}</p>
                  </div>
                </div>
                <ul className="doc-facts">
                  <li>
                    <PinIcon width={17} height={17} />
                    {p.practice}, {p.postcode} {p.city}
                  </li>
                  <li>
                    <LanguagesIcon width={17} height={17} />
                    Speaks {p.languages.join(", ")}
                  </li>
                </ul>
                {(p.video || p.saturday) && (
                  <div className="badges">
                    {p.video && (
                      <span className="badge">
                        <VideoIcon width={14} height={14} />
                        Video
                      </span>
                    )}
                    {p.saturday && (
                      <span className="badge">
                        <SunIcon width={14} height={14} />
                        Saturdays
                      </span>
                    )}
                  </div>
                )}
                <div className="today">
                  <p className="today-label">Free today</p>
                  <div className="slots">
                    {p.slots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="slot"
                        onClick={() => notify(`${p.name} · Today ${t}`, PREVIEW_NOTE)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <b>No free slots today for this search</b>
            <p className="muted">Try another city or specialty, or switch to a video consultation.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                clearSearch();
                setCat("All");
              }}
            >
              See everyone available today
            </button>
          </div>
        )}

        {results.length > PAGE && (
          <div className="more-row">
            <button type="button" className="btn btn-outline" onClick={() => setShowAll((s) => !s)}>
              {showAll ? "Show fewer" : `Show all ${results.length} practitioners`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
