// Text for the listing pages (specialty, city, search, video) and the info pages
// (all specialties, for practitioners, help), in Albanian and English.
import type { Lang } from "./types";

/** "te stomatologu": the definite form used after "te" in Albanian questions. */
const definiteSq: Record<string, string> = {
  gp: "mjeku i familjes",
  dentist: "stomatologu",
  pediatrician: "pediatri",
  gynecologist: "gjinekologu",
  dermatologist: "dermatologu",
  cardiologist: "kardiologu",
  internist: "internisti",
  ophthalmologist: "okulisti",
  orthopedist: "ortopedi",
  physiotherapist: "fizioterapeuti",
  psychologist: "psikologu",
  ent: "mjeku ORL",
  neurologist: "neurologu",
  nutritionist: "nutricionisti",
  lab: "laboratori",
};

/** "a dentist", "an internal medicine specialist". */
function withArticle(nameEn: string, specialtyId: string) {
  const role =
    specialtyId === "internist"
      ? "internal medicine specialist"
      : /^[A-Z][A-Z]/.test(nameEn)
        ? nameEn
        : nameEn.charAt(0).toLowerCase() + nameEn.slice(1);
  return `${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}`;
}

export type SpecialtyFacts = {
  specialtyId: string;
  nameSq: string;
  nameEn: string;
  place: string;
  total: number;
  saturday: number;
  video: number;
  minPrice: number | null;
  maxPrice: number | null;
  about: string;
  focus: string[];
};

const sq = {
  kosovo: "Kosovë",
  crumbSearch: "Kërko",
  results: {
    specialtyTitle: (name: string, place: string) => `${name} në ${place}: rezervo termin online`,
    specialtyVideoTitle: (name: string) => `${name} me video: rezervo konsultim online`,
    searchTitle: (q: string, place?: string) => `Rezultatet për “${q}”${place ? ` në ${place}` : ""}`,
    typeTitle: (type: string, place: string) => `${type} në ${place}: rezervo termin online`,
    allTitle: (place: string) => `Mjekë në ${place}: rezervo termin online`,
    videoTitle: "Konsultime me video: rezervo online",
    count: (n: number) => (n === 1 ? "1 rezultat" : `${n} rezultate`),
    sortedBy: "renditur sipas terminit të parë të lirë",
    filters: "Filtrat",
    filtersActive: (n: number) => `Filtrat (${n})`,
    acceptsNew: "Pranon pacientë të rinj",
    language: "Gjuha e folur",
    anyLanguage: "Çdo gjuhë",
    gender: "Gjinia",
    anyGender: "Të gjitha",
    female: "Femër",
    male: "Mashkull",
    availability: "Disponueshmëria",
    anyTime: "Kurdo",
    today: "Sot",
    within: (n: number) => `Brenda ${n} ditësh`,
    clear: "Pastro filtrat",
    book: "Rezervo termin",
    firstFree: (when: string) => `Termini i parë i lirë: ${when}`,
    noOnline: "Nuk ka termine online në dy javët e ardhshme.",
    moreTags: (n: number) => `+${n} të tjera`,
    emptyTitle: "Nuk gjetëm asnjë rezultat",
    emptyText: "Provo pa disa filtra, një qytet tjetër ose konsultim me video.",
    emptyEverywhere: "Kërko në gjithë Kosovën",
    pages: "Faqet e rezultateve",
    prev: "Faqja e mëparshme",
    next: "Faqja tjetër",
    page: (n: number) => `Faqja ${n}`,
    slotsFor: (name: string) => `Terminet e lira te ${name}`,
    metaDescription: (what: string, place: string) =>
      `${what} në ${place}: shiko terminet e lira, çmimet dhe gjuhët, dhe rezervo online falas në Mjeku.Im.`,
  },
  sections: {
    faq: "Pyetje të shpeshta",
    expertise: "Gjej shërbim",
    allExpertise: "Të gjitha shërbimet",
    otherSpecialty: "Gjej specialitet tjetër",
    allSpecialties: "Të gjitha specialitetet",
    related: "Kërkime të ngjashme",
    popular: "Kërkime të njohura",
    inCity: (what: string, city: string) => `${what} në ${city}`,
    otherInCity: (city: string) => `Specialistë të tjerë në ${city}`,
  },
  listed: {
    title: (place: string) => `Të tjerë në ${place}`,
    lede: (n: number, specialtyId: string, nameSq: string, place: string) =>
      `${n === 1 ? "1 vend" : `${n} vende`} në ${place} ku mund të shkosh te ${definiteSq[specialtyId] ?? nameSq.toLowerCase()}. Ende nuk pranojnë rezervime online në Mjeku.Im, ndaj telefono direkt.`,
    area: "Lagjja ose fshati",
    allAreas: "Të gjitha",
    public: "Publike",
    noPhone: "Pa numër telefoni",
    map: "Harta",
    website: "Faqja",
    claim: "Kjo është klinika ime",
    showAll: (n: number) => `Shfaq të gjitha (${n})`,
    source: (date: string) =>
      `Të dhënat: © kontribuesit e OpenStreetMap dhe faqet publike të klinikave, kontrolluar më ${date}. Mund të ketë gabime: konfirmo me telefon para se të shkosh.`,
    ownerTitle: "Punon në një nga këto klinika?",
    ownerText: "Krijo profil falas, vendos orarin dhe merr rezervime online.",
    ownerCta: "Krijo profil",
    noneOnlineTitle: "Ende askush këtu nuk pranon rezervime online",
    noneOnlineText: (n: number) => `Por më poshtë ${n === 1 ? "ka 1 vend" : `ka ${n} vende`} që mund t'i telefonosh.`,
    noneOnlineCta: "Shiko listën",
    byCity: (what: string) => `${what} sipas komunës`,
    places: (n: number) => (n === 1 ? "1 vend" : `${n} vende`),
  },
  specialtyFaq: (f: SpecialtyFacts) => {
    const def = definiteSq[f.specialtyId] ?? f.nameSq.toLowerCase();
    const price =
      f.minPrice === null
        ? "Çmimi shfaqet në profilin e secilit mjek, para se të rezervosh."
        : f.minPrice === f.maxPrice
          ? `Në Mjeku.Im, një vizitë te ${def} kushton ${f.minPrice} €. Çmimi shfaqet edhe në profilin e secilit mjek, para se të rezervosh.`
          : `Në Mjeku.Im, një vizitë te ${def} kushton nga ${f.minPrice} € deri në ${f.maxPrice} €. Çmimi i saktë shfaqet në profilin e secilit mjek, para se të rezervosh.`;
    return [
      {
        q: `Kur duhet të shkoj te ${def}?`,
        a: f.focus.length
          ? `${f.about} Arsyet më të shpeshta për vizitë: ${f.focus.map((x) => x.toLowerCase()).join(", ")}.`
          : f.about,
      },
      { q: `Sa kushton një vizitë te ${def} në ${f.place}?`, a: price },
      {
        q: `A mund të shkoj te ${def} të shtunën?`,
        a: f.saturday
          ? `Po. ${f.saturday} nga ${f.total} në këtë listë pranojnë pacientë edhe të shtunën. Shiko kalendarin e secilit profil për orët e lira.`
          : "Për momentin askush në këtë listë nuk pranon pacientë të shtunën.",
      },
      {
        q: "A ka konsultime me video?",
        a: f.video
          ? `Po, ${f.video} nga ${f.total} ofrojnë edhe konsultime me video. Zgjidh "Me video" te kërkimi për t'i parë vetëm ata.`
          : "Jo për këtë kërkim për momentin. Shiko faqen e konsultimeve me video për specialitete të tjera.",
      },
      {
        q: "Si të rezervoj online?",
        a: "Zgjidh orën që të përshtatet në kalendarin e mjekut, shkruaj emrin dhe numrin e telefonit dhe konfirmo. Rezervimi është falas dhe merr menjëherë një kod rezervimi.",
      },
    ];
  },
  video: {
    eyebrow: "Konsultime me video",
    title: "Konsultohu me mjekun nga shtëpia",
    lede: "Rezervo një konsultim me video te mjekët që e ofrojnë. Lidhu nga telefoni ose kompjuteri, pa udhëtim dhe pa pritje.",
    listTitle: "Mjekët që ofrojnë konsultime me video",
  },
  specialtiesPage: {
    title: "Të gjitha specialitetet",
    lede: "Zgjidh specialitetin për të parë mjekët, terminet e lira dhe çmimet në gjithë Kosovën.",
    count: (n: number) => (n === 1 ? "1 mjek ose klinikë" : `${n} mjekë dhe klinika`),
    cities: (n: number) => (n === 1 ? "në 1 qytet" : `në ${n} qytete`),
    services: "Të gjitha shërbimet",
    institutions: "Të gjitha institucionet",
    cityTitle: "Kërko sipas qytetit",
  },
  prosPage: {
    metaTitle: "Mjeku.Im Pro për mjekë dhe klinika",
    stepsTitle: "Si fillon",
    steps: [
      { title: "Krijo llogarinë", text: "Me email dhe fjalëkalim, falas, për një minutë." },
      { title: "Plotëso profilin dhe orarin", text: "Specialiteti, klinika, çmimi, gjuhët dhe orët kur pranon pacientë." },
      { title: "Pacientët rezervojnë online", text: "Çdo rezervim e sheh në llogarinë tënde, me emrin dhe telefonin e pacientit." },
    ],
    faqTitle: "Pyetje nga mjekët",
    faq: [
      { q: "Sa kushton Mjeku.Im Pro?", a: "Tani për tani është falas." },
      {
        q: "Klinika ime është tashmë në listë. Çfarë bëj?",
        a: "Te lista e qytetit tënd kliko “Kjo është klinika ime” dhe krijo llogarinë: të dhënat plotësohen vetë. Pasi e verifikojmë, profili yt zë vendin e saj në listë.",
      },
      { q: "A mund ta përdor me kalendarin që kam?", a: "Po, qëllimi është që rezervimet online të sinkronizohen me kalendarin e klinikës." },
      { q: "Kush i sheh të dhënat e pacientëve?", a: "Vetëm klinika ku rezervon pacienti. Të dhënat ruhen në BE, në përputhje me Ligjin Nr. 06/L-082 dhe GDPR." },
    ],
  },
  help: {
    title: "Qendra e ndihmës",
    lede: "Përgjigje për rezervimin, anulimin, konsultimet me video dhe privatësinë.",
    manageTitle: "Menaxho rezervimin",
    manageText: "Shiko ose anulo terminin me kodin e rezervimit dhe numrin e telefonit.",
    manageCta: "Hap rezervimin tim",
    videoTitle: "Konsultime me video",
    videoText: "Si funksionon konsultimi nga shtëpia dhe cilët mjekë e ofrojnë.",
    videoCta: "Shiko mjekët",
    privacyTitle: "Privatësia",
    privacyText: "Si i mbrojmë të dhënat e tua shëndetësore.",
    privacyCta: "Lexo më shumë",
    faqTitle: "Pyetjet më të shpeshta",
    prosTitle: "Je mjek ose klinikë?",
    prosText: "Mëso si t'i marrësh rezervimet online me Mjeku.Im Pro.",
    prosCta: "Për mjekët",
  },
  moreFaq: "Shiko të gjitha pyetjet",
  allDoctors: "Shiko të gjithë mjekët",
};

export type PagesDict = typeof sq;

const en: PagesDict = {
  kosovo: "Kosovo",
  crumbSearch: "Search",
  results: {
    specialtyTitle: (name: string, place: string) => `${name} in ${place}: book an appointment online`,
    specialtyVideoTitle: (name: string) => `${name} by video: book a consultation online`,
    searchTitle: (q: string, place?: string) => `Results for “${q}”${place ? ` in ${place}` : ""}`,
    typeTitle: (type: string, place: string) => `${type} in ${place}: book an appointment online`,
    allTitle: (place: string) => `Doctors in ${place}: book an appointment online`,
    videoTitle: "Video consultations: book online",
    count: (n: number) => (n === 1 ? "1 result" : `${n} results`),
    sortedBy: "sorted by first free slot",
    filters: "Filters",
    filtersActive: (n: number) => `Filters (${n})`,
    acceptsNew: "Accepts new patients",
    language: "Spoken language",
    anyLanguage: "Any language",
    gender: "Gender",
    anyGender: "Any",
    female: "Female",
    male: "Male",
    availability: "Availability",
    anyTime: "Any time",
    today: "Today",
    within: (n: number) => `Within ${n} days`,
    clear: "Clear filters",
    book: "Book an appointment",
    firstFree: (when: string) => `First free slot: ${when}`,
    noOnline: "No online appointments in the next two weeks.",
    moreTags: (n: number) => `+${n} more`,
    emptyTitle: "No results found",
    emptyText: "Try removing some filters, another city or a video consultation.",
    emptyEverywhere: "Search all of Kosovo",
    pages: "Result pages",
    prev: "Previous page",
    next: "Next page",
    page: (n: number) => `Page ${n}`,
    slotsFor: (name: string) => `Free slots with ${name}`,
    metaDescription: (what: string, place: string) =>
      `${what} in ${place}: see free slots, prices and languages, and book online for free on Mjeku.Im.`,
  },
  sections: {
    faq: "Frequently asked questions",
    expertise: "Find an expertise",
    allExpertise: "All expertises",
    otherSpecialty: "Find another specialty",
    allSpecialties: "All specialties",
    related: "Related searches",
    popular: "Popular searches",
    inCity: (what: string, city: string) => `${what} in ${city}`,
    otherInCity: (city: string) => `Other specialists in ${city}`,
  },
  listed: {
    title: (place: string) => `More in ${place}`,
    lede: (n: number, specialtyId: string, nameEn: string, place: string) =>
      `${n === 1 ? "1 place" : `${n} places`} in ${place} where you can see ${withArticle(nameEn, specialtyId)}. They don't take online bookings on Mjeku.Im yet, so call them directly.`,
    area: "Neighbourhood or village",
    allAreas: "All",
    public: "Public",
    noPhone: "No phone number",
    map: "Map",
    website: "Website",
    claim: "This is my practice",
    showAll: (n: number) => `Show all (${n})`,
    source: (date: string) =>
      `Data: © OpenStreetMap contributors and the practices' public pages, checked on ${date}. It may contain mistakes: confirm by phone before you go.`,
    ownerTitle: "Work at one of these practices?",
    ownerText: "Create a free profile, set your hours and take bookings online.",
    ownerCta: "Create a profile",
    noneOnlineTitle: "No one here takes online bookings yet",
    noneOnlineText: (n: number) => `But there ${n === 1 ? "is 1 place" : `are ${n} places`} below you can call.`,
    noneOnlineCta: "See the list",
    byCity: (what: string) => `${what} by municipality`,
    places: (n: number) => (n === 1 ? "1 place" : `${n} places`),
  },
  specialtyFaq: (f: SpecialtyFacts) => {
    const who = withArticle(f.nameEn, f.specialtyId);
    const price =
      f.minPrice === null
        ? "Each profile shows the price before you book."
        : f.minPrice === f.maxPrice
          ? `On Mjeku.Im, a visit to ${who} costs €${f.minPrice}. Each profile also shows the price before you book.`
          : `On Mjeku.Im, a visit to ${who} costs from €${f.minPrice} to €${f.maxPrice}. Each profile shows the exact price before you book.`;
    return [
      {
        q: `When should I see ${who}?`,
        a: f.focus.length ? `${f.about} Common reasons for a visit: ${f.focus.map((x) => x.toLowerCase()).join(", ")}.` : f.about,
      },
      { q: `How much does a visit to ${who} cost in ${f.place}?`, a: price },
      {
        q: `Can I see ${who} on a Saturday?`,
        a: f.saturday
          ? `Yes. ${f.saturday} of the ${f.total} in this list also see patients on Saturdays. Check each profile's calendar for free times.`
          : "Nobody in this list sees patients on Saturdays at the moment.",
      },
      {
        q: "Are video consultations available?",
        a: f.video
          ? `Yes, ${f.video} of the ${f.total} also offer video consultations. Choose "Video" in the search bar to see only them.`
          : "Not for this search at the moment. See the video consultations page for other specialties.",
      },
      {
        q: "How do I book online?",
        a: "Pick a time that suits you in the doctor's calendar, enter your name and phone number and confirm. Booking is free and you get a booking code straight away.",
      },
    ];
  },
  video: {
    eyebrow: "Video consultations",
    title: "See a doctor from home",
    lede: "Book a video consultation with doctors who offer it. Join from your phone or computer, with no travel and no waiting room.",
    listTitle: "Doctors offering video consultations",
  },
  specialtiesPage: {
    title: "All specialties",
    lede: "Choose a specialty to see doctors, free slots and prices across Kosovo.",
    count: (n: number) => (n === 1 ? "1 doctor or practice" : `${n} doctors and practices`),
    cities: (n: number) => (n === 1 ? "in 1 city" : `in ${n} cities`),
    services: "All expertises",
    institutions: "All institutions",
    cityTitle: "Search by city",
  },
  prosPage: {
    metaTitle: "Mjeku.Im Pro for doctors and practices",
    stepsTitle: "How to get started",
    steps: [
      { title: "Create your account", text: "With an email and password, for free, in a minute." },
      { title: "Fill in your profile and hours", text: "Specialty, practice, price, languages and the hours you see patients." },
      { title: "Patients book online", text: "You see every booking in your account, with the patient's name and phone number." },
    ],
    faqTitle: "Questions from practitioners",
    faq: [
      { q: "How much does Mjeku.Im Pro cost?", a: "It's free for now." },
      {
        q: "My practice is already listed. What do I do?",
        a: "In your town's list, click “This is my practice” and create your account: the details are filled in for you. Once we verify you, your profile takes its place in the list.",
      },
      { q: "Can I use it with my current calendar?", a: "Yes, the aim is for online bookings to sync with your practice calendar." },
      { q: "Who can see patients' data?", a: "Only the practice the patient books with. Data is stored in the EU, in line with Law No. 06/L-082 and the GDPR." },
    ],
  },
  help: {
    title: "Help center",
    lede: "Answers about booking, cancelling, video consultations and privacy.",
    manageTitle: "Manage your booking",
    manageText: "See or cancel your appointment with your booking code and phone number.",
    manageCta: "Open my booking",
    videoTitle: "Video consultations",
    videoText: "How a consultation from home works and which doctors offer it.",
    videoCta: "See doctors",
    privacyTitle: "Privacy",
    privacyText: "How we protect your health data.",
    privacyCta: "Read more",
    faqTitle: "Most asked questions",
    prosTitle: "Are you a doctor or a practice?",
    prosText: "Learn how to take bookings online with Mjeku.Im Pro.",
    prosCta: "For practitioners",
  },
  moreFaq: "See all questions",
  allDoctors: "See all doctors",
};

export const pagesDicts: Record<Lang, PagesDict> = { sq, en };
