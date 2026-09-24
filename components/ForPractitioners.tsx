"use client";

import { site } from "@/lib/site";
import { ArrowRightIcon, ChartDownIcon, ClockPlusIcon, HeartChatIcon, RocketIcon } from "./Icons";
import { useSearch } from "./SearchContext";

const benefits = [
  {
    icon: ChartDownIcon,
    title: "Fewer no-shows",
    text: "Patients get an SMS reminder before every appointment, so fewer slots go empty.",
  },
  {
    icon: ClockPlusIcon,
    title: "More time, less admin",
    text: "Patients book, move and cancel online, so your team spends less time on the phone.",
  },
  {
    icon: RocketIcon,
    title: "Be found online",
    text: `Show up when patients across ${site.country} search for your specialty and city.`,
  },
  {
    icon: HeartChatIcon,
    title: "A service patients value",
    text: "Online booking around the clock is now something patients expect from their practice.",
  },
];

const agenda = [
  { time: "08:00", who: "New patient", tag: "Online", kind: "online" },
  { time: "08:30", who: "Follow-up visit", tag: "Online", kind: "online" },
  { time: "09:00", who: "Free slot", tag: "Open", kind: "free" },
  { time: "09:30", who: "Moved by patient", tag: "SMS sent", kind: "sms" },
  { time: "10:00", who: "Skin check", tag: "Video", kind: "video" },
];

export function ForPractitioners() {
  const { notify } = useSearch();
  const pro = `${site.fullName} ${site.proLabel}`;

  return (
    <section className="pro" id="pro" aria-labelledby="pro-title">
      <div className="container pro-grid section">
        <div>
          <p className="eyebrow">{pro}</p>
          <h2 id="pro-title" className="h2">
            Are you a doctor, dentist or therapist in {site.country}?
          </h2>
          <p className="pro-lede">
            Make everyday work easier for you and your staff with {pro}. Online booking syncs with your practice
            software, so you can focus on what matters most: your patients.
          </p>

          <ul className="benefits">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li className="benefit" key={title}>
                <span className="benefit-ico">
                  <Icon width={22} height={22} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="actions">
            <button
              type="button"
              className="btn btn-ink"
              onClick={() => notify(`${pro} launches soon`, "Leave your details when we open sign-ups for practices.")}
            >
              Discover {pro}
              <ArrowRightIcon />
            </button>
            <button
              type="button"
              className="btn btn-white"
              onClick={() => notify("Demo requests open soon", "We'll show you the practice calendar and booking settings.")}
            >
              Request a free demo
            </button>
          </div>
        </div>

        <div className="agenda" aria-hidden="true">
          <div className="agenda-head">
            <div>
              <span className="agenda-kicker">Practice calendar</span>
              <b>Wednesday</b>
            </div>
            <span className="agenda-count">4 of 5 booked</span>
          </div>
          <ul>
            {agenda.map((a) => (
              <li key={a.time} className={`agenda-row${a.kind === "free" ? " is-free" : ""}`}>
                <time>{a.time}</time>
                <span>{a.who}</span>
                <span className={`pill pill--${a.kind}`}>{a.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
