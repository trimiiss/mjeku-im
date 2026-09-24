"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { dictionaries, type Dict } from "@/lib/i18n";
import { buildIndex, queryHref, type Index } from "@/lib/search";
import type { Directory, Lang, Mode, Query, Slot } from "@/lib/types";
import { CloseIcon, InfoIcon } from "./Icons";

type Draft = { q: string; city: string; specialtyId?: string; cityId?: string; clinicType?: string; label?: string };
type Notice = { title: string; body?: string; id: number };

type Ctx = {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
  dir: Directory;
  idx: Index;
  todayKey: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  draft: Draft;
  setDraft: (d: Partial<Draft>) => void;
  applied: Query | null;
  runSearch: (q?: Partial<Query>) => void;
  clearSearch: () => void;
  notify: (title: string, body?: string) => void;
  focusSearch: () => void;
  registerSearchInput: (el: HTMLInputElement | null) => void;
  bookingSlot: Slot | null;
  bookingReason: string | null;
  openBooking: (slot: Slot, opts?: { reason?: string }) => void;
  closeBooking: () => void;
  manageOpen: boolean;
  setManageOpen: (open: boolean) => void;
  refresh: () => void;
  /** True on the home page, where the in-page anchors (#faq, #pro, ...) live. */
  onHome: boolean;
  /** "#faq" on the home page, "/#faq" everywhere else. */
  homeHref: (hash: string) => string;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function AppProvider({
  children,
  initialLang,
  directory,
  todayKey,
  initialQuery = null,
}: {
  children: ReactNode;
  initialLang: Lang;
  directory: Directory;
  todayKey: string;
  initialQuery?: Query | null;
}) {
  const router = useRouter();
  const onHome = usePathname() === "/";
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [mode, setMode] = useState<Mode>(initialQuery?.mode ?? "in_person");
  const [draft, setDraftState] = useState<Draft>(() =>
    initialQuery
      ? {
          q: initialQuery.q,
          city: initialQuery.city,
          specialtyId: initialQuery.specialtyId,
          cityId: initialQuery.cityId,
          clinicType: initialQuery.clinicType,
          label: initialQuery.label,
        }
      : { q: "", city: "" },
  );
  const [applied, setApplied] = useState<Query | null>(initialQuery);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [bookingReason, setBookingReason] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const t = dictionaries[lang];
  const idx = useMemo(() => buildIndex(directory), [directory]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const setDraft = useCallback((d: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...d })), []);

  const runSearch = useCallback(
    (q?: Partial<Query>) => {
      const next: Query = {
        q: q?.q ?? draft.q,
        city: q?.city ?? draft.city,
        mode: q?.mode ?? mode,
        specialtyId: q && "specialtyId" in q ? q.specialtyId : draft.specialtyId,
        cityId: q && "cityId" in q ? q.cityId : draft.cityId,
        clinicType: q && "clinicType" in q ? q.clinicType : draft.clinicType,
        label: q && "label" in q ? q.label : draft.label,
      };
      if (!onHome) {
        // The results list lives on the home page.
        router.push(queryHref(next));
        return;
      }
      if (q?.mode) setMode(q.mode);
      setDraftState({
        q: next.q,
        city: next.city,
        specialtyId: next.specialtyId,
        cityId: next.cityId,
        clinicType: next.clinicType,
        label: next.label,
      });
      setApplied(next);
      // Keep the address shareable: /?s=dentist&c=prishtine#available
      window.history.replaceState(null, "", queryHref(next));
      requestAnimationFrame(() => scrollToId("available"));
    },
    [draft, mode, onHome, router],
  );

  const clearSearch = useCallback(() => {
    setApplied(null);
    setDraftState({ q: "", city: "" });
    if (window.location.search) window.history.replaceState(null, "", "/");
  }, []);

  const notify = useCallback((title: string, body?: string) => setNotice({ title, body, id: Date.now() }), []);

  const focusSearch = useCallback(() => {
    if (!onHome) {
      router.push("/#top");
      return;
    }
    scrollToId("top");
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
  }, [onHome, router]);

  const homeHref = useCallback((hash: string) => (onHome ? hash : `/${hash}`), [onHome]);

  const registerSearchInput = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

  const openBooking = useCallback((slot: Slot, opts?: { reason?: string }) => {
    setBookingReason(opts?.reason ?? null);
    setBookingSlot(slot);
  }, []);
  const closeBooking = useCallback(() => setBookingSlot(null), []);
  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      t,
      setLang,
      dir: directory,
      idx,
      todayKey,
      mode,
      setMode,
      draft,
      setDraft,
      applied,
      runSearch,
      clearSearch,
      notify,
      focusSearch,
      registerSearchInput,
      bookingSlot,
      bookingReason,
      openBooking,
      closeBooking,
      manageOpen,
      setManageOpen,
      refresh,
      onHome,
      homeHref,
    }),
    [
      lang,
      t,
      setLang,
      directory,
      idx,
      todayKey,
      mode,
      draft,
      setDraft,
      applied,
      runSearch,
      clearSearch,
      notify,
      focusSearch,
      registerSearchInput,
      bookingSlot,
      bookingReason,
      openBooking,
      closeBooking,
      manageOpen,
      refresh,
      onHome,
      homeHref,
    ],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="toast-region">
        {notice && (
          <div className="toast" key={notice.id} role="status">
            <span className="toast-ico">
              <InfoIcon width={18} height={18} />
            </span>
            <div>
              <b>{notice.title}</b>
              {notice.body && <p>{notice.body}</p>}
            </div>
            <button type="button" onClick={() => setNotice(null)} aria-label={t.common.close}>
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        )}
      </div>
    </AppCtx.Provider>
  );
}
