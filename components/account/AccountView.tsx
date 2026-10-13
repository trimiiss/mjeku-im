"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { accountDicts, type AuthErrorKey } from "@/lib/accountText";
import { paths, profileHref } from "@/lib/routes";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import type { ListedPractice } from "@/lib/types";
import { useApp } from "../AppContext";
import { AlertIcon, CheckCircleIcon } from "../IconsExtra";
import { MyBookings } from "./MyBookings";
import { ProfileForm, type MyProfile } from "./ProfileForm";

type Phase = "loading" | "offline" | "signedOut" | "recovery" | "signedIn";

/** Supabase Auth errors as our messages. */
function authErrorKey(err: { code?: string; status?: number; message?: string }): AuthErrorKey {
  const code = err.code ?? "";
  if (code === "invalid_credentials") return "invalid_credentials";
  if (code === "email_not_confirmed") return "email_not_confirmed";
  if (code === "user_already_exists" || code === "email_exists") return "user_exists";
  if (code === "weak_password") return "weak_password";
  if (code === "email_address_invalid" || code === "validation_failed") return "invalid_email";
  if (code === "signup_disabled" || code === "email_provider_disabled") return "signups_off";
  if (code.startsWith("over_") || err.status === 429) return "rate_limit";
  if (code === "email_address_not_authorized" || /sending|smtp/i.test(err.message ?? "")) return "email_send";
  return "unknown";
}

function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  return (
    <p className={kind === "error" ? "form-error" : "form-ok"} role={kind === "error" ? "alert" : "status"}>
      {kind === "error" ? <AlertIcon width={18} height={18} /> : <CheckCircleIcon width={18} height={18} />}
      <span>{children}</span>
    </p>
  );
}

/** /llogaria: the login state decides what shows, and Supabase keeps the login in this browser. */
export function AccountView({ claim }: { claim: ListedPractice | null }) {
  const { lang } = useApp();
  const a = accountDicts[lang];
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) {
      setPhase("offline");
      return;
    }
    // Fires once straight away (INITIAL_SESSION), then on every log in, log out and password change.
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      setEmail(session?.user.email ?? "");
      setPhase((p) => {
        if (event === "PASSWORD_RECOVERY") return "recovery";
        if (!session) return "signedOut";
        return p === "recovery" && event !== "USER_UPDATED" ? "recovery" : "signedIn";
      });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="account">
      <div className="profile-top account-top">
        <div className="container">
          <p className="eyebrow">{a.eyebrow}</p>
          <h1 className="listing-title">{a.title}</h1>
          <p className="lede">{a.lede}</p>
        </div>
      </div>
      <div className="container account-body">
        {phase === "loading" && (
          <p className="muted" role="status">
            {a.loading}
          </p>
        )}
        {phase === "offline" && <Notice kind="error">{a.offline}</Notice>}
        {phase === "signedOut" && <AuthForm claim={claim} />}
        {phase === "recovery" && <NewPassword />}
        {phase === "signedIn" && <Dashboard email={email} claim={claim} />}
      </div>
    </div>
  );
}

function AuthForm({ claim }: { claim: ListedPractice | null }) {
  const { lang } = useApp();
  const a = accountDicts[lang];
  const [mode, setMode] = useState<"signUp" | "signIn" | "forgot">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licensed, setLicensed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchTo = (m: typeof mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb) return;
    setError(null);
    setInfo(null);
    if (mode === "signUp" && !licensed) {
      setError("must_confirm");
      return;
    }
    const address = email.trim();
    setPending(true);
    try {
      if (mode === "signUp") {
        // The confirmation link comes back here, keeping ?praktika=... for "this is my practice".
        const back = `${window.location.origin}${window.location.pathname}${window.location.search}`;
        const { data, error } = await sb.auth.signUp({ email: address, password, options: { emailRedirectTo: back } });
        if (error) setError(authErrorKey(error));
        // With email confirmation on, an address that's already registered comes back as a user without identities.
        else if (!data.session && data.user?.identities?.length === 0) setError("user_exists");
        else if (!data.session) setInfo(a.checkEmail(address));
      } else if (mode === "signIn") {
        const { error } = await sb.auth.signInWithPassword({ email: address, password });
        if (error) setError(authErrorKey(error));
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(address, { redirectTo: `${window.location.origin}${paths.account}` });
        if (error) setError(authErrorKey(error));
        else setInfo(a.resetSent(address));
      }
    } catch {
      setError("unknown");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-card account-auth">
      {mode === "forgot" ? (
        <h2>{a.forgotTitle}</h2>
      ) : (
        <div className="account-tabs" role="group" aria-label={a.title}>
          <button type="button" aria-pressed={mode === "signUp"} onClick={() => switchTo("signUp")}>
            {a.signUpTab}
          </button>
          <button type="button" aria-pressed={mode === "signIn"} onClick={() => switchTo("signIn")}>
            {a.signInTab}
          </button>
        </div>
      )}

      {claim && mode !== "forgot" && <p className="account-claim">{a.claimNote(claim.name)}</p>}
      {mode === "forgot" && <p className="muted">{a.forgotText}</p>}

      <form className="booking-form" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="acc-email">{a.email}</label>
          <input
            id="acc-email"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {mode !== "forgot" && (
          <div className="form-field">
            <label htmlFor="acc-password">{a.password}</label>
            <input
              id="acc-password"
              type="password"
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              required
              minLength={mode === "signUp" ? 8 : undefined}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={mode === "signUp" ? "acc-password-hint" : undefined}
            />
            {mode === "signUp" && <small id="acc-password-hint">{a.passwordHint}</small>}
          </div>
        )}
        {mode === "signUp" && (
          <label className="consent">
            <input type="checkbox" checked={licensed} onChange={(e) => setLicensed(e.target.checked)} />
            <span>{a.licensed}</span>
          </label>
        )}

        {error && <Notice kind="error">{a.authErrors[error]}</Notice>}
        {info && <Notice kind="ok">{info}</Notice>}

        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
          {pending ? a.working : mode === "signUp" ? a.signUp : mode === "signIn" ? a.signIn : a.sendReset}
        </button>
      </form>

      {mode === "signIn" && (
        <button type="button" className="link account-switch" onClick={() => switchTo("forgot")}>
          {a.forgot}
        </button>
      )}
      {mode === "forgot" && (
        <button type="button" className="link account-switch" onClick={() => switchTo("signIn")}>
          {a.backToSignIn}
        </button>
      )}
    </div>
  );
}

/** After opening the link in a password-reset email. */
function NewPassword() {
  const { lang } = useApp();
  const a = accountDicts[lang];
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb) return;
    setPending(true);
    setError(null);
    const { error } = await sb.auth.updateUser({ password });
    setPending(false);
    // On success the USER_UPDATED event switches the page to the dashboard.
    if (error) setError(authErrorKey(error));
  }

  return (
    <div className="account-card account-auth">
      <h2>{a.newPasswordTitle}</h2>
      <form className="booking-form" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="acc-new-password">{a.newPassword}</label>
          <input
            id="acc-new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small>{a.passwordHint}</small>
        </div>
        {error && <Notice kind="error">{a.authErrors[error]}</Notice>}
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
          {pending ? a.working : a.savePassword}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ email, claim }: { email: string; claim: ListedPractice | null }) {
  const { lang } = useApp();
  const a = accountDicts[lang];
  // undefined while loading, null before the first save.
  const [profile, setProfile] = useState<MyProfile | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    let alive = true;
    sb.rpc("my_profile").then(({ data, error }) => {
      if (!alive) return;
      if (error) setFailed(true);
      else setProfile((data as MyProfile | null) ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const p = profile?.practitioner;

  return (
    <div className="account-dash">
      <div className="account-bar">
        <span className="muted">{a.signedInAs(email)}</span>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => getBrowserSupabase()?.auth.signOut()}>
          {a.signOut}
        </button>
      </div>

      {failed && <Notice kind="error">{a.authErrors.unknown}</Notice>}
      {profile === undefined && !failed && (
        <p className="muted" role="status">
          {a.loading}
        </p>
      )}

      {profile !== undefined && (
        <>
          {p ? (
            <div className={`account-card account-status${p.active ? " is-live" : ""}`}>
              <div>
                <h2>{p.active ? a.statusLive : a.statusHidden}</h2>
                <p className="muted">{p.active ? a.statusLiveText : a.statusHiddenText}</p>
                <p className="small">{p.verified ? a.verified : a.unverified}</p>
              </div>
              {p.active && (
                <Link className="btn btn-outline btn-sm" href={profileHref(p.id)}>
                  {a.viewProfile}
                </Link>
              )}
            </div>
          ) : (
            <div className="account-card account-status">
              <div>
                <h2>{a.welcomeTitle}</h2>
                <p className="muted">{a.welcomeText}</p>
              </div>
            </div>
          )}
          <ProfileForm initial={profile} claim={profile ? null : claim} onSaved={setProfile} />
          <MyBookings hasProfile={Boolean(profile)} />
        </>
      )}
    </div>
  );
}
