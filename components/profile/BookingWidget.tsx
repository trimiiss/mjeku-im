"use client";

import { useMemo, useState } from "react";
import { addDaysKey, dayKey, daysBetween, formatPrice, formatTime, longDate, shortDate, shortDayName } from "@/lib/format";
import { PROFILE_DAYS, profileDicts, visitReasons } from "@/lib/profileText";
import { displayName, specialtyName } from "@/lib/search";
import type { Practitioner, Slot } from "@/lib/types";
import { useApp } from "../AppContext";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, VideoIcon } from "../Icons";
import { ClockIcon, EuroIcon } from "../IconsExtra";

const PER_PAGE = 4;
const ROWS = 4;
const PAGES = Math.ceil(PROFILE_DAYS / PER_PAGE);

/** "Book your appointment with …": specialty, visit reason, then a few days of free times side by side. */
export function BookingWidget({ p, slots }: { p: Practitioner; slots: Slot[] }) {
  const { t, lang, idx, todayKey, openBooking } = useApp();
  const w = profileDicts[lang].widget;
  const specialty = idx.specialtyById.get(p.specialty_id);
  const reasons = useMemo(() => visitReasons(p.specialty_id, lang), [p.specialty_id, lang]);
  // The index survives a language switch, so the chosen reason simply changes language.
  const [reasonIndex, setReasonIndex] = useState(0);
  const reason = reasons[reasonIndex] ?? reasons[0] ?? "";

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayKey(s.starts_at);
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [slots]);

  const pageOf = (key: string) => Math.min(PAGES - 1, Math.max(0, Math.floor(daysBetween(todayKey, key) / PER_PAGE)));
  const [page, setPage] = useState(() => (slots[0] ? pageOf(dayKey(slots[0].starts_at)) : 0));
  const [expanded, setExpanded] = useState(false);

  const columns = Array.from({ length: PER_PAGE }, (_, i) => {
    const key = addDaysKey(todayKey, page * PER_PAGE + i);
    return { key, slots: byDay.get(key) ?? [] };
  });
  const lastKey = columns[PER_PAGE - 1].key;
  const anyHere = columns.some((c) => c.slots.length > 0);
  const hasMore = columns.some((c) => c.slots.length > ROWS);
  const nextFree = anyHere ? null : slots.find((s) => dayKey(s.starts_at) > lastKey) ?? null;

  return (
    <section className="bw" aria-labelledby="bw-title">
      <div className="bw-head">
        <h2 id="bw-title">{w.title(displayName(p))}</h2>
        <p>{w.sub}</p>
      </div>

      <ol className="bw-steps">
        <li className="bw-step">
          <label htmlFor="bw-specialty" className="bw-label">
            <span className="bw-num" aria-hidden="true">
              1
            </span>
            {w.specialty}
          </label>
          <div className="select">
            <select id="bw-specialty" defaultValue={p.specialty_id}>
              <option value={p.specialty_id}>{specialtyName(specialty, lang)}</option>
            </select>
            <ChevronDownIcon width={18} height={18} />
          </div>
        </li>

        <li className="bw-step">
          <label htmlFor="bw-reason" className="bw-label">
            <span className="bw-num" aria-hidden="true">
              2
            </span>
            {w.reason}
          </label>
          <div className="select">
            <select id="bw-reason" value={reasonIndex} onChange={(e) => setReasonIndex(Number(e.target.value))}>
              {reasons.map((r, i) => (
                <option key={r} value={i}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDownIcon width={18} height={18} />
          </div>
        </li>

        <li className="bw-step">
          <p className="bw-label" id="bw-slot-label">
            <span className="bw-num" aria-hidden="true">
              3
            </span>
            {w.slot}
          </p>

          <div className="bw-cal" role="group" aria-labelledby="bw-slot-label">
            <button
              type="button"
              className="bw-arrow"
              aria-label={w.prev}
              disabled={page === 0}
              onClick={() => setPage((n) => Math.max(0, n - 1))}
            >
              <ChevronLeftIcon width={20} height={20} />
            </button>

            <div className={`bw-cols${expanded ? " is-expanded" : ""}`}>
              {columns.map((c) => {
                const shown = expanded ? c.slots : c.slots.slice(0, ROWS);
                return (
                  <div className="bw-col" key={c.key} role="group" aria-label={longDate(`${c.key}T12:00:00Z`, lang)}>
                    <p className={`bw-day${c.key === todayKey ? " is-today" : ""}`} aria-hidden="true">
                      <b>{shortDayName(c.key, lang)}</b>
                      <span>{shortDate(c.key, lang)}</span>
                    </p>
                    {shown.length > 0 ? (
                      <ul className="bw-times">
                        {shown.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              className="slot"
                              aria-label={`${longDate(s.starts_at, lang)}, ${formatTime(s.starts_at, lang)}`}
                              onClick={() => openBooking(s, { reason })}
                            >
                              {formatTime(s.starts_at, lang)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="bw-dash">
                        <span aria-hidden="true">–</span>
                        <span className="sr-only">{w.noneDay}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="bw-arrow"
              aria-label={w.next}
              disabled={page >= PAGES - 1}
              onClick={() => setPage((n) => Math.min(PAGES - 1, n + 1))}
            >
              <ChevronRightIcon width={20} height={20} />
            </button>
          </div>

          {!anyHere && (
            <div className="bw-none">
              <p>{w.none}</p>
              {nextFree && (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setPage(pageOf(dayKey(nextFree.starts_at)))}>
                  {w.nextFree(`${longDate(nextFree.starts_at, lang)}, ${formatTime(nextFree.starts_at, lang)}`)}
                </button>
              )}
            </div>
          )}

          {hasMore && (
            <button type="button" className="bw-more" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
              {expanded ? w.less : w.more}
              <ChevronDownIcon width={18} height={18} />
            </button>
          )}
        </li>
      </ol>

      <ul className="bw-foot">
        {p.price_eur !== null && (
          <li>
            <EuroIcon width={16} height={16} />
            {p.price_from ? `${t.common.from} ` : ""}
            {formatPrice(p.price_eur, lang)} {t.common.perVisit}
          </li>
        )}
        <li>
          <ClockIcon width={16} height={16} />
          {t.common.minutes(p.duration_min)}
        </li>
        {p.offers_video && (
          <li>
            <VideoIcon width={16} height={16} />
            {t.common.video}
          </li>
        )}
      </ul>
    </section>
  );
}
