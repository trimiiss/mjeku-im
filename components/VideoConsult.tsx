"use client";

import Link from "next/link";
import { paths } from "@/lib/routes";
import { useApp } from "./AppContext";
import { ArrowRightIcon, MicIcon, PhoneOffIcon, VideoIcon } from "./Icons";

export function VideoConsult() {
  const { t } = useApp();
  const v = t.video;

  return (
    <section className="section" id="video" aria-labelledby="video-title">
      <div className="container split split--media-first">
        <div className="call" aria-hidden="true">
          <div className="call-tag">
            <span className="rec" />
            <span className="call-time">07:42</span>
            <span className="call-who">{v.callWith}</span>
          </div>
          <div className="call-self">{v.you}</div>
          <div className="call-avatar">GZ</div>
          <div className="call-controls">
            <span>
              <MicIcon width={18} height={18} />
            </span>
            <span>
              <VideoIcon width={18} height={18} />
            </span>
            <span className="end">
              <PhoneOffIcon width={18} height={18} />
            </span>
          </div>
        </div>

        <div className="stack">
          <p className="eyebrow">{v.eyebrow}</p>
          <h2 id="video-title" className="h2">
            {v.title}
          </h2>
          <ol className="steps">
            {v.steps.map((s, i) => (
              <li className="step" key={s.title}>
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="actions">
            <Link className="btn btn-primary" href={paths.video}>
              <VideoIcon />
              {v.cta}
            </Link>
            <Link className="link" href={paths.help}>
              {v.link}
              <ArrowRightIcon width={18} height={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
