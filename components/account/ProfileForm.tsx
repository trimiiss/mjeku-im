"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { accountDicts, type SaveError } from "@/lib/accountText";
import { dayName } from "@/lib/format";
import { profileHref } from "@/lib/routes";
import { cityName, specialtyName } from "@/lib/search";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import { clinicTypes, languageNames } from "@/lib/taxonomy";
import type { ListedPractice } from "@/lib/types";
import { useApp } from "../AppContext";
import { ChevronDownIcon } from "../Icons";
import { AlertIcon, CheckCircleIcon } from "../IconsExtra";

/** What my_profile() returns: the signed-in practitioner's profile, practice and opening hours. */
export type MyProfile = {
  practitioner: {
    id: string;
    title: string;
    full_name: string;
    gender: "f" | "m" | null;
    specialty_id: string;
    languages: string[];
    offers_video: boolean;
    price_eur: number | null;
    price_from: boolean;
    duration_min: number;
    years_experience: number | null;
    accepts_new_patients: boolean;
    active: boolean;
    verified: boolean;
    about: string | null;
    listed_practice_id: string | null;
  };
  clinic: {
    name: string;
    type: string;
    city_id: string;
    neighborhood: string | null;
    postal_code: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
  };
  hours: { weekday: number; start: string; end: string }[];
};

type ListedOption = Pick<ListedPractice, "id" | "name" | "kind" | "neighborhood" | "address" | "phone" | "website">;

const TITLES = ["Dr.", "Dr. sc.", "Mr. sc.", "Prof. Dr.", "Prof. Asoc. Dr.", ""];
const DURATIONS = [10, 15, 20, 30, 45, 60, 90];

type Day = { open: boolean; start: string; end: string };

type Form = {
  title: string;
  full_name: string;
  gender: "" | "f" | "m";
  specialty_id: string;
  years_experience: string;
  languages: string[];
  about: string;
  listed_practice_id: string;
  clinic_name: string;
  clinic_type: string;
  city_id: string;
  neighborhood: string;
  address: string;
  postal_code: string;
  phone: string;
  website: string;
  duration_min: string;
  price_eur: string;
  price_from: boolean;
  accepts_new_patients: boolean;
  offers_video: boolean;
  /** Monday first. */
  days: Day[];
  published: boolean;
};

function initialForm(p: MyProfile | null, claim: ListedPractice | null): Form {
  if (p) {
    const pr = p.practitioner;
    const c = p.clinic;
    return {
      title: pr.title,
      full_name: pr.full_name,
      gender: pr.gender ?? "",
      specialty_id: pr.specialty_id,
      years_experience: pr.years_experience === null ? "" : String(pr.years_experience),
      languages: pr.languages,
      about: pr.about ?? "",
      listed_practice_id: pr.listed_practice_id ?? "",
      clinic_name: c.name,
      clinic_type: c.type,
      city_id: c.city_id,
      neighborhood: c.neighborhood ?? "",
      address: c.address ?? "",
      postal_code: c.postal_code ?? "",
      phone: c.phone ?? "",
      website: c.website ?? "",
      duration_min: String(pr.duration_min),
      price_eur: pr.price_eur === null ? "" : String(pr.price_eur),
      price_from: pr.price_from,
      accepts_new_patients: pr.accepts_new_patients,
      offers_video: pr.offers_video,
      days: Array.from({ length: 7 }, (_, i) => {
        const h = p.hours.find((x) => x.weekday === i + 1);
        return h ? { open: true, start: h.start, end: h.end } : { open: false, start: "08:00", end: "16:00" };
      }),
      published: pr.active,
    };
  }
  return {
    title: "Dr.",
    full_name: "",
    gender: "",
    specialty_id: claim?.specialty_ids[0] ?? "",
    years_experience: "",
    languages: ["sq"],
    about: "",
    listed_practice_id: claim?.id ?? "",
    clinic_name: claim?.name ?? "",
    clinic_type: claim && clinicTypes[claim.kind] ? claim.kind : "practice",
    city_id: claim?.city_id ?? "",
    neighborhood: claim?.neighborhood ?? "",
    address: claim?.address ?? "",
    postal_code: "",
    phone: claim?.phone ?? "",
    website: claim?.website ?? "",
    duration_min: "20",
    price_eur: "",
    price_from: false,
    accepts_new_patients: true,
    offers_video: false,
    // Monday to Friday, 08:00–16:00.
    days: Array.from({ length: 7 }, (_, i) => ({ open: i < 5, start: "08:00", end: "16:00" })),
    published: true,
  };
}

function Select({ id, value, onChange, children, required }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="select">
      <select id={id} value={value} required={required} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDownIcon width={18} height={18} />
    </div>
  );
}

/** The practitioner's profile, practice, visits and opening hours, saved with save_my_profile(). */
export function ProfileForm({
  initial,
  claim,
  onSaved,
}: {
  initial: MyProfile | null;
  claim: ListedPractice | null;
  onSaved: (p: MyProfile) => void;
}) {
  const { lang, dir } = useApp();
  const a = accountDicts[lang];
  const [form, setForm] = useState<Form>(() => initialForm(initial, claim));
  const [options, setOptions] = useState<ListedOption[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SaveError | null>(null);
  const [saved, setSaved] = useState<MyProfile | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(null);
  };
  const setDay = (i: number, patch: Partial<Day>) => set("days", form.days.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  // Listed practices for the chosen specialty and municipality, for "your practice in our lists".
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb || !form.city_id || !form.specialty_id) {
      setOptions([]);
      return;
    }
    let alive = true;
    sb.from("open_listed_practices")
      .select("id, name, kind, neighborhood, address, phone, website")
      .eq("city_id", form.city_id)
      .contains("specialty_ids", [form.specialty_id])
      .order("name")
      .limit(500)
      .then(({ data }) => {
        if (alive) setOptions((data ?? []) as ListedOption[]);
      });
    return () => {
      alive = false;
    };
  }, [form.city_id, form.specialty_id]);

  // The chosen practice may not be among the options (e.g. already replaced by this verified profile).
  const listedOptions =
    form.listed_practice_id && !options.some((o) => o.id === form.listed_practice_id)
      ? [{ id: form.listed_practice_id, name: claim?.name ?? form.clinic_name } as ListedOption, ...options]
      : options;

  const pickListed = (id: string) => {
    const o = options.find((x) => x.id === id);
    setSaved(null);
    setForm((f) => ({
      ...f,
      listed_practice_id: id,
      ...(o && {
        clinic_name: o.name,
        clinic_type: clinicTypes[o.kind] ? o.kind : f.clinic_type,
        neighborhood: o.neighborhood ?? "",
        address: o.address ?? "",
        phone: o.phone ?? f.phone,
        website: o.website ?? f.website,
      }),
    }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb) return;
    const website = form.website.trim();
    const payload = {
      practitioner: {
        title: form.title,
        full_name: form.full_name,
        gender: form.gender || null,
        specialty_id: form.specialty_id,
        years_experience: form.years_experience.trim(),
        languages: form.languages,
        about: form.about,
        price_eur: form.price_eur.trim(),
        price_from: form.price_from,
        duration_min: form.duration_min,
        accepts_new_patients: form.accepts_new_patients,
        offers_video: form.offers_video,
      },
      clinic: {
        name: form.clinic_name,
        type: form.clinic_type,
        city_id: form.city_id,
        neighborhood: form.neighborhood,
        address: form.address,
        postal_code: form.postal_code.trim(),
        phone: form.phone.trim(),
        website: website && !/^https?:\/\//i.test(website) ? `https://${website}` : website,
      },
      hours: form.days.flatMap((d, i) => (d.open ? [{ weekday: i + 1, start: d.start.slice(0, 5), end: d.end.slice(0, 5) }] : [])),
      listed_practice_id: form.listed_practice_id,
      published: form.published,
    };
    setPending(true);
    setError(null);
    setSaved(null);
    const { data, error } = await sb.rpc("save_my_profile", { p_profile: payload });
    setPending(false);
    if (error) {
      // The database raises codes like "invalid_phone" as the message.
      setError((error.message in a.saveErrors ? error.message : "unknown") as SaveError);
      return;
    }
    const profile = data as MyProfile;
    setSaved(profile);
    onSaved(profile);
  }

  const languages = Object.keys(languageNames);

  return (
    <form className="account-card account-form" onSubmit={submit}>
      <fieldset>
        <legend>{a.you}</legend>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="pf-title">{a.titleField}</label>
            <Select id="pf-title" value={form.title} onChange={(v) => set("title", v)}>
              {TITLES.map((t) => (
                <option key={t} value={t}>
                  {t || a.noTitle}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="pf-name">{a.fullName}</label>
            <input
              id="pf-name"
              required
              minLength={3}
              maxLength={80}
              autoComplete="name"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
            />
          </div>
          <fieldset className="form-field form-radios">
            <legend>{a.gender}</legend>
            <div>
              {(["f", "m"] as const).map((g) => (
                <label key={g} className="consent">
                  <input type="radio" name="pf-gender" required checked={form.gender === g} onChange={() => set("gender", g)} />
                  <span>{g === "f" ? a.female : a.male}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form-field">
            <label htmlFor="pf-specialty">{a.specialty}</label>
            <Select id="pf-specialty" required value={form.specialty_id} onChange={(v) => set("specialty_id", v)}>
              <option value="" disabled>
                {a.choose}
              </option>
              {dir.specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {specialtyName(s, lang)}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="pf-years">{a.experience}</label>
            <input
              id="pf-years"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={form.years_experience}
              onChange={(e) => set("years_experience", e.target.value)}
            />
          </div>
        </div>
        <fieldset className="form-field form-checks">
          <legend>{a.languages}</legend>
          <div>
            {languages.map((code) => (
              <label key={code} className="consent">
                <input
                  type="checkbox"
                  checked={form.languages.includes(code)}
                  onChange={(e) =>
                    set("languages", e.target.checked ? [...form.languages, code] : form.languages.filter((l) => l !== code))
                  }
                />
                <span>{(languageNames[code]?.[lang] ?? code).replace(/^./, (c) => c.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="form-field">
          <label htmlFor="pf-about">{a.about}</label>
          <textarea
            id="pf-about"
            rows={5}
            maxLength={1500}
            value={form.about}
            onChange={(e) => set("about", e.target.value)}
            aria-describedby="pf-about-hint"
          />
          <small id="pf-about-hint">
            {a.aboutHint} {form.about.length}/1500
          </small>
        </div>
      </fieldset>

      <fieldset>
        <legend>{a.practice}</legend>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="pf-city">{a.city}</label>
            <Select id="pf-city" required value={form.city_id} onChange={(v) => set("city_id", v)}>
              <option value="" disabled>
                {a.choose}
              </option>
              {dir.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {cityName(c, lang)}
                </option>
              ))}
            </Select>
          </div>
          {listedOptions.length > 0 && (
            <div className="form-field form-wide">
              <label htmlFor="pf-listed">{a.listed}</label>
              <Select id="pf-listed" value={form.listed_practice_id} onChange={pickListed}>
                <option value="">{a.notListed}</option>
                {listedOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {[o.name, o.address ?? o.neighborhood].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </Select>
              <small>{a.listedHint}</small>
            </div>
          )}
          <div className="form-field">
            <label htmlFor="pf-clinic">{a.clinicName}</label>
            <input
              id="pf-clinic"
              required
              minLength={2}
              maxLength={100}
              autoComplete="organization"
              value={form.clinic_name}
              onChange={(e) => set("clinic_name", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="pf-type">{a.clinicType}</label>
            <Select id="pf-type" value={form.clinic_type} onChange={(v) => set("clinic_type", v)}>
              {Object.entries(clinicTypes).map(([id, label]) => (
                <option key={id} value={id}>
                  {label[lang]}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="pf-hood">{a.neighborhood}</label>
            <input id="pf-hood" maxLength={60} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="pf-address">{a.address}</label>
            <input
              id="pf-address"
              maxLength={120}
              autoComplete="street-address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="pf-postal">{a.postalCode}</label>
            <input
              id="pf-postal"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              autoComplete="postal-code"
              value={form.postal_code}
              onChange={(e) => set("postal_code", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="pf-phone">{a.phone}</label>
            <input
              id="pf-phone"
              type="tel"
              inputMode="tel"
              maxLength={22}
              autoComplete="tel"
              placeholder="+383 44 123 456"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-describedby="pf-phone-hint"
            />
            <small id="pf-phone-hint">{a.phoneHint}</small>
          </div>
          <div className="form-field form-wide">
            <label htmlFor="pf-website">{a.website}</label>
            <input
              id="pf-website"
              inputMode="url"
              maxLength={200}
              autoComplete="url"
              placeholder="https://"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>{a.visits}</legend>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="pf-duration">{a.duration}</label>
            <Select id="pf-duration" value={form.duration_min} onChange={(v) => set("duration_min", v)}>
              {DURATIONS.map((n) => (
                <option key={n} value={String(n)}>
                  {a.minutes(n)}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="pf-price">{a.price}</label>
            <input
              id="pf-price"
              type="number"
              inputMode="numeric"
              min={0}
              max={2000}
              value={form.price_eur}
              onChange={(e) => set("price_eur", e.target.value)}
              aria-describedby="pf-price-hint"
            />
            <small id="pf-price-hint">{a.priceHint}</small>
          </div>
        </div>
        <div className="form-checks-col">
          <label className="consent">
            <input type="checkbox" checked={form.price_from} onChange={(e) => set("price_from", e.target.checked)} />
            <span>{a.priceFrom}</span>
          </label>
          <label className="consent">
            <input
              type="checkbox"
              checked={form.accepts_new_patients}
              onChange={(e) => set("accepts_new_patients", e.target.checked)}
            />
            <span>{a.acceptsNew}</span>
          </label>
          <label className="consent">
            <input type="checkbox" checked={form.offers_video} onChange={(e) => set("offers_video", e.target.checked)} />
            <span>{a.video}</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>{a.hours}</legend>
        <p className="small muted">{a.hoursHint}</p>
        <ul className="hours-edit">
          {form.days.map((d, i) => {
            const day = dayName(i + 1, lang);
            return (
              <li key={i} className={d.open ? undefined : "is-closed"}>
                <label className="consent">
                  <input type="checkbox" checked={d.open} onChange={(e) => setDay(i, { open: e.target.checked })} />
                  <span>{day}</span>
                </label>
                <input
                  type="time"
                  step={300}
                  min="05:00"
                  max="23:30"
                  required={d.open}
                  disabled={!d.open}
                  aria-label={`${day}: ${a.from}`}
                  value={d.start}
                  onChange={(e) => setDay(i, { start: e.target.value })}
                />
                <span aria-hidden="true">–</span>
                <input
                  type="time"
                  step={300}
                  min="05:00"
                  max="23:30"
                  required={d.open}
                  disabled={!d.open}
                  aria-label={`${day}: ${a.to}`}
                  value={d.end}
                  onChange={(e) => setDay(i, { end: e.target.value })}
                />
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend>{a.publishing}</legend>
        <label className="consent">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
          <span>
            {a.published}
            <br />
            <small className="muted">{a.publishedHint}</small>
          </span>
        </label>
      </fieldset>

      {error && (
        <p className="form-error" role="alert">
          <AlertIcon width={18} height={18} />
          <span>{a.saveErrors[error]}</span>
        </p>
      )}
      {saved && (
        <p className="form-ok" role="status">
          <CheckCircleIcon width={18} height={18} />
          <span>
            {a.saved}{" "}
            {saved.practitioner.active && <Link href={profileHref(saved.practitioner.id)}>{a.viewProfile}</Link>}
          </span>
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? a.saving : a.save}
      </button>
    </form>
  );
}
