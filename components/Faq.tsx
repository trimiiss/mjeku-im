import { site } from "@/lib/site";
import { PlusIcon } from "./Icons";

const faqs = [
  {
    q: `Is ${site.fullName} free for patients?`,
    a: "Yes. Searching and booking are free. You only pay for the consultation itself, billed by your practitioner as usual.",
  },
  {
    q: "How do I move or cancel an appointment?",
    a: "Open the appointment from your confirmation email or in the app, then pick a new time or cancel. It's free up to the deadline your practitioner sets, often 24 hours before.",
  },
  {
    q: "Are video consultations covered by my health insurance?",
    a: "In most cases, yes. A video consultation is billed like a visit to the practice, and your usual deductible and co-payment apply.",
  },
  {
    q: "What do I need for a video consultation?",
    a: "A phone, tablet or computer with a camera and a stable internet connection. You'll get a secure link by SMS and email before the appointment. No extra app is needed.",
  },
  {
    q: "Can I book for my child or a family member?",
    a: "Yes. Add family members to your account and choose who the appointment is for when you book.",
  },
  {
    q: "How is my data protected?",
    a: `Your data is encrypted and stored on servers in ${site.country}, following the Swiss Federal Act on Data Protection (nFADP). Your practitioner only sees what's needed for your appointment.`,
  },
  {
    q: "Which languages do practitioners speak?",
    a: "Every profile lists the languages spoken, such as Albanian, German, French, Italian and English, so you can book someone you understand easily.",
  },
];

export function Faq() {
  return (
    <section className="section section--mist" id="faq" aria-labelledby="faq-title">
      <div className="container faq-wrap">
        <div className="stack">
          <p className="eyebrow">Help centre</p>
          <h2 id="faq-title" className="h2">
            Questions patients ask
          </h2>
          <p className="muted">
            Quick answers about booking, video consultations and your privacy.
          </p>
        </div>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <PlusIcon width={20} height={20} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
