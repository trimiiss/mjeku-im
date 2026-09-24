-- Map location, postal codes and years of experience for the demo clinics and doctors.

update public.clinics c set postal_code = v.postal_code, lat = v.lat, lng = v.lng
from (values
  ('ulpiana-med', '10000', 42.6528, 21.1705),
  ('buzeqeshja', '10000', 42.6619, 21.1638),
  ('ylberi', '10000', 42.6507, 21.1583),
  ('levizja', '10000', 42.6598, 21.1817),
  ('qetesia', '10000', 42.6703, 21.1502),
  ('qeliza', '10000', 42.6504, 21.1546),
  ('kalaja', '20000', 42.2093, 20.7416),
  ('rugova', '30000', 42.6593, 20.2887),
  ('carshia', '50000', 42.3833, 20.4285),
  ('syri-kalter', '50000', 42.3804, 20.4309),
  ('ibri', '40000', 42.8826, 20.8677),
  ('nerodime', '70000', 42.3702, 21.1553),
  ('anamorava', '60000', 42.4635, 21.4694),
  ('llapi', '11000', 42.9106, 21.1932),
  ('ura-e-gurit', '42000', 42.8231, 20.9675),
  ('nutri-balanca', '12000', 42.6364, 21.0922)
) as v(id, postal_code, lat, lng)
where c.id = v.id;

update public.practitioners p set years_experience = v.years
from (values
  ('arta-krasniqi', 12),
  ('blerim-hoxha', 18),
  ('merita-kelmendi', 15),
  ('valon-rexhepi', 9),
  ('dafina-berisha', 8),
  ('erion-gashi', 11),
  ('lirie-shala', 7),
  ('teuta-morina', 10),
  ('laboratori-qeliza', 14),
  ('driton-bytyqi', 16),
  ('elife-shehu', 13),
  ('agon-dreshaj', 12),
  ('donika-lajci', 6),
  ('besa-kryeziu', 10),
  ('fisnik-hasani', 9),
  ('ilir-beqiri', 20),
  ('kaltrina-bajrami', 8),
  ('mentor-ramadani', 17),
  ('shpresa-hyseni', 22),
  ('granit-zeqiri', 11),
  ('arbnora-salihu', 5)
) as v(id, years)
where p.id = v.id;
