"use client";

import Link from "next/link";
import { addDaysKey, dayKey, formatPrice, formatTime, longDate, shortDate, shortDayName } from "@/lib/format";
import { pagesDicts } from "@/lib/pagesText";
import { profileDicts, specialtyInfo } from "@/lib/profileText";
import { profileHref } from "@/lib/routes";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import type { Practitioner } from "@/lib/types";
import { useApp } from "../AppContext";
import { CheckIcon, PinIcon, SunIcon, VideoIcon } from "../Icons";
import { FlaskIcon } from "../IconsExtra";

const DAYS = 4;
const PER_DAY = 3;

/** One result, like OneDoc's: who and where on the left, the next days' free times on the right. */
export function ResultCard({ p, nextFree }: { p: Practitioner; nextFree?: string }) {
  const { t, lang, idx, todayKey, openBooking } = useApp();
  const r = pagesDicts[lang].results;
  const pt = profileDicts[lang];
  const clinic = idx.clinicById.get(p.clinic_id);
  const city = cityName(clinic && idx.cityById.get(clinic.city_id), lang);
  const name = displayName(p);
  const href = profileHref(p.id);
  const focus = specialtyInfo[p.specialty_id]?.focus[lang] ?? [];
  const slots = idx.slotsByPractitioner.get(p.id) ?? [];
  const days = Array.from({ length: DAYS }, (_, i) => {
    const key = addDaysKey(todayKey, i);
    return { key, slots: slots.filter((s) => dayKey(s.starts_at) === key) };
  });
  const anyInGrid = days.some((d) => d.slots.length > 0);
  const address = [clinic?.name, clinic?.neighborhood, city].filter(Boolean).join(", ");

  return (
    <li className="rcard">
      <div className="rcard-info">
        <span className="avatar rcard-avatar" aria-hidden="true">
          {p.gender ? initials(p.full_name) : <FlaskIcon width={26} height={26} />}
        </span>
        <div className="rcard-main">
          <h3 className="rcard-name">
            <Link href={href}>{name}</Link>
          </h3>
          <p className="rcard-spec">{specialtyName(idx.specialtyById.get(p.specialty_id), lang, p.gender)}</p>
          <p className="rcard-where">
            <PinIcon width={16} height={16} />
            <span>{address}</span>
          </p>
          <div className="badges">
            {p.accepts_new_patients && (
              <span className="badge badge--ok">
                <CheckIcon width={14} height={14} />
                {pt.acceptsNewShort}
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
            {p.price_eur !== null && (
              <span className="badge badge--price">
                {p.price_from ? `${t.common.from} ` : ""}
                {formatPrice(p.price_eur, lang)}
              </span>
            )}
          </div>
          {focus.length > 0 && (
            <ul className="rcard-tags">
              {focus.slice(0, 3).map((f) => (
                <li key={f}>{f}</li>
              ))}
              {focus.length > 3 && (
                <li className="rcard-tags-more">
                  <Link href={href}>{r.moreTags(focus.length - 3)}</Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="rcard-cal" role="group" aria-label={r.slotsFor(name)}>
        <div className="rcard-days">
          {days.map((d) => (
            <div className="rcard-day" key={d.key}>
              <p className={`bw-day${d.key === todayKey ? " is-today" : ""}`} aria-hidden="true">
                <b>{shortDayName(d.key, lang)}</b>
                <span>{shortDate(d.key, lang)}</span>
              </p>
              {d.slots.length > 0 ? (
                <ul className="bw-times">
                  {d.slots.slice(0, PER_DAY).map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="slot"
                        aria-label={`${longDate(s.starts_at, lang)}, ${formatTime(s.starts_at, lang)}`}
                        onClick={() => openBooking(s)}
                      >
                        {formatTime(s.starts_at, lang)}
                      </button>
                    </li>
                  ))}
                  {d.slots.length > PER_DAY && (
                    <li>
                      <Link className="slot slot--more rcard-more" href={`${href}#book`}>
                        +{d.slots.length - PER_DAY}
                      </Link>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="bw-dash">
                  <span aria-hidden="true">–</span>
                  <span className="sr-only">{pt.widget.noneDay}</span>
                </p>
              )}
            </div>
          ))}
        </div>

        {!anyInGrid && (
          <p className="rcard-next">
            {nextFree ? (
              <Link href={`${href}#book`}>{r.firstFree(`${longDate(nextFree, lang)}, ${formatTime(nextFree, lang)}`)}</Link>
            ) : (
              r.noOnline
            )}
          </p>
        )}

        <div className="rcard-actions">
          <Link className="btn btn-primary btn-sm" href={`${href}#book`}>
            {r.book}
          </Link>
          <Link className="link" href={href}>
            {pt.viewProfile}
          </Link>
        </div>
      </div>
    </li>
  );
}
