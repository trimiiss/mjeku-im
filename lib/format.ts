import type { Lang } from "./types";

// Kosovo local time. Europe/Tirane follows the same CET/CEST rules.
export const TZ = "Europe/Tirane";

// Names are spelled out here instead of relying on the browser's locale data,
// which is missing for Albanian in some browsers and would make server and client disagree.
const DAYS: Record<Lang, string[]> = {
  sq: ["e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë", "e diel"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};
const DAYS_SHORT: Record<Lang, string[]> = {
  sq: ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};
const MONTHS: Record<Lang, string[]> = {
  sq: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MONTHS_SHORT: Record<Lang, string[]> = {
  sq: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pad = (n: number) => String(n).padStart(2, "0");

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
});

/** Kosovo wall-clock parts of a moment. */
function localParts(d: string | number | Date) {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute };
}

function keyParts(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** Kosovo day key, ISO weekday and minutes since midnight for a moment. */
export function localNow(d: string | number | Date) {
  const p = localParts(d);
  const key = `${p.y}-${pad(p.m)}-${pad(p.d)}`;
  return { key, weekday: isoWeekday(key), minutes: p.h * 60 + p.min };
}

/** "08:00:00" or "08:00" to minutes since midnight. */
export function hhmmToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** "08:00:00" to "08:00". */
export const shortTime = (t: string) => t.slice(0, 5);

/** "2026-09-24" for the Kosovo calendar day of a moment. */
export function dayKey(d: string | number | Date) {
  const p = localParts(d);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

/** Adds whole days to a "YYYY-MM-DD" key. */
export function addDaysKey(key: string, n: number) {
  const { y, m, d } = keyParts(key);
  return new Date(Date.UTC(y, m - 1, d + n, 12)).toISOString().slice(0, 10);
}

/** Whole days from day key a to day key b. */
export function daysBetween(a: string, b: string) {
  const x = keyParts(a);
  const y = keyParts(b);
  return Math.round((Date.UTC(y.y, y.m - 1, y.d) - Date.UTC(x.y, x.m - 1, x.d)) / 86_400_000);
}

/** ISO weekday (1 = Monday) of a day key. */
export function isoWeekday(key: string) {
  const { y, m, d } = keyParts(key);
  const w = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return w === 0 ? 7 : w;
}

export function formatTime(iso: string, _lang?: Lang) {
  const p = localParts(iso);
  return `${pad(p.h)}:${pad(p.min)}`;
}

/** Weekday name from an ISO weekday number (1 = Monday). */
export function dayName(weekday: number, lang: Lang) {
  return cap(DAYS[lang][weekday - 1]);
}

export function weekdayName(key: string, lang: Lang) {
  return cap(DAYS[lang][isoWeekday(key) - 1]);
}

/** "Enj" / "Thu" for a day key. */
export function shortDayName(key: string, lang: Lang) {
  return DAYS_SHORT[lang][isoWeekday(key) - 1];
}

export function shortDate(key: string, lang: Lang) {
  const { m, d } = keyParts(key);
  return `${d} ${MONTHS_SHORT[lang][m - 1]}`;
}

/** "E premte, 25 shtator" / "Friday 25 September". */
export function longDate(iso: string, lang: Lang) {
  const key = dayKey(iso);
  const { m, d } = keyParts(key);
  const day = weekdayName(key, lang);
  return lang === "sq" ? `${day}, ${d} ${MONTHS[lang][m - 1]}` : `${day} ${d} ${MONTHS[lang][m - 1]}`;
}

/** "Sot" / "Nesër" / weekday name, relative to todayKey. */
export function relativeDay(key: string, todayKey: string, lang: Lang) {
  if (key === todayKey) return lang === "sq" ? "Sot" : "Today";
  if (key === addDaysKey(todayKey, 1)) return lang === "sq" ? "Nesër" : "Tomorrow";
  return weekdayName(key, lang);
}

/** "20 €" in Albanian, "€20" in English. */
export function formatPrice(eur: number, lang: Lang) {
  return lang === "sq" ? `${eur} €` : `€${eur}`;
}

/** Converts a Kosovo wall-clock time on a given day to a UTC ISO string. */
export function localToUtcIso(key: string, hhmm: string) {
  const { y, m, d } = keyParts(key);
  const [hh, mm] = hhmm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - tzOffsetMinutes(guess) * 60_000;
  const second = guess - tzOffsetMinutes(first) * 60_000;
  return new Date(second).toISOString();
}

function tzOffsetMinutes(utcMs: number) {
  const p = localParts(utcMs);
  return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - utcMs) / 60_000);
}
