"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Mode, Query } from "@/lib/search";
import { CloseIcon, InfoIcon } from "./Icons";

type Notice = { title: string; body?: string; id: number };

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  draft: { q: string; city: string };
  setDraft: (d: { q?: string; city?: string }) => void;
  applied: Query | null;
  runSearch: (q?: Partial<Query>, opts?: { scroll?: boolean }) => void;
  clearSearch: () => void;
  notify: (title: string, body?: string) => void;
  focusSearch: () => void;
  registerSearchInput: (el: HTMLInputElement | null) => void;
};

const SearchCtx = createContext<Ctx | null>(null);

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("in-person");
  const [draft, setDraftState] = useState({ q: "", city: "" });
  const [applied, setApplied] = useState<Query | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setDraft = useCallback((d: { q?: string; city?: string }) => {
    setDraftState((prev) => ({ ...prev, ...d }));
  }, []);

  const runSearch = useCallback(
    (q?: Partial<Query>, opts?: { scroll?: boolean }) => {
      const next: Query = {
        q: q?.q ?? draft.q,
        city: q?.city ?? draft.city,
        mode: q?.mode ?? mode,
      };
      if (q?.mode) setMode(q.mode);
      setDraftState({ q: next.q, city: next.city });
      setApplied(next);
      if (opts?.scroll !== false) requestAnimationFrame(() => scrollToId("available"));
    },
    [draft, mode],
  );

  const clearSearch = useCallback(() => {
    setApplied(null);
    setDraftState({ q: "", city: "" });
  }, []);

  const notify = useCallback((title: string, body?: string) => {
    setNotice({ title, body, id: Date.now() });
  }, []);

  const focusSearch = useCallback(() => {
    scrollToId("top");
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
  }, []);

  const registerSearchInput = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 6500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const value = useMemo(
    () => ({
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
    }),
    [mode, draft, setDraft, applied, runSearch, clearSearch, notify, focusSearch, registerSearchInput],
  );

  return (
    <SearchCtx.Provider value={value}>
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
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        )}
      </div>
    </SearchCtx.Provider>
  );
}

export const PREVIEW_NOTE = "This is a preview. Online booking isn't live yet, so no appointment was made.";
