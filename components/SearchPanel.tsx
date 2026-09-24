"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { profileHref } from "@/lib/routes";
import { cityName, suggest, type Suggestion } from "@/lib/search";
import { useApp } from "./AppContext";
import { BuildingIcon, HouseCrossIcon, PinIcon, SearchIcon, StethoscopeIcon, VideoIcon } from "./Icons";

/** Specialty, doctor or clinic + city, with "at the clinic / by video". Used on the home page and above results. */
export function SearchPanel({ className }: { className?: string }) {
  const { t, lang, dir, idx, mode, setMode, draft, setDraft, runSearch } = useApp();
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
      className={className ? `search ${className}` : "search"}
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
