"use client";

import { useApp } from "./AppContext";
import { CalendarCheckIcon, ClockCheckIcon, MessageIcon, SwitchIcon } from "./Icons";

const icons = [CalendarCheckIcon, ClockCheckIcon, MessageIcon, SwitchIcon];

export function Features() {
  const { t } = useApp();
  return (
    <section className="section section--tight" aria-labelledby="features-title">
      <div className="container">
        <h2 id="features-title" className="sr-only">
          {t.features.title}
        </h2>
        <ul className="features">
          {t.features.items.map(({ title, text }, i) => {
            const Icon = icons[i];
            return (
              <li className="feature" key={title}>
                <span className="feature-ico">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
