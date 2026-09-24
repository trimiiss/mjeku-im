// Brand settings. Change the name here and it updates across the whole site.
export const site = {
  name: "Mjeku",
  suffix: ".Im",
  get fullName() {
    return `${this.name}${this.suffix}`;
  },
  proLabel: "Pro",
  country: "Switzerland",
  tagline: "Your doctor, a few taps away.",
  description:
    "Find doctors, dentists and therapists in Switzerland, see their free slots in real time and book online in a minute.",
};
