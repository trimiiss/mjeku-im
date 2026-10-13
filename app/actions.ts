"use server";

import { getSupabase } from "@/lib/supabase";
import type { BookingError, BookingInput, BookingResult, CancelResult, FindResult, Mode } from "@/lib/types";

const KNOWN: BookingError[] = [
  "slot_unavailable",
  "video_unavailable",
  "too_many_bookings",
  "invalid_name",
  "invalid_phone",
  "invalid_email",
  "invalid_note",
  "not_found",
  "already_cancelled",
  "too_late",
];

function toError(message: string | undefined): BookingError {
  return KNOWN.find((k) => message?.includes(k)) ?? "unknown";
}

const clean = (s: unknown, max: number) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function bookSlot(input: BookingInput): Promise<BookingResult> {
  const name = clean(input.name, 80);
  const phone = clean(input.phone, 30);
  const email = clean(input.email, 120);
  const note = clean(input.note, 300);
  const reason = clean(input.reason, 80);
  const mode: Mode = input.mode === "video" ? "video" : "in_person";

  if (name.length < 3) return { ok: false, error: "invalid_name" };
  if (phone.replace(/[^0-9]/g, "").length < 8) return { ok: false, error: "invalid_phone" };

  const sb = getSupabase();
  if (!sb) return { ok: false, error: "unknown" };
  if (!Number.isInteger(input.slotId) || input.slotId < 0) return { ok: false, error: "slot_unavailable" };

  const { data, error } = await sb.rpc("book_slot", {
    p_slot_id: input.slotId,
    p_name: name,
    p_phone: phone,
    p_email: email || null,
    p_mode: mode,
    p_note: note || null,
    p_locale: input.lang === "en" ? "en" : "sq",
    p_reason: reason || null,
  });
  if (error) return { ok: false, error: toError(error.message) };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: "unknown" };
  return { ok: true, code: row.code, startsAt: row.starts_at, practitionerId: row.practitioner_id, mode: row.mode };
}

export async function findBooking(code: string, phone: string): Promise<FindResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "not_found" };

  const { data, error } = await sb.rpc("find_booking", { p_code: clean(code, 20), p_phone: clean(phone, 30) });
  if (error) return { ok: false, error: toError(error.message) };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: "not_found" };
  return {
    ok: true,
    booking: {
      code: row.code,
      status: row.status,
      startsAt: row.starts_at,
      mode: row.mode,
      patientName: row.patient_name,
      practitionerId: row.practitioner_id,
      canCancel: row.can_cancel,
    },
  };
}

export async function cancelBooking(code: string, phone: string): Promise<CancelResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "not_found" };

  const { error } = await sb.rpc("cancel_booking", { p_code: clean(code, 20), p_phone: clean(phone, 30) });
  if (error) return { ok: false, error: toError(error.message) };
  return { ok: true };
}
