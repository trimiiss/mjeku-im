"use client";

import { site } from "@/lib/site";
import { ArrowRightIcon, MicIcon, PhoneOffIcon, VideoIcon } from "./Icons";
import { useSearch } from "./SearchContext";

const steps = [
  {
    title: "Book in a few clicks",
    text: `Choose a video slot on ${site.fullName} or in the app, just like an in-person visit.`,
  },
  {
    title: "Consult from home",
    text: "Join from your phone or computer with a secure link. No travel and no waiting room.",
  },
  {
    title: "Get reimbursed",
    text: "Video consultations are covered by basic health insurance, the same way as a visit to the practice.",
  },
];

export function VideoConsult() {
  const { runSearch } = useSearch();

  return (
    <section className="section" id="video" aria-labelledby="video-title">
      <div className="container split split--media-first">
        <div className="call" aria-hidden="true">
          <div className="call-tag">
            <span className="rec" />
            <span className="call-time">07:42</span>
            <span className="call-who">Dr. med. Elira Gashi</span>
          </div>
          <div className="call-self">You</div>
          <div className="call-avatar">EG</div>
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
          <p className="eyebrow">Video consultations</p>
          <h2 id="video-title" className="h2">
            Have you thought about a video consultation?
          </h2>
          <ol className="steps">
            {steps.map((s, i) => (
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => runSearch({ q: "", city: "", mode: "video" })}
            >
              <VideoIcon />
              Book a video consultation
            </button>
            <a className="link" href="#faq">
              How video consultations work
              <ArrowRightIcon width={18} height={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
