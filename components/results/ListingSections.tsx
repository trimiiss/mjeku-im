"use client";

import Link from "next/link";
import type { Listed } from "@/lib/directory";
import type { Base } from "@/lib/listing";
import { pagesDicts } from "@/lib/pagesText";
import { specialtyInfo } from "@/lib/profileText";
import { paths, searchPageHref, specialtyHref } from "@/lib/routes";
import { cityName, specialtyName } from "@/lib/search";
import { expertise, popularSpecialtyCities } from "@/lib/taxonomy";
import type { Practitioner } from "@/lib/types";
import { useApp } from "../AppContext";
import { ChevronRightIcon, PlusIcon } from "../Icons";

type LinkItem = { key: string; href: string; label: string };

function LinkBlock({ title, items, more }: { title: string; items: LinkItem[]; more?: LinkItem }) {
  if (items.length === 0) return null;
  return (
    <section className="lblock" aria-label={title}>
      <h2 className="lblock-title">{title}</h2>
      <ul className="lblock-list">
        {items.map((it) => (
          <li key={it.key}>
            <Link href={it.href}>{it.label}</Link>
          </li>
        ))}
      </ul>
      {more && (
        <Link className="link lblock-more" href={more.href}>
          {more.label}
          <ChevronRightIcon width={18} height={18} />
        </Link>
      )}
    </section>
  );
}

/** Below the results, like OneDoc: FAQ, expertises, other specialties, related and popular searches. */
export function ListingSections({ base, matching, listed }: { base: Base; matching: Practitioner[]; listed: Listed }) {
  const { lang, dir, idx } = useApp();
  const pd = pagesDicts[lang];
  const sec = pd.sections;
  const specialty = base.specialtyId ? idx.specialtyById.get(base.specialtyId) : undefined;
  const city = base.cityId && !base.video ? idx.cityById.get(base.cityId) : undefined;
  const cityLabel = cityName(city, lang);
  const place = base.video || !city ? pd.kosovo : cityLabel;

  // FAQ, only on specialty pages.
  let faq: { q: string; a: string }[] = [];
  if (specialty) {
    const info = specialtyInfo[specialty.id];
    const prices = matching.map((p) => p.price_eur).filter((n): n is number => n !== null);
    faq = pd.specialtyFaq({
      specialtyId: specialty.id,
      nameSq: specialty.name_sq,
      nameEn: specialty.name_en,
      place,
      total: matching.length,
      saturday: matching.filter((p) => p.open_saturday).length,
      video: matching.filter((p) => p.offers_video).length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      about: info?.about[lang] ?? "",
      focus: info?.focus[lang] ?? [],
    });
  }

  // Expertises: the specialty's own on its pages, all services elsewhere.
  const expertiseLabels = specialty
    ? [
        ...expertise.filter((e) => e.specialtyId === specialty.id).map((e) => e[lang]),
        ...(specialtyInfo[specialty.id]?.focus[lang] ?? []),
      ]
    : expertise.map((e) => e[lang]);
  const expertiseItems: LinkItem[] = Array.from(new Set(expertiseLabels)).map((label) => ({
    key: label,
    label,
    href: searchPageHref({ q: label, cityId: base.video ? undefined : base.cityId }),
  }));

  const otherSpecialties: LinkItem[] = dir.specialties
    .filter((s) => s.id !== specialty?.id)
    .map((s) => ({ key: s.id, label: specialtyName(s, lang), href: specialtyHref(s.id) }));

  // Cities that actually have someone for this search (bookable, or listed for the specialty).
  const cityCounts = new Map<string, number>(base.video ? [] : Object.entries(listed.byCity));
  for (const p of dir.practitioners) {
    if (specialty && p.specialty_id !== specialty.id) continue;
    if (base.video && !p.offers_video) continue;
    const c = idx.clinicById.get(p.clinic_id)?.city_id;
    if (c) cityCounts.set(c, (cityCounts.get(c) ?? 0) + 1);
  }
  // A specialty page without a city lists every municipality right below the results instead.
  const related: LinkItem[] = dir.cities
    .filter((c) => cityCounts.has(c.id) && c.id !== city?.id && !(specialty && !city && !base.video))
    .map((c) =>
      specialty
        ? {
            key: c.id,
            label: sec.inCity(specialtyName(specialty, lang), cityName(c, lang)),
            href: specialtyHref(specialty.id, c.id),
          }
        : {
            key: c.id,
            label: sec.inCity(lang === "sq" ? "Mjekë" : "Doctors", cityName(c, lang)),
            href: searchPageHref({ cityId: c.id }),
          },
    );

  // On a city page: the other specialties available in the same city (bookable or listed).
  const sameCity: LinkItem[] = city
    ? dir.specialties
        .filter(
          (s) =>
            s.id !== specialty?.id &&
            (Boolean(listed.bySpecialty[s.id]) ||
              dir.practitioners.some((p) => p.specialty_id === s.id && idx.clinicById.get(p.clinic_id)?.city_id === city.id)),
        )
        .map((s) => ({ key: s.id, label: sec.inCity(specialtyName(s, lang), cityLabel), href: specialtyHref(s.id, city.id) }))
    : [];

  const popular: LinkItem[] = popularSpecialtyCities.flatMap(([sid, cid]) => {
    const s = idx.specialtyById.get(sid);
    const c = idx.cityById.get(cid);
    if (!s || !c || (sid === specialty?.id && cid === city?.id)) return [];
    return [{ key: `${sid}-${cid}`, label: sec.inCity(specialtyName(s, lang), cityName(c, lang)), href: specialtyHref(sid, cid) }];
  });

  return (
    <div className="listing-more">
      <div className="container">
        {faq.length > 0 && (
          <section className="lfaq" aria-labelledby="lfaq-title">
            <h2 id="lfaq-title" className="lblock-title">
              {sec.faq}
            </h2>
            <div className="faq">
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <PlusIcon width={20} height={20} />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="lblocks">
          <LinkBlock
            title={sec.expertise}
            items={expertiseItems}
            more={{ key: "all", label: sec.allExpertise, href: `${paths.specialties}#sherbimet` }}
          />
          <LinkBlock
            title={sec.otherSpecialty}
            items={otherSpecialties}
            more={{ key: "all", label: sec.allSpecialties, href: paths.specialties }}
          />
          {city && <LinkBlock title={sec.otherInCity(cityLabel)} items={sameCity} />}
          <LinkBlock title={sec.related} items={related} />
          <LinkBlock title={sec.popular} items={popular} />
        </div>
      </div>
    </div>
  );
}
