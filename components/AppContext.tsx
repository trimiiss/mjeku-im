"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Dict } from "@/lib/i18n";
import { searchHref } from "@/lib/routes";
import { buildIndex, type Index } from "@/lib/search";
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
  /** Opens the results for the search bar's query (a specialty page or the search page). */
  runSearch: (q?: Partial<Query>) => void;
  notify: (title: string, body?: string) => void;
  bookingSlot: Slot | null;
  bookingReason: string | null;
  openBooking: (slot: Slot, opts?: { reason?: string }) => void;
  closeBooking: () => void;
  manageOpen: boolean;
  setManageOpen: (open: boolean) => void;
  refresh: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
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
  const [notice, setNotice] = useState<Notice | null>(null);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [bookingReason, setBookingReason] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

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
      router.push(searchHref(next, directory));
    },
    [draft, mode, router, directory],
  );

  const notify = useCallback((title: string, body?: string) => setNotice({ title, body, id: Date.now() }), []);

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
      runSearch,
      notify,
      bookingSlot,
      bookingReason,
      openBooking,
      closeBooking,
      manageOpen,
      setManageOpen,
      refresh,
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
      runSearch,
      notify,
      bookingSlot,
      bookingReason,
      openBooking,
      closeBooking,
      manageOpen,
      refresh,
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
