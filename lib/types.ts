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

export type Clinic = {
  id: string;
  name: string;
  type: string;
  city_id: string;
  neighborhood: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
};

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
  years_experience: number | null;
  accepts_new_patients: boolean;
  featured: boolean;
  /** Created by the practitioner through their account. */
  self_registered?: boolean;
  /** Checked by Mjeku.Im. */
  verified?: boolean;
};

/** Profile-page extras a practitioner can fill in through their account. */
export type ProfileDetails = { about: string | null; address: string | null; phone: string | null; website: string | null };

/** A real practice that isn't on Mjeku.Im yet: shown on listing pages with its phone, not bookable online. */
export type ListedPractice = {
  id: string;
  name: string;
  /** A key of clinicTypes in lib/taxonomy.ts. */
  kind: string;
  sector: "public" | "private" | null;
  specialty_ids: string[];
  city_id: string;
  neighborhood: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  checked_on: string;
};

/** Weekly opening hours. weekday: 1 = Monday ... 7 = Sunday. Times are "HH:MM" or "HH:MM:SS". */
export type Schedule = { weekday: number; start_time: string; end_time: string };

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
  reason?: string;
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
  | { ok: true; code: string; startsAt: string; practitionerId: string; mode: Mode }
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
