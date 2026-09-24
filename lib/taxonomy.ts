// Reasons for a visit and institution types shown in the directory.
// Each one maps to a specialty or clinic type in the database.

export type Expertise = { id: string; sq: string; en: string; specialtyId: string };

export const expertise: Expertise[] = [
  { id: "checkup", sq: "Kontroll i përgjithshëm", en: "General check-up", specialtyId: "gp" },
  { id: "flu", sq: "Vaksinë kundër gripit", en: "Flu vaccine", specialtyId: "gp" },
  { id: "bp", sq: "Matja e tensionit", en: "Blood pressure check", specialtyId: "internist" },
  { id: "diabetes", sq: "Kontroll i sheqerit", en: "Diabetes check", specialtyId: "internist" },
  { id: "ecg", sq: "EKG", en: "ECG", specialtyId: "cardiologist" },
  { id: "cleaning", sq: "Pastrim i dhëmbëve", en: "Dental cleaning", specialtyId: "dentist" },
  { id: "filling", sq: "Mbushje e dhëmbit", en: "Tooth filling", specialtyId: "dentist" },
  { id: "child", sq: "Kontroll i fëmijës", en: "Child check-up", specialtyId: "pediatrician" },
  { id: "gyn", sq: "Kontroll gjinekologjik", en: "Gynaecological check-up", specialtyId: "gynecologist" },
  { id: "pregnancy", sq: "Ekografi në shtatzëni", en: "Pregnancy ultrasound", specialtyId: "gynecologist" },
  { id: "moles", sq: "Kontroll i nishaneve", en: "Mole check", specialtyId: "dermatologist" },
  { id: "eyes", sq: "Kontroll i syve", en: "Eye exam", specialtyId: "ophthalmologist" },
  { id: "back", sq: "Dhimbje shpine", en: "Back pain", specialtyId: "physiotherapist" },
  { id: "sports", sq: "Lëndime sportive", en: "Sports injuries", specialtyId: "orthopedist" },
  { id: "stress", sq: "Stres dhe ankth", en: "Stress and anxiety", specialtyId: "psychologist" },
  { id: "headache", sq: "Dhimbje koke", en: "Headaches", specialtyId: "neurologist" },
  { id: "ear", sq: "Dhimbje veshi", en: "Ear pain", specialtyId: "ent" },
  { id: "diet", sq: "Plan ushqimor", en: "Diet plan", specialtyId: "nutritionist" },
  { id: "blood", sq: "Analiza të gjakut", en: "Blood tests", specialtyId: "lab" },
];

export const clinicTypes: Record<string, { sq: string; en: string }> = {
  polyclinic: { sq: "Poliklinikë", en: "Polyclinic" },
  practice: { sq: "Ordinancë private", en: "Private practice" },
  dental: { sq: "Ordinancë dentare", en: "Dental practice" },
  pediatric: { sq: "Qendër pediatrike", en: "Paediatric centre" },
  physio: { sq: "Qendër fizioterapie", en: "Physiotherapy centre" },
  psychology: { sq: "Qendër psikologjike", en: "Psychology practice" },
  eye: { sq: "Klinikë e syve", en: "Eye clinic" },
  lab: { sq: "Laborator", en: "Laboratory" },
  nutrition: { sq: "Studio ushqyerjeje", en: "Nutrition studio" },
};

export const heroChips = ["gp", "dentist", "pediatrician", "gynecologist", "dermatologist", "ophthalmologist"];

export const popularSpecialtyCities: [string, string][] = [
  ["dentist", "prishtine"],
  ["pediatrician", "ferizaj"],
  ["gp", "prizren"],
  ["ophthalmologist", "gjakove"],
  ["orthopedist", "peje"],
  ["internist", "mitrovice"],
  ["ent", "gjilan"],
  ["neurologist", "vushtrri"],
  ["psychologist", "prishtine"],
  ["gp", "podujeve"],
];

export const popularExpertiseCities: [string, string][] = [
  ["eyes", "prizren"],
  ["cleaning", "gjakove"],
  ["blood", "prishtine"],
  ["child", "ferizaj"],
  ["back", "prishtine"],
  ["diet", "fushe-kosove"],
  ["headache", "vushtrri"],
  ["ear", "gjilan"],
];

export const languageNames: Record<string, { sq: string; en: string }> = {
  sq: { sq: "shqip", en: "Albanian" },
  en: { sq: "anglisht", en: "English" },
  de: { sq: "gjermanisht", en: "German" },
  it: { sq: "italisht", en: "Italian" },
  tr: { sq: "turqisht", en: "Turkish" },
  sr: { sq: "serbisht", en: "Serbian" },
};
