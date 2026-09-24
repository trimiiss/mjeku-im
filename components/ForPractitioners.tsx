"use client";

import { useApp } from "./AppContext";
import { ArrowRightIcon, ChartDownIcon, ClockPlusIcon, HeartChatIcon, RocketIcon } from "./Icons";

const icons = [ChartDownIcon, ClockPlusIcon, RocketIcon, HeartChatIcon];

export function ForPractitioners() {
  const { t, notify } = useApp();
  const p = t.pro;

  return (
    <section className="pro" id="pro" aria-labelledby="pro-title">
      <div className="container pro-grid section">
        <div>
          <p className="eyebrow">{p.eyebrow}</p>
          <h2 id="pro-title" className="h2">
            {p.title}
          </h2>
          <p className="pro-lede">{p.lede}</p>

          <ul className="benefits">
            {p.benefits.map(({ title, text }, i) => {
              const Icon = icons[i];
              return (
                <li className="benefit" key={title}>
                  <span className="benefit-ico">
                    <Icon width={22} height={22} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="actions">
            <button type="button" className="btn btn-ink" onClick={() => notify(p.discoverSoon, p.discoverBody)}>
              {p.discover}
              <ArrowRightIcon />
            </button>
            <button type="button" className="btn btn-white" onClick={() => notify(p.demoSoon, p.demoBody)}>
              {p.demo}
            </button>
          </div>
        </div>

        <div className="agenda" aria-hidden="true">
          <div className="agenda-head">
            <div>
              <span className="agenda-kicker">{p.calendar}</span>
              <b>{p.day}</b>
            </div>
            <span className="agenda-count">{p.booked}</span>
          </div>
          <ul>
            {p.agenda.map((a) => (
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
