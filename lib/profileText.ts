// Text and helpers for the doctor profile page (/mjeku/[id]).
import { dayName, hhmmToMinutes, shortTime } from "./format";
import { expertise } from "./taxonomy";
import type { Lang, Practitioner, Schedule } from "./types";

/** How many days of free slots the profile page shows (4 pages of 4 days). */
export const PROFILE_DAYS = 16;

const sq = {
  breadcrumb: "Vendndodhja në faqe",
  sectionsLabel: "Seksionet e profilit",
  acceptsNewShort: "Pranon pacientë të rinj",
  home: "Mjeku.Im",
  tabs: { summary: "Përmbledhje", map: "Harta", presentation: "Prezantimi", faq: "Pyetje" },
  accepted: "Pacientët e pranuar",
  acceptsNew: (name: string) => `${name} pranon pacientë të rinj`,
  notAcceptingNew: (name: string) => `${name} pranon vetëm pacientët ekzistues`,
  specialties: "Specialitetet",
  expertises: "Ekspertizat",
  consultTypes: "Llojet e konsultimit",
  atClinic: "Në klinikë",
  byVideo: "Me video",
  price: "Çmimi i vizitës",
  mapTitle: "Harta dhe informacioni i qasjes",
  openInMaps: "Hap në hartë",
  mapLabel: (clinic: string) => `Harta: ${clinic}`,
  address: "Adresa",
  websiteLabel: "Faqja e internetit",
  unverified: "Ky profil është krijuar nga vetë mjeku dhe ende nuk është verifikuar nga Mjeku.Im.",
  country: "Kosovë",
  todayTag: "sot",
  viewProfile: "Shiko profilin",
  languagesPlace: "Gjuhët e shërbimit",
  hours: "Orari",
  closed: "Mbyllur",
  openNow: (until: string) => `Hapur tani · mbyllet në ${until}`,
  closedNow: (when: string, at: string) => `Mbyllur tani · hapet ${when} në ${at}`,
  today: "sot",
  tomorrow: "nesër",
  onDay: (weekday: number) => ["të hënën", "të martën", "të mërkurën", "të enjten", "të premten", "të shtunën", "të dielën"][weekday - 1],
  presentationTitle: "Prezantimi i profesionistit",
  presentationTitlePlace: "Prezantimi",
  experience: (n: number) => `${n} vjet përvojë`,
  focusTitle: "Fushat e specializimit",
  viewMore: "Shiko më shumë",
  viewLess: "Shiko më pak",
  languages: "Gjuhët që flet",
  payment: "Pagesa",
  paymentText: "Me para në dorë ose me kartelë bankare, te klinika.",
  faqTitle: "Pyetje të shpeshta",
  bookCta: "Rezervo termin",
  widget: {
    title: (name: string) => `Rezervo terminin te ${name}`,
    sub: "Plotëso informacionin më poshtë",
    specialty: "Specialiteti",
    reason: "Arsyeja e vizitës",
    slot: "Zgjidh orën",
    prev: "Ditët e mëparshme",
    next: "Ditët në vijim",
    more: "Shiko më shumë termine",
    less: "Shfaq më pak termine",
    none: "Nuk ka termine të lira në këto ditë.",
    noneDay: "Pa termine",
    nextFree: (when: string) => `Termini i parë i lirë: ${when}`,
  },
  reasons: { first: "Vizitë e parë", followup: "Kontroll pasues" },
  reasonLabel: "Arsyeja",
  faq: {
    address: (n: string) => `Ku i pret pacientët ${n}?`,
    languages: (n: string, person: boolean) => (person ? `Cilat gjuhë flet ${n}?` : `Në cilat gjuhë shërben ${n}?`),
    hours: (n: string) => `Në cilat orë pranon pacientë ${n}?`,
    phone: (_n: string): string => "Cili është numri i telefonit?",
    phoneAnswer: "Ky profil nuk ka ende numër telefoni. Mund të rezervosh online në çdo kohë, direkt në këtë faqe.",
    phoneIs: (phone: string) => `${phone}. Mund të rezervosh edhe online, direkt në këtë faqe.`,
    newPatients: (n: string) => `A pranon ${n} pacientë të rinj?`,
    newPatientsYes: (n: string) => `Po, ${n} pranon pacientë të rinj.`,
    newPatientsNo: (n: string) => `Jo, ${n} pranon vetëm pacientët ekzistues.`,
    specialties: (n: string) => `Cilat specialitete i mbulon ${n}?`,
    expertises: (n: string) => `Në cilat fusha ka ekspertizë ${n}?`,
    consults: (n: string) => `Çfarë llojesh konsultimi ofron ${n}?`,
    consultsAnswer: (video: boolean): string =>
      video ? "Konsultime në klinikë dhe konsultime me video." : "Konsultime në klinikë.",
  },
};

export type ProfileDict = typeof sq;

const en: ProfileDict = {
  breadcrumb: "Breadcrumb",
  sectionsLabel: "Profile sections",
  acceptsNewShort: "Accepts new patients",
  home: "Mjeku.Im",
  tabs: { summary: "Summary", map: "Map", presentation: "Presentation", faq: "FAQ" },
  accepted: "Accepted patients",
  acceptsNew: (name: string) => `${name} accepts new patients`,
  notAcceptingNew: (name: string) => `${name} only sees existing patients`,
  specialties: "Specialties",
  expertises: "Expertises",
  consultTypes: "Types of consultation",
  atClinic: "At the clinic",
  byVideo: "Video",
  price: "Visit price",
  mapTitle: "Map and access information",
  openInMaps: "Open in maps",
  mapLabel: (clinic: string) => `Map showing ${clinic}`,
  address: "Address",
  websiteLabel: "Website",
  unverified: "This profile was created by the practitioner and hasn't been verified by Mjeku.Im yet.",
  country: "Kosovo",
  todayTag: "today",
  viewProfile: "View profile",
  languagesPlace: "Languages",
  hours: "Opening hours",
  closed: "Closed",
  openNow: (until: string) => `Open now · closes at ${until}`,
  closedNow: (when: string, at: string) => `Closed now · opens ${when} at ${at}`,
  today: "today",
  tomorrow: "tomorrow",
  onDay: (weekday: number) => `on ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][weekday - 1]}`,
  presentationTitle: "Presentation of the healthcare professional",
  presentationTitlePlace: "About",
  experience: (n: number) => `${n} years of experience`,
  focusTitle: "Areas of specialisation",
  viewMore: "View more",
  viewLess: "View less",
  languages: "Spoken languages",
  payment: "Payment",
  paymentText: "Cash or bank card, at the clinic.",
  faqTitle: "FAQ",
  bookCta: "Book an appointment",
  widget: {
    title: (name: string) => `Book your appointment with ${name}`,
    sub: "Fill in the information below",
    specialty: "Specialty",
    reason: "Visit reason",
    slot: "Pick a time slot",
    prev: "Previous days",
    next: "Next days",
    more: "View more appointments",
    less: "Show fewer appointments",
    none: "No free slots on these days.",
    noneDay: "No slots",
    nextFree: (when: string) => `First free slot: ${when}`,
  },
  reasons: { first: "First visit", followup: "Follow-up visit" },
  reasonLabel: "Reason",
  faq: {
    address: (n: string) => `What is the address of ${n}?`,
    languages: (n: string, person: boolean) => (person ? `What languages does ${n} speak?` : `What languages are spoken at ${n}?`),
    hours: (n: string) => `What are the consulting hours of ${n}?`,
    phone: (n: string) => `What is the phone number of ${n}?`,
    phoneAnswer: "This profile doesn't list a phone number yet. You can book online at any time, right on this page.",
    phoneIs: (phone: string) => `${phone}. You can also book online, right on this page.`,
    newPatients: (n: string) => `Does ${n} accept new patients?`,
    newPatientsYes: (n: string) => `Yes, ${n} accepts new patients.`,
    newPatientsNo: (n: string) => `No, ${n} only sees existing patients.`,
    specialties: (n: string) => `What are the specialties of ${n}?`,
    expertises: (n: string) => `What are the areas of expertise of ${n}?`,
    consults: (n: string) => `What types of consultation does ${n} offer?`,
    consultsAnswer: (video: boolean) => (video ? "Consultations at the clinic and by video." : "Consultations at the clinic."),
  },
};

export const profileDicts: Record<Lang, ProfileDict> = { sq, en };

type Bilingual = { sq: string; en: string };
type SpecialtyInfo = { about: Bilingual; focus: { sq: string[]; en: string[] } };

export const specialtyInfo: Record<string, SpecialtyInfo> = {
  gp: {
    about: {
      sq: "Mjeku i familjes është pika e parë e kontaktit për shqetësimet shëndetësore të përditshme: kontrolle të rregullta, vaksina, sëmundje akute dhe ndjekje e sëmundjeve kronike si tensioni i lartë dhe diabeti.",
      en: "A family doctor is your first point of contact for everyday health concerns: regular check-ups, vaccines, acute illness and follow-up of long-term conditions such as high blood pressure and diabetes.",
    },
    focus: {
      sq: ["Kontrolle të rregullta dhe vërtetime mjekësore", "Vaksinim", "Tensioni i lartë dhe diabeti", "Infeksionet e rrugëve të frymëmarrjes", "Referim te specialistët"],
      en: ["Routine check-ups and medical certificates", "Vaccination", "High blood pressure and diabetes", "Respiratory infections", "Referrals to specialists"],
    },
  },
  dentist: {
    about: {
      sq: "Kujdes i plotë për dhëmbët dhe mishrat: kontrolle, pastrime, mbushje, trajtim i kanalit dhe këshilla për higjienën orale, për të rritur dhe fëmijë.",
      en: "Complete care for teeth and gums: check-ups, cleaning, fillings, root canal treatment and oral hygiene advice, for adults and children.",
    },
    focus: {
      sq: ["Kontroll dhe pastrim i dhëmbëve", "Mbushje estetike", "Trajtim i kanalit", "Stomatologji për fëmijë", "Zbardhim i dhëmbëve"],
      en: ["Check-ups and cleaning", "Tooth-coloured fillings", "Root canal treatment", "Children's dentistry", "Teeth whitening"],
    },
  },
  pediatrician: {
    about: {
      sq: "Kujdes për foshnjat, fëmijët dhe adoleshentët: kontrolle të rritjes, vaksinim sipas kalendarit, sëmundje të zakonshme të fëmijërisë dhe këshilla për prindërit.",
      en: "Care for babies, children and teenagers: growth check-ups, vaccinations on schedule, common childhood illnesses and advice for parents.",
    },
    focus: {
      sq: ["Kontrolle të rritjes dhe zhvillimit", "Vaksinim sipas kalendarit", "Temperatura dhe infeksionet", "Alergjitë te fëmijët", "Këshilla për ushqyerjen e foshnjës"],
      en: ["Growth and development check-ups", "Scheduled vaccinations", "Fever and infections", "Allergies in children", "Baby feeding advice"],
    },
  },
  gynecologist: {
    about: {
      sq: "Kujdes për shëndetin e gruas: kontrolle gjinekologjike, ndjekje e shtatzënisë me ekografi, kontracepsion dhe depistim i kancerit të qafës së mitrës.",
      en: "Care for women's health: gynaecological check-ups, pregnancy follow-up with ultrasound, contraception and cervical cancer screening.",
    },
    focus: {
      sq: ["Kontroll gjinekologjik", "Ndjekje e shtatzënisë", "Ekografi", "Kontracepsion", "Testi Papanikolau"],
      en: ["Gynaecological check-up", "Pregnancy follow-up", "Ultrasound", "Contraception", "Pap smear"],
    },
  },
  dermatologist: {
    about: {
      sq: "Diagnostikim dhe trajtim i sëmundjeve të lëkurës, flokëve dhe thonjve, si akneja, ekzema dhe alergjitë, si dhe kontroll i nishaneve.",
      en: "Diagnosis and treatment of skin, hair and nail conditions such as acne, eczema and allergies, plus mole checks.",
    },
    focus: {
      sq: ["Kontroll i nishaneve", "Akne", "Ekzema dhe psoriaza", "Alergji të lëkurës", "Rënia e flokëve"],
      en: ["Mole checks", "Acne", "Eczema and psoriasis", "Skin allergies", "Hair loss"],
    },
  },
  cardiologist: {
    about: {
      sq: "Parandalim, diagnostikim dhe trajtim i sëmundjeve të zemrës dhe enëve të gjakut, me EKG dhe ndjekje të tensionit të lartë.",
      en: "Prevention, diagnosis and treatment of heart and blood vessel conditions, with ECG and follow-up of high blood pressure.",
    },
    focus: {
      sq: ["EKG", "Ekokardiografi", "Tensioni i lartë", "Çrregullime të ritmit të zemrës", "Kontroll para aktivitetit sportiv"],
      en: ["ECG", "Echocardiography", "High blood pressure", "Heart rhythm disorders", "Heart check before sport"],
    },
  },
  internist: {
    about: {
      sq: "Diagnostikim dhe ndjekje e sëmundjeve të organeve të brendshme te të rriturit, si diabeti, tensioni i lartë dhe problemet e tretjes.",
      en: "Diagnosis and follow-up of internal conditions in adults, such as diabetes, high blood pressure and digestive problems.",
    },
    focus: {
      sq: ["Diabeti", "Tensioni i lartë", "Problemet e tretjes", "Sëmundjet e tiroides", "Kontrolle të përgjithshme për të rritur"],
      en: ["Diabetes", "High blood pressure", "Digestive problems", "Thyroid conditions", "General adult check-ups"],
    },
  },
  ophthalmologist: {
    about: {
      sq: "Kontroll i plotë i syve për të rritur dhe fëmijë, matja e dioptrisë dhe trajtim i glaukomës, kataraktit dhe syrit të thatë.",
      en: "Complete eye exams for adults and children, prescriptions for glasses and treatment of glaucoma, cataract and dry eyes.",
    },
    focus: {
      sq: ["Kontroll i syve", "Glaukoma", "Katarakti", "Syri i thatë", "Oftalmologji pediatrike"],
      en: ["Eye exams", "Glaucoma", "Cataract", "Dry eyes", "Paediatric ophthalmology"],
    },
  },
  orthopedist: {
    about: {
      sq: "Diagnostikim dhe trajtim i problemeve të kockave, nyjeve dhe muskujve, nga lëndimet sportive te dhimbjet kronike të shpinës dhe gjunjëve.",
      en: "Diagnosis and treatment of bone, joint and muscle problems, from sports injuries to chronic back and knee pain.",
    },
    focus: {
      sq: ["Lëndime sportive", "Dhimbje të gjunjëve", "Dhimbje të shpinës", "Thyerje dhe ndrydhje", "Infiltrime në nyje"],
      en: ["Sports injuries", "Knee pain", "Back pain", "Fractures and sprains", "Joint injections"],
    },
  },
  physiotherapist: {
    about: {
      sq: "Rehabilitim pas lëndimeve dhe operacioneve, trajtim i dhimbjeve të shpinës dhe qafës, dhe ushtrime të përshtatura për çdo pacient.",
      en: "Rehabilitation after injuries and surgery, treatment of back and neck pain, and exercises tailored to each patient.",
    },
    focus: {
      sq: ["Dhimbje shpine dhe qafe", "Rehabilitim pas operacionit", "Rehabilitim sportiv", "Terapi manuale", "Ushtrime korrigjuese"],
      en: ["Back and neck pain", "Rehabilitation after surgery", "Sports rehabilitation", "Manual therapy", "Corrective exercise"],
    },
  },
  psychologist: {
    about: {
      sq: "Mbështetje psikologjike për stresin, ankthin, humorin e ulët dhe vështirësitë në marrëdhënie, në një ambient të qetë dhe konfidencial.",
      en: "Psychological support for stress, anxiety, low mood and relationship difficulties, in a calm and confidential setting.",
    },
    focus: {
      sq: ["Stres dhe ankth", "Humor i ulët", "Terapi për çifte", "Mbështetje për adoleshentët", "Seanca online"],
      en: ["Stress and anxiety", "Low mood", "Couples therapy", "Support for teenagers", "Online sessions"],
    },
  },
  ent: {
    about: {
      sq: "Diagnostikim dhe trajtim i problemeve të veshit, hundës dhe fytit, si infeksionet, sinusiti, alergjitë dhe problemet me dëgjimin.",
      en: "Diagnosis and treatment of ear, nose and throat problems such as infections, sinusitis, allergies and hearing problems.",
    },
    focus: {
      sq: ["Infeksionet e veshit", "Sinusiti", "Bajamet", "Alergjitë e hundës", "Kontroll i dëgjimit"],
      en: ["Ear infections", "Sinusitis", "Tonsils", "Nasal allergies", "Hearing checks"],
    },
  },
  neurologist: {
    about: {
      sq: "Diagnostikim dhe trajtim i sëmundjeve të sistemit nervor, si dhimbjet e kokës, migrena, marramendja dhe mpirja e gjymtyrëve.",
      en: "Diagnosis and treatment of nervous system conditions such as headaches, migraine, dizziness and numbness.",
    },
    focus: {
      sq: ["Migrena dhe dhimbje koke", "Marramendje", "Mpirje dhe dhimbje nervore", "Çrregullime të gjumit", "EEG"],
      en: ["Migraine and headaches", "Dizziness", "Numbness and nerve pain", "Sleep problems", "EEG"],
    },
  },
  nutritionist: {
    about: {
      sq: "Plane ushqimore të personalizuara për peshën, diabetin, sportin dhe ushqyerjen e shëndetshme të familjes.",
      en: "Personalised nutrition plans for weight, diabetes, sport and healthy family eating.",
    },
    focus: {
      sq: ["Humbje peshe", "Ushqyerja në diabet", "Ushqyerja sportive", "Ushqyerja e fëmijëve", "Intolerancat ushqimore"],
      en: ["Weight loss", "Nutrition for diabetes", "Sports nutrition", "Children's nutrition", "Food intolerances"],
    },
  },
  lab: {
    about: {
      sq: "Analiza të gjakut dhe të urinës, me marrje të mostrës pa pritje dhe rezultate zakonisht brenda ditës.",
      en: "Blood and urine tests, with no-wait sample collection and results usually on the same day.",
    },
    focus: {
      sq: ["Analiza të plota të gjakut", "Sheqeri dhe HbA1c", "Hormonet e tiroides", "Analiza e urinës", "Vitamina D dhe B12"],
      en: ["Full blood count", "Blood sugar and HbA1c", "Thyroid hormones", "Urine tests", "Vitamin D and B12"],
    },
  },
};

/** Visit reasons shown in the booking widget: first visit, follow-up, then the services and focus areas of the specialty. */
export function visitReasons(specialtyId: string, lang: Lang) {
  const t = profileDicts[lang];
  const services = expertise.filter((e) => e.specialtyId === specialtyId).map((e) => e[lang]);
  const focus = specialtyInfo[specialtyId]?.focus[lang] ?? [];
  const general = specialtyId === "lab" ? [] : [t.reasons.first, t.reasons.followup];
  const seen = new Set<string>();
  return [...general, ...services, ...focus].filter((label) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Short biography built from the profile data. */
export function bioParagraphs(p: Practitioner, specialty: string, clinic: string, city: string, lang: Lang) {
  const info = specialtyInfo[p.specialty_id];
  const name = [p.title, p.full_name].filter(Boolean).join(" ");
  const about = info ? info.about[lang] : "";
  if (!p.gender) {
    // An institution, such as a laboratory.
    return lang === "sq"
      ? [`${name} ndodhet në ${city} dhe punon me pacientë nga i gjithë rajoni.`, about]
      : [`${name} is based in ${city} and serves patients from the whole region.`, about];
  }
  const years = p.years_experience;
  const role = roleNoun(specialty, p.specialty_id, lang);
  if (lang === "sq") {
    const exp = years ? ` me ${years} vjet përvojë` : "";
    return [
      `${name} është ${role}${exp} dhe punon në ${clinic}, ${city}.`,
      about,
      p.offers_video
        ? "Pranon pacientë në klinikë dhe ofron edhe konsultime me video për kontrolle pasuese dhe këshilla."
        : "Pranon pacientë në klinikë, me termine që mund t'i rezervosh online.",
    ];
  }
  const exp = years ? ` with ${years} years of experience` : "";
  const article = /^[aeiou]/i.test(role) ? "an" : "a";
  return [
    `${name} is ${article} ${role}${exp}, working at ${clinic} in ${city}.`,
    about,
    p.offers_video
      ? "Sees patients at the clinic and also offers video consultations for follow-ups and advice."
      : "Sees patients at the clinic, with appointments you can book online.",
  ];
}

/** The specialty as it reads in the middle of a sentence: "mjeke e familjes", "an ENT specialist". */
function roleNoun(specialty: string, specialtyId: string, lang: Lang) {
  if (lang === "en" && specialtyId === "internist") return "internal medicine specialist";
  // Keep abbreviations such as "ENT" or "ORL" in capitals.
  return /^[A-ZËÇ][A-ZËÇ]/.test(specialty) ? specialty : specialty.charAt(0).toLowerCase() + specialty.slice(1);
}

export type HoursRow = { weekday: number; ranges: string[] };

/** Monday to Sunday, each with its opening ranges ("08:00–15:00"), empty when closed. */
export function weeklyHours(schedules: Schedule[]): HoursRow[] {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => ({
    weekday,
    ranges: schedules
      .filter((s) => s.weekday === weekday)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((s) => `${shortTime(s.start_time)}–${shortTime(s.end_time)}`),
  }));
}

/** "E hënë – e premte: 08:00–15:00; e shtunë: 09:00–13:00" */
export function hoursSummary(schedules: Schedule[], lang: Lang) {
  const rows = weeklyHours(schedules).filter((r) => r.ranges.length > 0);
  const groups: { from: number; to: number; ranges: string }[] = [];
  for (const r of rows) {
    const key = r.ranges.join(", ");
    const last = groups[groups.length - 1];
    if (last && last.ranges === key && last.to === r.weekday - 1) last.to = r.weekday;
    else groups.push({ from: r.weekday, to: r.weekday, ranges: key });
  }
  return groups
    .map((g) => {
      const to = lang === "sq" ? dayName(g.to, lang).toLowerCase() : dayName(g.to, lang);
      const days = g.from === g.to ? dayName(g.from, lang) : `${dayName(g.from, lang)} – ${to}`;
      return `${days}: ${g.ranges}`;
    })
    .join("; ");
}

/** Whether the practice is open at `now` (Kosovo time) and when it closes or opens next. */
export function openStatus(schedules: Schedule[], now: { weekday: number; minutes: number }, lang: Lang) {
  const t = profileDicts[lang];
  const today = schedules
    .filter((s) => s.weekday === now.weekday)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const current = today.find((s) => hhmmToMinutes(s.start_time) <= now.minutes && now.minutes < hhmmToMinutes(s.end_time));
  if (current) return { open: true, text: t.openNow(shortTime(current.end_time)) };

  const laterToday = today.find((s) => hhmmToMinutes(s.start_time) > now.minutes);
  if (laterToday) return { open: false, text: t.closedNow(t.today, shortTime(laterToday.start_time)) };

  for (let i = 1; i <= 7; i++) {
    const weekday = ((now.weekday - 1 + i) % 7) + 1;
    const first = schedules
      .filter((s) => s.weekday === weekday)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
    if (first) {
      return { open: false, text: t.closedNow(i === 1 ? t.tomorrow : t.onDay(weekday), shortTime(first.start_time)) };
    }
  }
  return { open: false, text: t.closed };
}

/** "shqip, anglisht dhe gjermanisht" / "Albanian, English and German". */
export function joinList(items: string[], lang: Lang) {
  if (items.length <= 1) return items.join("");
  const and = lang === "sq" ? "dhe" : "and";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}
