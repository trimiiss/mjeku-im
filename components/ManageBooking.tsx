"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { cancelBooking, findBooking } from "@/app/actions";
import { formatTime, longDate } from "@/lib/format";
import { cityName, displayName, initials, specialtyName } from "@/lib/search";
import type { FoundBooking } from "@/lib/types";
import { useApp } from "./AppContext";
import { CloseIcon, PinIcon } from "./Icons";
import { AlertIcon, CheckCircleIcon } from "./IconsExtra";

export function ManageBooking() {
  const { t, lang, idx, manageOpen, setManageOpen, refresh } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [found, setFound] = useState<FoundBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const m = t.manage;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (manageOpen && !d.open) d.showModal();
    if (!manageOpen && d.open) d.close();
  }, [manageOpen]);

  const reset = () => {
    setFound(null);
    setError(null);
    setConfirming(false);
    setDone(false);
  };

  const onFind = (e: FormEvent) => {
    e.preventDefault();
    reset();
    startTransition(async () => {
      const r = await findBooking(code, phone);
      if (r.ok) setFound(r.booking);
      else setError(t.errors[r.error]);
    });
  };

  const onCancel = () => {
    startTransition(async () => {
      const r = await cancelBooking(code, phone);
      if (r.ok) {
        setDone(true);
        setConfirming(false);
        setFound((f) => (f ? { ...f, status: "cancelled", canCancel: false } : f));
        refresh();
      } else {
        setError(t.errors[r.error]);
        setConfirming(false);
      }
    });
  };

  const p = found ? idx.practitionerById.get(found.practitionerId) : undefined;
  const clinic = p ? idx.clinicById.get(p.clinic_id) : undefined;

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="manage-title"
      onClose={() => setManageOpen(false)}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="dialog-inner">
        <div className="dialog-head">
          <h2 id="manage-title">{m.title}</h2>
          <button type="button" className="dialog-x" onClick={() => ref.current?.close()} aria-label={t.common.close}>
            <CloseIcon width={20} height={20} />
          </button>
        </div>

        {!found ? (
          <form className="booking-form" onSubmit={onFind}>
            <p className="muted">{m.lede}</p>
            <div className="form-field">
              <label htmlFor="mg-code">{m.code}</label>
              <input
                id="mg-code"
                name="code"
                autoComplete="off"
                autoCapitalize="characters"
                required
                maxLength={20}
                placeholder={m.codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="form-field">
              <label htmlFor="mg-phone">{m.phone}</label>
              <input
                id="mg-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={30}
                placeholder={t.booking.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {error && (
              <p className="form-error" role="alert">
                <AlertIcon width={18} height={18} />
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
              {pending ? m.finding : m.find}
            </button>
          </form>
        ) : (
          <div className="manage-found">
            <div className="booking-summary">
              <span className="avatar" aria-hidden="true">
                {p ? initials(p.full_name) : "?"}
              </span>
              <div>
                <p className="doc-name">{p ? displayName(p) : found.practitionerId}</p>
                <p className="doc-meta">{p ? specialtyName(idx.specialtyById.get(p.specialty_id), lang, p.gender) : ""}</p>
              </div>
              <p className="booking-when">
                <b>{longDate(found.startsAt, lang)}</b>
                <span>
                  {formatTime(found.startsAt, lang)} · {found.mode === "video" ? t.common.video : t.common.inPerson}
                </span>
              </p>
              {clinic && (
                <p className="booking-where">
                  <PinIcon width={16} height={16} />
                  {clinic.name}, {cityName(idx.cityById.get(clinic.city_id), lang)}
                </p>
              )}
            </div>

            <dl className="manage-meta">
              <div>
                <dt>{m.code}</dt>
                <dd className="code-inline">{found.code}</dd>
              </div>
              <div>
                <dt>{m.patient}</dt>
                <dd>{found.patientName}</dd>
              </div>
              <div>
                <dt>{m.status}</dt>
                <dd>
                  <span className={`status status--${found.status}`}>
                    {found.status === "confirmed" ? m.statusConfirmed : m.statusCancelled}
                  </span>
                </dd>
              </div>
            </dl>

            {done && (
              <p className="form-ok" role="status">
                <CheckCircleIcon width={18} height={18} />
                {m.cancelled}
              </p>
            )}
            {error && (
              <p className="form-error" role="alert">
                <AlertIcon width={18} height={18} />
                {error}
              </p>
            )}

            {found.status === "confirmed" && !found.canCancel && <p className="muted small">{m.cannotCancel}</p>}

            {found.status === "confirmed" && found.canCancel && !confirming && (
              <button type="button" className="btn btn-danger btn-block" onClick={() => setConfirming(true)}>
                {m.cancel}
              </button>
            )}

            {confirming && (
              <div className="confirm-box">
                <p>{m.confirmCancel}</p>
                <div className="dialog-actions">
                  <button type="button" className="btn btn-danger" onClick={onCancel} disabled={pending}>
                    {m.yesCancel}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setConfirming(false)}>
                    {m.keep}
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              className="link"
              onClick={() => {
                reset();
                setCode("");
              }}
            >
              {m.another}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
