import { CalendarCheckIcon, ClockCheckIcon, MessageIcon, SwitchIcon } from "./Icons";

const features = [
  {
    icon: CalendarCheckIcon,
    title: "Every free slot in one place",
    text: "See the open appointments of your doctors, dentists and therapists, updated in real time.",
  },
  {
    icon: ClockCheckIcon,
    title: "Book 24/7",
    text: "Book from anywhere, day or night, without waiting on hold for the practice to pick up.",
  },
  {
    icon: MessageIcon,
    title: "SMS reminders",
    text: "Get a text before each appointment so nothing slips your mind.",
  },
  {
    icon: SwitchIcon,
    title: "Change plans for free",
    text: "Move or cancel your appointment online in a few taps, at no cost.",
  },
];

export function Features() {
  return (
    <section className="section section--tight" aria-labelledby="features-title">
      <div className="container">
        <h2 id="features-title" className="sr-only">
          Why book online
        </h2>
        <ul className="features">
          {features.map(({ icon: Icon, title, text }) => (
            <li className="feature" key={title}>
              <span className="feature-ico">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
