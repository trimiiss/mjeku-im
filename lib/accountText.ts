// Text for the practitioner account page (/llogaria): sign up, log in, profile form and bookings.
import type { Lang } from "./types";

export type SaveError =
  | "not_signed_in"
  | "invalid_title"
  | "invalid_name"
  | "invalid_gender"
  | "invalid_specialty"
  | "invalid_languages"
  | "invalid_price"
  | "invalid_duration"
  | "invalid_experience"
  | "invalid_about"
  | "invalid_clinic_name"
  | "invalid_clinic_type"
  | "invalid_city"
  | "invalid_address"
  | "invalid_postal_code"
  | "invalid_phone"
  | "invalid_website"
  | "invalid_hours"
  | "invalid_listing"
  | "unknown";

export type AuthErrorKey =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "user_exists"
  | "weak_password"
  | "invalid_email"
  | "rate_limit"
  | "email_send"
  | "signups_off"
  | "must_confirm"
  | "unknown";

const sq = {
  metaTitle: "Llogaria e mjekut",
  eyebrow: "Për mjekët dhe klinikat",
  title: "Llogaria e mjekut",
  lede: "Krijo profilin falas, vendos orarin dhe merr rezervime online nga pacientët në gjithë Kosovën.",
  loading: "Duke u ngarkuar…",
  offline: "Llogaritë funksionojnë vetëm kur faqja është e lidhur me bazën e të dhënave.",

  signUpTab: "Krijo llogari",
  signInTab: "Hyr",
  email: "Email",
  password: "Fjalëkalimi",
  passwordHint: "Të paktën 8 shenja.",
  licensed: "Konfirmoj që jam mjek ose punoj për një klinikë të licencuar në Kosovë, dhe që të dhënat që vendos janë të sakta.",
  signUp: "Krijo llogarinë",
  signIn: "Hyr",
  working: "Një moment…",
  forgot: "Ke harruar fjalëkalimin?",
  forgotTitle: "Fjalëkalim i ri",
  forgotText: "Shkruaj email-in e llogarisë dhe do të të dërgojmë një lidhje.",
  sendReset: "Dërgo lidhjen",
  backToSignIn: "Kthehu te hyrja",
  resetSent: (email: string) => `Nëse ekziston një llogari për ${email}, të kemi dërguar një lidhje për fjalëkalim të ri.`,
  checkEmail: (email: string) =>
    `Të dërguam një email në ${email}. Hap lidhjen aty për ta konfirmuar llogarinë, pastaj hyr këtu.`,
  newPasswordTitle: "Vendos një fjalëkalim të ri",
  newPassword: "Fjalëkalimi i ri",
  savePassword: "Ruaj fjalëkalimin",
  claimNote: (name: string) => `Po krijon profilin për “${name}”. Pasi të hysh, të dhënat e klinikës plotësohen vetë.`,
  authErrors: {
    invalid_credentials: "Email ose fjalëkalim i gabuar.",
    email_not_confirmed: "Konfirmo email-in fillimisht: hap lidhjen që të dërguam.",
    user_exists: "Ekziston tashmë një llogari me këtë email. Hyr në vend të kësaj.",
    weak_password: "Fjalëkalimi duhet të ketë të paktën 8 shenja.",
    invalid_email: "Shkruaj një adresë email-i të vlefshme.",
    rate_limit: "Shumë përpjekje. Provo sërish pas disa minutash.",
    email_send: "Nuk arritëm ta dërgojmë email-in. Provo sërish më vonë.",
    signups_off: "Regjistrimet janë të mbyllura për momentin.",
    must_confirm: "Konfirmo që je mjek ose punon për një klinikë të licencuar.",
    unknown: "Diçka nuk shkoi. Provo sërish.",
  } satisfies Record<AuthErrorKey, string>,

  signedInAs: (email: string) => `Ke hyrë si ${email}`,
  signOut: "Dil",
  welcomeTitle: "Mirë se erdhe!",
  welcomeText: "Plotëso profilin më poshtë që pacientët të të gjejnë dhe të rezervojnë online.",
  statusLive: "Profili yt është publik",
  statusHidden: "Profili yt është i fshehur",
  statusLiveText: "Pacientët të gjejnë në kërkim dhe rezervojnë në oraret e tua.",
  statusHiddenText: "Pacientët nuk e shohin profilin. Aktivizo “Shfaq profilin” për ta publikuar.",
  verified: "I verifikuar nga Mjeku.Im",
  unverified: "Në pritje të verifikimit: deri atëherë profili shfaqet me shënimin “i paverifikuar”.",
  viewProfile: "Shiko profilin publik",

  you: "Ti",
  practice: "Klinika",
  visits: "Vizitat",
  hours: "Orari",
  publishing: "Publikimi",
  titleField: "Titulli",
  noTitle: "Pa titull",
  fullName: "Emri dhe mbiemri",
  gender: "Gjinia",
  female: "Femër",
  male: "Mashkull",
  specialty: "Specialiteti",
  choose: "Zgjidh…",
  experience: "Vite përvojë",
  languages: "Gjuhët që flet",
  about: "Rreth teje",
  aboutHint: "Edukimi, përvoja dhe çfarë trajton. Shfaqet në profilin tënd.",
  listed: "Klinika jote në listat tona",
  listedHint:
    "Nëse klinika jote shfaqet tashmë te “Të tjerë në …”, zgjidhe këtu. Pasi ta verifikojmë, ajo hiqet nga lista dhe pacientët shohin profilin tënd.",
  notListed: "Nuk është në listë",
  clinicName: "Emri i klinikës",
  clinicType: "Lloji",
  city: "Komuna",
  neighborhood: "Lagjja ose fshati",
  address: "Adresa",
  postalCode: "Kodi postar",
  phone: "Telefoni i klinikës",
  phoneHint: "Shfaqet në profilin tënd.",
  website: "Faqja e internetit ose Facebook",
  duration: "Kohëzgjatja e vizitës",
  minutes: (n: number) => `${n} minuta`,
  price: "Çmimi i vizitës (€)",
  priceHint: "Lëre bosh nëse nuk dëshiron ta shfaqësh.",
  priceFrom: "Ky është çmimi më i ulët (“nga”)",
  acceptsNew: "Pranoj pacientë të rinj",
  video: "Ofroj edhe konsultime me video",
  open: "Hapur",
  from: "Nga",
  to: "Deri",
  hoursHint: "Pacientët rezervojnë vetëm brenda këtyre orëve. Terminet e lira krijohen për 3 javët e ardhshme.",
  published: "Shfaq profilin tim në Mjeku.Im dhe lejo rezervimet online",
  publishedHint: "Mund ta fshehësh kurdo.",
  save: "Ruaj profilin",
  saving: "Duke ruajtur…",
  saved: "Profili u ruajt.",
  saveErrors: {
    not_signed_in: "Sesioni mbaroi. Hyr sërish dhe provo përsëri.",
    invalid_title: "Zgjidh një titull nga lista.",
    invalid_name: "Shkruaj emrin dhe mbiemrin (3–80 shenja).",
    invalid_gender: "Zgjidh gjininë.",
    invalid_specialty: "Zgjidh specialitetin.",
    invalid_languages: "Zgjidh të paktën një gjuhë.",
    invalid_price: "Çmimi duhet të jetë një numër i plotë nga 0 deri në 2000.",
    invalid_duration: "Zgjidh kohëzgjatjen e vizitës.",
    invalid_experience: "Vitet e përvojës duhet të jenë nga 0 deri në 60.",
    invalid_about: "Teksti “Rreth teje” mund të ketë deri në 1500 shenja.",
    invalid_clinic_name: "Shkruaj emrin e klinikës (2–100 shenja).",
    invalid_clinic_type: "Zgjidh llojin e klinikës.",
    invalid_city: "Zgjidh komunën.",
    invalid_address: "Adresa ose lagjja është shumë e gjatë.",
    invalid_postal_code: "Kodi postar ka 5 shifra, p.sh. 10000.",
    invalid_phone: "Shkruaj një numër telefoni të vlefshëm, p.sh. +383 44 123 456.",
    invalid_website: "Faqja duhet të fillojë me https://",
    invalid_hours:
      "Kontrollo orarin: mbyllja duhet të jetë pas hapjes (sa të paktën një vizitë), mes 05:00 dhe 23:30, në hapa 5-minutësh.",
    invalid_listing: "Klinika e zgjedhur nga lista nuk u gjet më. Zgjidh “Nuk është në listë”.",
    unknown: "Profili nuk u ruajt. Provo sërish.",
  } satisfies Record<SaveError, string>,

  bookingsTitle: "Rezervimet",
  bookingsNeedProfile: "Ruaj profilin për të filluar të marrësh rezervime.",
  bookingsEmpty: "Ende nuk ka rezervime. Kur pacientët rezervojnë, i sheh këtu.",
  bookingsError: "Rezervimet nuk u ngarkuan.",
  refresh: "Rifresko",
  upcoming: "Të ardhshme",
  pastAndCancelled: "Të kaluara dhe të anuluara",
  cancelled: "Anuluar",
  byVideo: "Me video",
  atClinic: "Në klinikë",
  code: "Kodi",
  reason: "Arsyeja",
  note: "Shënim",
};

export type AccountDict = typeof sq;

const en: AccountDict = {
  metaTitle: "Practitioner account",
  eyebrow: "For doctors and practices",
  title: "Practitioner account",
  lede: "Create your free profile, set your opening hours and take online bookings from patients all over Kosovo.",
  loading: "Loading…",
  offline: "Accounts only work when the site is connected to its database.",

  signUpTab: "Create account",
  signInTab: "Log in",
  email: "Email",
  password: "Password",
  passwordHint: "At least 8 characters.",
  licensed: "I confirm that I am a doctor or work for a licensed practice in Kosovo, and that the details I enter are correct.",
  signUp: "Create account",
  signIn: "Log in",
  working: "One moment…",
  forgot: "Forgot your password?",
  forgotTitle: "New password",
  forgotText: "Enter your account's email and we'll send you a link.",
  sendReset: "Send link",
  backToSignIn: "Back to log in",
  resetSent: (email: string) => `If there is an account for ${email}, we've sent it a link to set a new password.`,
  checkEmail: (email: string) => `We sent an email to ${email}. Open the link in it to confirm your account, then log in here.`,
  newPasswordTitle: "Set a new password",
  newPassword: "New password",
  savePassword: "Save password",
  claimNote: (name: string) => `You're creating the profile for “${name}”. Once you're logged in, the practice details are filled in for you.`,
  authErrors: {
    invalid_credentials: "Wrong email or password.",
    email_not_confirmed: "Confirm your email first: open the link we sent you.",
    user_exists: "There's already an account with this email. Log in instead.",
    weak_password: "The password needs at least 8 characters.",
    invalid_email: "Enter a valid email address.",
    rate_limit: "Too many attempts. Try again in a few minutes.",
    email_send: "We couldn't send the email. Try again later.",
    signups_off: "Sign-ups are closed at the moment.",
    must_confirm: "Confirm that you are a doctor or work for a licensed practice.",
    unknown: "Something went wrong. Try again.",
  },

  signedInAs: (email: string) => `Logged in as ${email}`,
  signOut: "Log out",
  welcomeTitle: "Welcome!",
  welcomeText: "Fill in your profile below so patients can find you and book online.",
  statusLive: "Your profile is public",
  statusHidden: "Your profile is hidden",
  statusLiveText: "Patients find you in search and book within your opening hours.",
  statusHiddenText: "Patients can't see your profile. Turn on “Show my profile” to publish it.",
  verified: "Verified by Mjeku.Im",
  unverified: "Waiting for verification: until then your profile is marked “not verified”.",
  viewProfile: "View public profile",

  you: "You",
  practice: "Practice",
  visits: "Visits",
  hours: "Opening hours",
  publishing: "Publishing",
  titleField: "Title",
  noTitle: "No title",
  fullName: "First and last name",
  gender: "Gender",
  female: "Female",
  male: "Male",
  specialty: "Specialty",
  choose: "Choose…",
  experience: "Years of experience",
  languages: "Languages you speak",
  about: "About you",
  aboutHint: "Education, experience and what you treat. Shown on your profile.",
  listed: "Your practice in our lists",
  listedHint:
    "If your practice already appears under “More in …”, choose it here. Once we verify you, it's removed from that list and patients see your profile instead.",
  notListed: "Not in the list",
  clinicName: "Practice name",
  clinicType: "Type",
  city: "Municipality",
  neighborhood: "Neighbourhood or village",
  address: "Address",
  postalCode: "Postcode",
  phone: "Practice phone",
  phoneHint: "Shown on your profile.",
  website: "Website or Facebook page",
  duration: "Visit length",
  minutes: (n: number) => `${n} minutes`,
  price: "Visit price (€)",
  priceHint: "Leave empty if you don't want to show it.",
  priceFrom: "This is the lowest price (“from”)",
  acceptsNew: "I accept new patients",
  video: "I also offer video consultations",
  open: "Open",
  from: "From",
  to: "To",
  hoursHint: "Patients can only book within these hours. Free slots are created for the next 3 weeks.",
  published: "Show my profile on Mjeku.Im and allow online bookings",
  publishedHint: "You can hide it at any time.",
  save: "Save profile",
  saving: "Saving…",
  saved: "Profile saved.",
  saveErrors: {
    not_signed_in: "Your session ended. Log in again and try once more.",
    invalid_title: "Choose a title from the list.",
    invalid_name: "Enter your first and last name (3–80 characters).",
    invalid_gender: "Choose your gender.",
    invalid_specialty: "Choose your specialty.",
    invalid_languages: "Choose at least one language.",
    invalid_price: "The price must be a whole number from 0 to 2000.",
    invalid_duration: "Choose the visit length.",
    invalid_experience: "Years of experience must be from 0 to 60.",
    invalid_about: "“About you” can have up to 1500 characters.",
    invalid_clinic_name: "Enter the practice name (2–100 characters).",
    invalid_clinic_type: "Choose the practice type.",
    invalid_city: "Choose the municipality.",
    invalid_address: "The address or neighbourhood is too long.",
    invalid_postal_code: "Postcodes have 5 digits, e.g. 10000.",
    invalid_phone: "Enter a valid phone number, e.g. +383 44 123 456.",
    invalid_website: "The website must start with https://",
    invalid_hours:
      "Check your hours: closing must be after opening (by at least one visit), between 05:00 and 23:30, in 5-minute steps.",
    invalid_listing: "The practice you chose from the list no longer exists. Choose “Not in the list”.",
    unknown: "Your profile wasn't saved. Try again.",
  },

  bookingsTitle: "Bookings",
  bookingsNeedProfile: "Save your profile to start taking bookings.",
  bookingsEmpty: "No bookings yet. When patients book, you'll see them here.",
  bookingsError: "Your bookings couldn't be loaded.",
  refresh: "Refresh",
  upcoming: "Upcoming",
  pastAndCancelled: "Past and cancelled",
  cancelled: "Cancelled",
  byVideo: "By video",
  atClinic: "At the practice",
  code: "Code",
  reason: "Reason",
  note: "Note",
};

export const accountDicts: Record<Lang, AccountDict> = { sq, en };
