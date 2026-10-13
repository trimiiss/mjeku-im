"use client";

import { useCallback, useEffect, useState } from "react";
import { accountDicts } from "@/lib/accountText";
import { formatTime, longDate } from "@/lib/format";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { useApp } from "../AppContext";
import { HouseCrossIcon, PhoneIcon, VideoIcon } from "../Icons";
import { AlertIcon } from "../IconsExtra";

/** What my_bookings() returns. */
type Booking = {
  code: string;
  starts_at: string;
  mode: "in_person" | "video";
  status: "confirmed" | "cancelled";
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  note: string | null;
  reason: string | null;
};

function BookingList({ rows }: { rows: Booking[] }) {
  const { lang } = useApp();
  const a = accountDicts[lang];
  return (
    <ul className="bk-list">
      {rows.map((b) => (
        <li key={b.code} className={b.status === "cancelled" ? "is-cancelled" : undefined}>
          <div className="bk-when">
            <b>{formatTime(b.starts_at, lang)}</b>
            <span>{longDate(b.starts_at, lang)}</span>
          </div>
          <div className="bk-who">
            <p>
              <b>{b.patient_name}</b>
              <span className="badge">
                {b.mode === "video" ? <VideoIcon width={14} height={14} /> : <HouseCrossIcon width={14} height={14} />}
                {b.mode === "video" ? a.byVideo : a.atClinic}
              </span>
              {b.status === "cancelled" && <span className="badge badge--off">{a.cancelled}</span>}
            </p>
            <p className="bk-contact">
              <a href={`tel:${b.patient_phone}`}>
                <PhoneIcon width={15} height={15} />
                {b.patient_phone}
              </a>
              {b.patient_email && <a href={`mailto:${b.patient_email}`}>{b.patient_email}</a>}
            </p>
            {b.reason && (
              <p className="small">
                {a.reason}: {b.reason}
              </p>
            )}
            {b.note && (
              <p className="small">
                {a.note}: {b.note}
              </p>
            )}
            <p className="small muted">
              {a.code}: {b.code}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The practitioner's bookings: upcoming first, then the last 30 days and cancellations. */
export function MyBookings({ hasProfile }: { hasProfile: boolean }) {
  const { lang } = useApp();
  const a = accountDicts[lang];
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    const sb = getBrowserSupabase();
    if (!sb || !hasProfile) return;
    setLoading(true);
    sb.rpc("my_bookings").then(({ data, error }) => {
      setLoading(false);
      setFailed(Boolean(error));
      if (!error) setRows((data ?? []) as Booking[]);
    });
  }, [hasProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const upcoming = (rows ?? []).filter((b) => b.status === "confirmed" && new Date(b.starts_at).getTime() > now);
  const rest = (rows ?? []).filter((b) => !upcoming.includes(b)).reverse();

  return (
    <section className="account-card" aria-labelledby="bk-title">
      <div className="account-card-head">
        <h2 id="bk-title">{a.bookingsTitle}</h2>
        {hasProfile && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
            {a.refresh}
          </button>
        )}
      </div>

      {!hasProfile ? (
        <p className="muted">{a.bookingsNeedProfile}</p>
      ) : failed ? (
        <p className="form-error" role="alert">
          <AlertIcon width={18} height={18} />
          <span>{a.bookingsError}</span>
        </p>
      ) : rows === null ? (
        <p className="muted" role="status">
          {a.loading}
        </p>
      ) : rows.length === 0 ? (
        <p className="muted">{a.bookingsEmpty}</p>
      ) : (
        <>
          <h3 className="bk-group">
            {a.upcoming} ({upcoming.length})
          </h3>
          {upcoming.length > 0 && <BookingList rows={upcoming} />}
          {rest.length > 0 && (
            <details className="bk-past">
              <summary>
                {a.pastAndCancelled} ({rest.length})
              </summary>
              <BookingList rows={rest} />
            </details>
          )}
        </>
      )}
    </section>
  );
}
