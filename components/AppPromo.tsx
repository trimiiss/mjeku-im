"use client";

import { useEffect, useState } from "react";
import { useApp } from "./AppContext";
import { CheckIcon, MessageIcon, PhoneIcon } from "./Icons";

function QrCode({ label }: { label: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    import("qrcode").then(({ default: QR }) =>
      QR.toString(window.location.origin, {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#0d2a3a", light: "#ffffff" },
      })
        .then((s) => alive && setSvg(s))
        .catch(() => {}),
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="qr" role="img" aria-label={label}>
      {svg ? <span dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="qr-placeholder" />}
    </div>
  );
}

export function AppPromo() {
  const { t, notify } = useApp();
  const a = t.app;
  const soon = () => notify(a.soonTitle, a.soonBody);

  return (
    <section className="section" id="app" aria-labelledby="app-title">
      <div className="container app-wrap">
        <div className="phone-stage" aria-hidden="true">
          <div className="phone">
            <div className="phone-screen">
              <div className="phone-status">
                <span>9:41</span>
                <span className="phone-notch" />
                <span>5G</span>
              </div>
              <p className="phone-hello">{a.phone.hello}</p>
              <div className="phone-next">
                <span className="phone-label">{a.phone.next}</span>
                <b>{a.phone.when}</b>
                <span>{a.phone.who}</span>
                <span className="phone-sub">{a.phone.where}</span>
                <span className="phone-sms">
                  <MessageIcon width={14} height={14} />
                  {a.phone.sms}
                </span>
              </div>
              {a.phone.rows.map((r) => (
                <div className="phone-row" key={r.name}>
                  <span className="phone-dot">{r.initials}</span>
                  <div>
                    <b>{r.name}</b>
                    <span>{r.info}</span>
                  </div>
                </div>
              ))}
              <span className="phone-cta">{a.phone.cta}</span>
            </div>
          </div>
        </div>

        <div className="stack">
          <p className="eyebrow">{a.eyebrow}</p>
          <h2 id="app-title" className="h2">
            {a.title}
          </h2>
          <p className="lede">{a.lede}</p>
          <ul className="checklist">
            {a.points.map((p) => (
              <li key={p}>
                <span className="tick">
                  <CheckIcon width={16} height={16} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="qr-row">
            <QrCode label={a.qrLabel} />
            <div className="store-btns">
              <p className="qr-note">
                <PhoneIcon width={16} height={16} />
                {a.scan}
              </p>
              <button type="button" className="store-btn" onClick={soon}>
                <PhoneIcon width={22} height={22} />
                <span>
                  <small>{a.appStoreSmall}</small>
                  <b>App Store</b>
                </span>
              </button>
              <button type="button" className="store-btn" onClick={soon}>
                <PhoneIcon width={22} height={22} />
                <span>
                  <small>{a.playSmall}</small>
                  <b>Google Play</b>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
