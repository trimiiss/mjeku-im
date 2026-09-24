export type Lang = "sq" | "en";
export type Mode = "in_person" | "video";

export type City = { id: string; name_sq: string; name_en: string; aliases: string; sort: number };

export type Specialty = {
  id: string;
  name_sq: string;
  name_sq_f: string;
  name_en: string;
  keywords: string;
  sort: number;
};

export type Clinic = { id: string; name: string; type: string; city_id: string; neighborhood: string | null };

export type Practitioner = {
  id: string;
  title: string;
  full_name: string;
  gender: "f" | "m" | null;
  specialty_id: string;
  clinic_id: string;
  languages: string[];
  offers_video: boolean;
  open_saturday: boolean;
  price_eur: number | null;
  price_from: boolean;
  duration_min: number;
  featured: boolean;
};

export type Slot = { id: number; practitioner_id: string; starts_at: string; duration_min: number };

export type Directory = {
  cities: City[];
  specialties: Specialty[];
  clinics: Clinic[];
  practitioners: Practitioner[];
  slots: Slot[];
  source: "live" | "offline";
};

export type Query = {
  q: string;
  city: string;
  mode: Mode;
  specialtyId?: string;
  cityId?: string;
  clinicType?: string;
  label?: string;
};

export type BookingInput = {
  slotId: number;
  name: string;
  phone: string;
  email: string;
  note: string;
  mode: Mode;
  lang: Lang;
};

export type BookingError =
  | "slot_unavailable"
  | "video_unavailable"
  | "too_many_bookings"
  | "invalid_name"
  | "invalid_phone"
  | "invalid_email"
  | "invalid_note"
  | "not_found"
  | "already_cancelled"
  | "too_late"
  | "unknown";

export type BookingResult =
  | { ok: true; code: string; startsAt: string; practitionerId: string; mode: Mode; offline: boolean }
  | { ok: false; error: BookingError };

export type FoundBooking = {
  code: string;
  status: "confirmed" | "cancelled";
  startsAt: string;
  mode: Mode;
  patientName: string;
  practitionerId: string;
  canCancel: boolean;
};

export type FindResult = { ok: true; booking: FoundBooking } | { ok: false; error: BookingError };
export type CancelResult = { ok: true } | { ok: false; error: BookingError };
