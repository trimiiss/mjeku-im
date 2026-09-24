-- Demo data for Mjeku.Im (Kosovo). Generated from lib/seed.json by scripts/make-seed-sql.mjs.
-- All practitioners and clinics are fictional.

insert into public.cities (id, name_sq, name_en, aliases, sort) values
  ('prishtine', 'Prishtinë', 'Pristina', 'prishtina prishtine pristina', 1),
  ('prizren', 'Prizren', 'Prizren', 'prizreni', 2),
  ('peje', 'Pejë', 'Peja', 'peja peje', 3),
  ('gjakove', 'Gjakovë', 'Gjakova', 'gjakova gjakove', 4),
  ('mitrovice', 'Mitrovicë', 'Mitrovica', 'mitrovica mitrovice', 5),
  ('ferizaj', 'Ferizaj', 'Ferizaj', 'ferizaji', 6),
  ('gjilan', 'Gjilan', 'Gjilan', 'gjilani', 7),
  ('podujeve', 'Podujevë', 'Podujeva', 'podujeva podujeve', 8),
  ('vushtrri', 'Vushtrri', 'Vushtrri', 'vushtrria', 9),
  ('fushe-kosove', 'Fushë Kosovë', 'Fushë Kosova', 'fushe kosova fushe kosove', 10)
on conflict (id) do nothing;

insert into public.specialties (id, name_sq, name_sq_f, name_en, keywords, sort) values
  ('gp', 'Mjek i familjes', 'Mjeke e familjes', 'Family doctor', 'gp general practitioner mjeku familjes kontroll check-up vaksina grip tension', 1),
  ('dentist', 'Stomatolog', 'Stomatologe', 'Dentist', 'dhembe dhemb dental pastrim mbushje stomatologji', 2),
  ('pediatrician', 'Pediatër', 'Pediatre', 'Paediatrician', 'femije femijet foshnje vaksina pediatri kids child', 3),
  ('gynecologist', 'Gjinekolog', 'Gjinekologe', 'Gynaecologist', 'grua shtatzani ultratinguj kontracepsion papanikolau ob-gyn', 4),
  ('dermatologist', 'Dermatolog', 'Dermatologe', 'Dermatologist', 'lekure nishane akne alergji skin', 5),
  ('cardiologist', 'Kardiolog', 'Kardiologe', 'Cardiologist', 'zemra ekg tension presion heart', 6),
  ('internist', 'Internist', 'Interniste', 'Internal medicine', 'mjekesi interne diabet sheqer tension presion', 7),
  ('ophthalmologist', 'Okulist', 'Okuliste', 'Ophthalmologist', 'sy syte syze shikim eye oftalmolog', 8),
  ('orthopedist', 'Ortoped', 'Ortopede', 'Orthopaedist', 'kocka gjunje shpina lendime sport', 9),
  ('physiotherapist', 'Fizioterapeut', 'Fizioterapeute', 'Physiotherapist', 'fizio fizioterapi shpina qafa rehabilitim masazh', 10),
  ('psychologist', 'Psikolog', 'Psikologe', 'Psychologist', 'stres ankth depresion terapi psikoterapi', 11),
  ('ent', 'Mjek ORL', 'Mjeke ORL', 'ENT specialist', 'vesh hunde fyt otorinolaringolog orl', 12),
  ('neurologist', 'Neurolog', 'Neurologe', 'Neurologist', 'dhimbje koke migrene nerva', 13),
  ('nutritionist', 'Nutricionist', 'Nutricioniste', 'Nutritionist', 'dieta pesha ushqim ushqyerje diabet', 14),
  ('lab', 'Laborator', 'Laborator', 'Laboratory', 'analiza gjak test urine laboratori', 15)
on conflict (id) do nothing;

insert into public.clinics (id, name, type, city_id, neighborhood, postal_code, lat, lng) values
  ('ulpiana-med', 'Poliklinika Ulpiana Med', 'polyclinic', 'prishtine', 'Ulpiana', '10000', 42.6528, 21.1705),
  ('buzeqeshja', 'Ordinanca Dentare Buzëqeshja', 'dental', 'prishtine', 'Qendër', '10000', 42.6619, 21.1638),
  ('ylberi', 'Qendra Pediatrike Ylberi', 'pediatric', 'prishtine', 'Dardania', '10000', 42.6507, 21.1583),
  ('levizja', 'Fizio Lëvizja', 'physio', 'prishtine', 'Kodra e Diellit', '10000', 42.6598, 21.1817),
  ('qetesia', 'Qendra Psikologjike Qetësia', 'psychology', 'prishtine', 'Arbëria', '10000', 42.6703, 21.1502),
  ('qeliza', 'Laboratori Qeliza', 'lab', 'prishtine', 'Lakrishtë', '10000', 42.6504, 21.1546),
  ('kalaja', 'Klinika Kalaja', 'polyclinic', 'prizren', 'Qendra historike', '20000', 42.2093, 20.7416),
  ('rugova', 'Ordinanca Rugova', 'practice', 'peje', 'Qendër', '30000', 42.6593, 20.2887),
  ('carshia', 'Poliklinika Çarshia', 'polyclinic', 'gjakove', 'Çarshia e Madhe', '50000', 42.3833, 20.4285),
  ('syri-kalter', 'Klinika e Syve Syri i Kaltër', 'eye', 'gjakove', 'Qendër', '50000', 42.3804, 20.4309),
  ('ibri', 'Ordinanca Ibri', 'practice', 'mitrovice', 'Qendër', '40000', 42.8826, 20.8677),
  ('nerodime', 'Klinika Nerodime', 'polyclinic', 'ferizaj', 'Qendër', '70000', 42.3702, 21.1553),
  ('anamorava', 'Ordinanca Anamorava', 'practice', 'gjilan', 'Qendër', '60000', 42.4635, 21.4694),
  ('llapi', 'Ordinanca Llapi', 'practice', 'podujeve', 'Qendër', '11000', 42.9106, 21.1932),
  ('ura-e-gurit', 'Ordinanca Ura e Gurit', 'practice', 'vushtrri', 'Qendër', '42000', 42.8231, 20.9675),
  ('nutri-balanca', 'Studio Nutri Balanca', 'nutrition', 'fushe-kosove', 'Qendër', '12000', 42.6364, 21.0922)
on conflict (id) do nothing;

insert into public.practitioners (id, title, full_name, gender, specialty_id, clinic_id, languages, offers_video, open_saturday, price_eur, price_from, duration_min, years_experience, accepts_new_patients, featured) values
  ('arta-krasniqi', 'Dr.', 'Arta Krasniqi', 'f', 'gp', 'ulpiana-med', array['sq', 'en', 'de']::text[], true, true, 20, false, 20, 12, true, true),
  ('blerim-hoxha', 'Dr.', 'Blerim Hoxha', 'm', 'cardiologist', 'ulpiana-med', array['sq', 'en']::text[], true, false, 35, false, 30, 18, true, false),
  ('merita-kelmendi', 'Dr.', 'Merita Kelmendi', 'f', 'gynecologist', 'ulpiana-med', array['sq', 'en', 'de']::text[], false, true, 30, false, 30, 15, true, false),
  ('valon-rexhepi', 'Dr.', 'Valon Rexhepi', 'm', 'dermatologist', 'ulpiana-med', array['sq', 'en', 'tr']::text[], true, false, 30, false, 20, 9, true, false),
  ('dafina-berisha', 'Dr. stom.', 'Dafina Berisha', 'f', 'dentist', 'buzeqeshja', array['sq', 'en', 'de']::text[], false, true, 15, false, 30, 8, true, false),
  ('erion-gashi', 'Dr.', 'Erion Gashi', 'm', 'pediatrician', 'ylberi', array['sq', 'en']::text[], true, true, 25, false, 20, 11, true, false),
  ('lirie-shala', '', 'Lirie Shala', 'f', 'physiotherapist', 'levizja', array['sq', 'en']::text[], false, true, 20, false, 45, 7, true, false),
  ('teuta-morina', '', 'Teuta Morina, MSc', 'f', 'psychologist', 'qetesia', array['sq', 'en', 'de']::text[], true, false, 30, false, 50, 10, true, false),
  ('laboratori-qeliza', '', 'Laboratori Qeliza', null, 'lab', 'qeliza', array['sq', 'en']::text[], false, true, 5, true, 15, 14, true, false),
  ('driton-bytyqi', 'Dr.', 'Driton Bytyqi', 'm', 'gp', 'kalaja', array['sq', 'tr', 'de', 'en']::text[], true, true, 15, false, 20, 16, true, false),
  ('elife-shehu', 'Dr.', 'Elife Shehu', 'f', 'ophthalmologist', 'kalaja', array['sq', 'tr', 'en']::text[], false, false, 25, false, 20, 13, true, false),
  ('agon-dreshaj', 'Dr.', 'Agon Dreshaj', 'm', 'orthopedist', 'rugova', array['sq', 'en', 'de']::text[], false, false, 30, false, 30, 12, true, false),
  ('donika-lajci', 'Dr.', 'Donika Lajçi', 'f', 'gp', 'rugova', array['sq', 'en']::text[], true, true, 15, false, 20, 6, true, false),
  ('besa-kryeziu', 'Dr. stom.', 'Besa Kryeziu', 'f', 'dentist', 'carshia', array['sq', 'en', 'it']::text[], false, true, 15, false, 30, 10, true, false),
  ('fisnik-hasani', 'Dr.', 'Fisnik Hasani', 'm', 'ophthalmologist', 'syri-kalter', array['sq', 'en']::text[], false, false, 25, false, 20, 9, true, false),
  ('ilir-beqiri', 'Dr.', 'Ilir Beqiri', 'm', 'internist', 'ibri', array['sq', 'en', 'sr']::text[], true, false, 20, false, 20, 20, true, false),
  ('kaltrina-bajrami', 'Dr.', 'Kaltrina Bajrami', 'f', 'pediatrician', 'nerodime', array['sq', 'en', 'de']::text[], false, true, 20, false, 20, 8, true, false),
  ('mentor-ramadani', 'Dr.', 'Mentor Ramadani', 'm', 'ent', 'anamorava', array['sq', 'en']::text[], false, false, 25, false, 20, 17, true, false),
  ('shpresa-hyseni', 'Dr.', 'Shpresa Hyseni', 'f', 'gp', 'llapi', array['sq']::text[], false, true, 15, false, 20, 22, true, false),
  ('granit-zeqiri', 'Dr.', 'Granit Zeqiri', 'm', 'neurologist', 'ura-e-gurit', array['sq', 'en']::text[], true, false, 30, false, 30, 11, true, false),
  ('arbnora-salihu', '', 'Arbnora Salihu, MSc', 'f', 'nutritionist', 'nutri-balanca', array['sq', 'en']::text[], true, false, 25, false, 45, 5, true, false)
on conflict (id) do nothing;

-- Opening hours: the same hours Monday to Friday, plus Saturday where open.
with hours (id, week_start, week_end, sat_start, sat_end) as (values
  ('arta-krasniqi', '08:00', '15:00', '09:00', '13:00'),
  ('blerim-hoxha', '12:00', '18:00', null, null),
  ('merita-kelmendi', '09:00', '15:00', '09:00', '12:00'),
  ('valon-rexhepi', '13:00', '19:00', null, null),
  ('dafina-berisha', '08:00', '16:00', '09:00', '14:00'),
  ('erion-gashi', '08:00', '14:00', '09:00', '12:00'),
  ('lirie-shala', '09:00', '18:00', '09:00', '13:00'),
  ('teuta-morina', '10:00', '19:00', null, null),
  ('laboratori-qeliza', '07:00', '12:00', '07:30', '11:00'),
  ('driton-bytyqi', '08:00', '14:00', '09:00', '12:00'),
  ('elife-shehu', '09:00', '15:00', null, null),
  ('agon-dreshaj', '10:00', '17:00', null, null),
  ('donika-lajci', '08:00', '13:00', '08:00', '12:00'),
  ('besa-kryeziu', '09:00', '17:00', '09:00', '13:00'),
  ('fisnik-hasani', '09:00', '15:00', null, null),
  ('ilir-beqiri', '08:00', '14:00', null, null),
  ('kaltrina-bajrami', '08:00', '15:00', '09:00', '12:00'),
  ('mentor-ramadani', '09:00', '16:00', null, null),
  ('shpresa-hyseni', '07:30', '13:30', '08:00', '12:00'),
  ('granit-zeqiri', '12:00', '18:00', null, null),
  ('arbnora-salihu', '10:00', '18:00', null, null)
)
insert into public.schedules (practitioner_id, weekday, start_time, end_time, slot_min)
select h.id, d, h.week_start::time, h.week_end::time, p.duration_min
from hours h
join public.practitioners p on p.id = h.id
cross join generate_series(1, 5) d
union all
select h.id, 6, h.sat_start::time, h.sat_end::time, p.duration_min
from hours h
join public.practitioners p on p.id = h.id
where h.sat_start is not null;

-- Three weeks of slots, about 30% already taken so the calendar looks realistic.
select public.generate_slots(21, 0.3);
