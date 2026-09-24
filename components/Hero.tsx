"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { heroChips, practitioners } from "@/lib/data";
import { suggest, type Suggestion } from "@/lib/search";
import { site } from "@/lib/site";
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
import { PREVIEW_NOTE, useSearch } from "./SearchContext";

function SearchPanel() {
  const { mode, setMode, draft, setDraft, runSearch, registerSearchInput } = useSearch();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => suggest(draft.q), [draft.q]);
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
    if (s.kind === "specialty") {
      setDraft({ q: s.label });
      if (mode === "in-person" && !draft.city.trim()) {
        cityRef.current?.focus();
        return;
      }
      runSearch({ q: s.label });
      return;
    }
    runSearch({ q: s.label, city: "" });
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
      <div className="mode-toggle" role="group" aria-label="Type of appointment">
        <button type="button" aria-pressed={mode === "in-person"} onClick={() => setMode("in-person")}>
          <HouseCrossIcon width={18} height={18} />
          In person
        </button>
        <button type="button" aria-pressed={mode === "video"} onClick={() => setMode("video")}>
          <VideoIcon width={18} height={18} />
          Video
        </button>
      </div>

      <div className="search-row">
        <div className="field field--combo" ref={boxRef}>
          <SearchIcon />
          <label htmlFor="search-q" className="sr-only">
            Specialty, practitioner or institution
          </label>
          <input
            id="search-q"
            ref={registerSearchInput}
            type="text"
            autoComplete="off"
            placeholder="Specialty, doctor or practice"
            value={draft.q}
            role="combobox"
            aria-expanded={open && flat.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setDraft({ q: e.target.value });
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
          />
          {open && flat.length > 0 && (
            <div className="suggest" id={listId} role="listbox" aria-label="Suggestions">
              {groups.map((g) => (
                <div className="suggest-group" role="group" aria-label={g.title} key={g.title}>
                  <p className="suggest-label" aria-hidden="true">
                    {g.title}
                  </p>
                  {g.items.map((s) => {
                    optionIndex += 1;
                    const i = optionIndex;
                    return (
                      <div
                        key={`${s.kind}-${s.label}`}
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
                          ) : s.kind === "institution" ? (
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
            City or postcode
          </label>
          <input
            id="search-city"
            ref={cityRef}
            type="text"
            autoComplete="address-level2"
            placeholder={mode === "video" ? `Anywhere in ${site.country}` : "City or postcode"}
            value={mode === "video" ? "" : draft.city}
            disabled={mode === "video"}
            onChange={(e) => setDraft({ city: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary search-btn">
          <SearchIcon />
          Search
        </button>
      </div>
    </form>
  );
}

const extraDays = [
  ["08:15", "09:40", "11:00", "13:50", "16:00", "17:45"],
  ["09:00", "10:20", "11:40"],
];

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function SlotCard() {
  const { notify } = useSearch();
  const doc = practitioners[0];
  const [base, setBase] = useState<Date | null>(null);
  const [day, setDay] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setBase(new Date());
  }, []);

  const days = [0, 1, 2].map((i) => {
    const date = base ? addDays(base, i) : null;
    const closed = date ? date.getDay() === 0 : false;
    return {
      name:
        i === 0
          ? "Today"
          : i === 1
            ? "Tomorrow"
            : date
              ? date.toLocaleDateString("en-GB", { weekday: "long" })
              : "Later",
      date: date ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : " ",
      slots: closed ? [] : i === 0 ? doc.slots : extraDays[i - 1],
    };
  });

  const current = days[day];

  return (
    <aside className="slot-card" aria-label={`Book an appointment with ${doc.name}`}>
      <p className="eyebrow">Next free appointments</p>

      <div className="doc-head">
        <span className="avatar" aria-hidden="true">
          {doc.initials}
        </span>
        <div>
          <p className="doc-name">{doc.name}</p>
          <p className="doc-meta">{doc.specialty}</p>
        </div>
      </div>

      <ul className="doc-facts">
        <li>
          <PinIcon width={17} height={17} />
          {doc.practice}, {doc.postcode} {doc.city}
        </li>
        <li>
          <LanguagesIcon width={17} height={17} />
          Speaks {doc.languages.join(", ")}
        </li>
      </ul>

      <div className="badges">
        <span className="badge">
          <VideoIcon width={14} height={14} />
          Video consultations
        </span>
        <span className="badge">
          <SunIcon width={14} height={14} />
          Open on Saturdays
        </span>
      </div>

      <div className="day-tabs" role="tablist" aria-label="Day">
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            className="day-tab"
            aria-selected={day === i}
            onClick={() => {
              setDay(i);
              setPicked(null);
            }}
          >
            <b>{d.name}</b>
            <span>{d.date}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={`${current.name} ${current.date}`}>
        {current.slots.length > 0 ? (
          <div className="slots">
            {current.slots.map((t) => (
              <button
                key={t}
                type="button"
                className="slot"
                aria-pressed={picked === t}
                onClick={() => setPicked(picked === t ? null : t)}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <p className="slot-empty">The practice is closed on Sundays. Try another day.</p>
        )}
      </div>

      <div className="slot-foot">
        {picked ? (
          <>
            <p>
              <strong>
                {current.name}, {picked}
              </strong>
              <br />
              In person · about 20 min
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => notify(`${doc.name} · ${current.name} ${picked}`, PREVIEW_NOTE)}
            >
              Continue
              <ArrowRightIcon />
            </button>
          </>
        ) : (
          <p>Pick a time to book. Free for patients, with an SMS reminder the day before.</p>
        )}
      </div>
    </aside>
  );
}

export function Hero() {
  const { runSearch } = useSearch();

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>
            Book a medical appointment <span className="hl">in {site.country}</span>
          </h1>
          <p className="lede">
            Book online today with your doctor, dentist or therapist. It&apos;s quick, easy and free.
          </p>

          <SearchPanel />

          <div className="chips" aria-label="Popular searches">
            <span className="chips-label">Popular:</span>
            {heroChips.map((c) => (
              <button key={c} type="button" className="chip" onClick={() => runSearch({ q: c })}>
                {c}
              </button>
            ))}
          </div>

          <ul className="news">
            <li>
              <a href="#video">
                <span className="tag">New</span>
                Same-day video consultations
              </a>
            </li>
            <li>
              <a href="#privacy">
                <span className="tag tag--soft">Privacy</span>
                How we protect your health data
              </a>
            </li>
            <li>
              <a href="#faq">
                <span className="tag tag--soft">Guide</span>
                Video consultations, explained
              </a>
            </li>
          </ul>
        </div>

        <SlotCard />
      </div>
    </section>
  );
}
