"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { bookSlot } from "@/app/actions";
import { formatPrice, formatTime, longDate } from "@/lib/format";
import { profileDicts } from "@/lib/profileText";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import type { BookingResult, Mode, Slot } from "@/lib/types";
import { useApp } from "./AppContext";
import { CloseIcon, HouseCrossIcon, PinIcon, VideoIcon } from "./Icons";
import { AlertIcon, CalendarPlusIcon, CheckCircleIcon } from "./IconsExtra";

type Success = Extract<BookingResult, { ok: true }>;

const icsText = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function icsHref(code: string, slot: Slot, title: string, location: string) {
  const start = new Date(slot.starts_at);
  const end = new Date(start.getTime() + slot.duration_min * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mjeku.Im//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${code}@mjeku.im`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(title)}`,
    `LOCATION:${icsText(location)}`,
    `DESCRIPTION:${icsText(code)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

export function BookingDialog() {
  const { t, lang, idx, bookingSlot, bookingReason, closeBooking, refresh } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("in_person");
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Success | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (bookingSlot) {
      setSlot(bookingSlot);
      setReason(bookingReason);
      setMode("in_person");
      setError(null);
      setResult(null);
      setConsent(false);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [bookingSlot, bookingReason]);

  const p = slot ? idx.practitionerById.get(slot.practitioner_id) : undefined;
  const clinic = p ? idx.clinicById.get(p.clinic_id) : undefined;
  const city = cityName(clinic && idx.cityById.get(clinic.city_id), lang);
  const b = t.booking;

  const onClose = () => {
    closeBooking();
    if (result) refresh();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    if (!consent) {
      setError(b.consentRequired);
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await bookSlot({ slotId: slot.id, ...form, mode, lang, reason: reason ?? undefined });
      if (r.ok) {
        setResult(r);
      } else {
        setError(t.errors[r.error]);
        if (r.error === "slot_unavailable") refresh();
      }
    });
  };

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="booking-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {slot && p && (
        <div className="dialog-inner">
          <div className="dialog-head">
            <h2 id="booking-title">{result ? b.successTitle : b.title}</h2>
            <button type="button" className="dialog-x" onClick={() => ref.current?.close()} aria-label={t.common.close}>
              <CloseIcon width={20} height={20} />
            </button>
          </div>

          <div className="booking-summary">
            <span className="avatar" aria-hidden="true">
              {initials(p.full_name)}
            </span>
            <div>
              <p className="doc-name">{displayName(p)}</p>
              <p className="doc-meta">{specialtyName(idx.specialtyById.get(p.specialty_id), lang, p.gender)}</p>
            </div>
            <p className="booking-when">
              <b>{longDate(slot.starts_at, lang)}</b>
              <span>
                {formatTime(slot.starts_at, lang)} · {t.common.minutes(slot.duration_min)}
              </span>
            </p>
            {reason && (
              <p className="booking-reason">
                <span>{profileDicts[lang].reasonLabel}</span>
                {reason}
              </p>
            )}
            <p className="booking-where">
              <PinIcon width={16} height={16} />
              {clinic?.name}, {city}
              {p.price_eur !== null && (
                <span className="booking-price">
                  {p.price_from ? `${t.common.from} ` : ""}
                  {formatPrice(p.price_eur, lang)}
                </span>
              )}
            </p>
          </div>

          {result ? (
            <div className="booking-done">
              <p className="done-icon">
                <CheckCircleIcon width={28} height={28} />
              </p>
              <p className="code-label">{b.codeLabel}</p>
              <p className="code">{result.code}</p>
              <p className="muted">{b.keepCode}</p>
              <p className="demo-note">{result.offline ? b.offlineNote : b.demoNote}</p>
              <div className="dialog-actions">
                <a
                  className="btn btn-outline"
                  href={icsHref(result.code, slot, b.calendarTitle(displayName(p)), `${clinic?.name ?? ""}, ${city}`)}
                  download={`mjeku-im-${result.code}.ics`}
                >
                  <CalendarPlusIcon />
                  {b.addToCalendar}
                </a>
                <button type="button" className="btn btn-primary" onClick={() => ref.current?.close()}>
                  {b.done}
                </button>
              </div>
            </div>
          ) : (
            <form className="booking-form" onSubmit={submit} noValidate>
              {p.offers_video && (
                <fieldset className="mode-pick">
                  <legend>{b.mode}</legend>
                  <label>
                    <input
                      type="radio"
                      name="mode"
                      value="in_person"
                      checked={mode === "in_person"}
                      onChange={() => setMode("in_person")}
                    />
                    <HouseCrossIcon width={18} height={18} />
                    {t.common.inPerson}
                  </label>
                  <label>
                    <input type="radio" name="mode" value="video" checked={mode === "video"} onChange={() => setMode("video")} />
                    <VideoIcon width={18} height={18} />
                    {t.common.video}
                  </label>
                </fieldset>
              )}

              <div className="form-field">
                <label htmlFor="bk-name">{b.name}</label>
                <input
                  id="bk-name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="bk-phone">{b.phone}</label>
                <input
                  id="bk-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                  placeholder={b.phonePlaceholder}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <small>{b.phoneHint}</small>
              </div>
              <div className="form-field">
                <label htmlFor="bk-email">{b.email}</label>
                <input
                  id="bk-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="bk-note">{b.note}</label>
                <textarea
                  id="bk-note"
                  name="note"
                  rows={2}
                  maxLength={300}
                  placeholder={b.notePlaceholder}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                />
                <span>{b.consent}</span>
              </label>

              {error && (
                <p className="form-error" role="alert">
                  <AlertIcon width={18} height={18} />
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
                {pending ? b.submitting : b.submit}
              </button>
              <p className="demo-note">{b.demoNote}</p>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
