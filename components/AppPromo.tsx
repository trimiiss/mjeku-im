"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { CheckIcon, MessageIcon, PhoneIcon } from "./Icons";
import { useSearch } from "./SearchContext";

function QrCode() {
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
    <div className="qr" role="img" aria-label={`QR code that opens ${site.fullName} on your phone`}>
      {svg ? <span dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="qr-placeholder" />}
    </div>
  );
}

export function AppPromo() {
  const { notify } = useSearch();
  const soon = () => notify(`The ${site.fullName} app is coming soon`, "Until then, you can book right here on the website.");

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
              <p className="phone-hello">Good morning, Arben</p>
              <div className="phone-next">
                <span className="phone-label">Next appointment</span>
                <b>Tomorrow, 09:40</b>
                <span>Dr. med. dent. Lukas Meier</span>
                <span className="phone-sub">Dentist · Zahnarztpraxis Rosengarten</span>
                <span className="phone-sms">
                  <MessageIcon width={14} height={14} />
                  SMS reminder scheduled
                </span>
              </div>
              <div className="phone-row">
                <span className="phone-dot">AK</span>
                <div>
                  <b>Dr. med. Arta Krasniqi</b>
                  <span>Check-up · 12 Oct, 14:30</span>
                </div>
              </div>
              <div className="phone-row">
                <span className="phone-dot">SR</span>
                <div>
                  <b>Sophie Rochat</b>
                  <span>Physiotherapy · 3 Nov, 09:45</span>
                </div>
              </div>
              <span className="phone-cta">Book an appointment</span>
            </div>
          </div>
        </div>

        <div className="stack">
          <p className="eyebrow">Mobile app</p>
          <h2 id="app-title" className="h2">
            Download the {site.fullName} app
          </h2>
          <p className="lede">
            Book a doctor, dentist or therapist near you in {site.country}, and keep all your medical appointments on
            your phone, wherever you are.
          </p>
          <ul className="checklist">
            <li>
              <span className="tick">
                <CheckIcon width={16} height={16} />
              </span>
              All upcoming and past appointments in one list
            </li>
            <li>
              <span className="tick">
                <CheckIcon width={16} height={16} />
              </span>
              Reminders by SMS and push notification
            </li>
            <li>
              <span className="tick">
                <CheckIcon width={16} height={16} />
              </span>
              Book for your children and family members
            </li>
          </ul>
          <div className="qr-row">
            <QrCode />
            <div className="store-btns">
              <p className="qr-note">
                <PhoneIcon width={16} height={16} />
                Scan to open on your phone
              </p>
              <button type="button" className="store-btn" onClick={soon}>
                <PhoneIcon width={22} height={22} />
                <span>
                  <small>Download on the</small>
                  <b>App Store</b>
                </span>
              </button>
              <button type="button" className="store-btn" onClick={soon}>
                <PhoneIcon width={22} height={22} />
                <span>
                  <small>Get it on</small>
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
