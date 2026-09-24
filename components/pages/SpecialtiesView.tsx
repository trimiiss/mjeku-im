"use client";

import Link from "next/link";
import { useMemo } from "react";
import { pagesDicts } from "@/lib/pagesText";
import { specialtyInfo } from "@/lib/profileText";
import { paths, searchPageHref, specialtyHref } from "@/lib/routes";
import { cityName, norm, specialtyName } from "@/lib/search";
import { clinicTypes, expertise } from "@/lib/taxonomy";
import { useApp } from "../AppContext";
import { ChevronRightIcon, StethoscopeIcon } from "../Icons";
import { FlaskIcon } from "../IconsExtra";

/** /specialitetet: every specialty with its cities, then all services, institution types and cities. */
export function SpecialtiesView() {
  const { lang, dir, idx } = useApp();
  const pd = pagesDicts[lang];
  const sp = pd.specialtiesPage;

  const cards = useMemo(
    () =>
      dir.specialties.map((s) => {
        const people = dir.practitioners.filter((p) => p.specialty_id === s.id);
        const cityIds = new Set(people.map((p) => idx.clinicById.get(p.clinic_id)?.city_id).filter(Boolean) as string[]);
        return { s, count: people.length, cities: dir.cities.filter((c) => cityIds.has(c.id)) };
      }),
    [dir, idx],
  );

  const services = useMemo(() => {
    const labels = new Set<string>();
    for (const e of expertise) labels.add(e[lang]);
    for (const info of Object.values(specialtyInfo)) for (const f of info.focus[lang]) labels.add(f);
    // Plain comparison (not localeCompare) so the server and every browser sort the same way.
    const key = (x: string) => norm(x);
    return Array.from(labels).sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  }, [lang]);

  const types = Array.from(new Set(dir.clinics.map((c) => c.type)));
  const citiesWithDoctors = dir.cities.filter((c) =>
    dir.practitioners.some((p) => idx.clinicById.get(p.clinic_id)?.city_id === c.id),
  );

  return (
    <div className="listing">
      <div className="profile-top listing-top">
        <div className="container">
          <nav className="crumbs" aria-label={lang === "sq" ? "Vendndodhja në faqe" : "Breadcrumb"}>
            <ol>
              <li>
                <Link href={paths.home}>Mjeku.Im</Link>
              </li>
              <li aria-current="page">{sp.title}</li>
            </ol>
          </nav>
          <h1 className="listing-title">{sp.title}</h1>
          <p className="lede">{sp.lede}</p>
        </div>
      </div>

      <div className="container listing-body">
        <ul className="spec-grid">
          {cards.map(({ s, count, cities }) => (
            <li key={s.id} className="spec-card">
              <Link className="spec-link" href={specialtyHref(s.id)}>
                <span className="spec-ico" aria-hidden="true">
                  {s.id === "lab" ? <FlaskIcon width={22} height={22} /> : <StethoscopeIcon width={22} height={22} />}
                </span>
                <span className="spec-text">
                  <b>{specialtyName(s, lang)}</b>
                  <small>
                    {sp.count(count)} · {sp.cities(cities.length)}
                  </small>
                </span>
                <ChevronRightIcon width={20} height={20} />
              </Link>
              {cities.length > 0 && (
                <ul className="spec-cities">
                  {cities.map((c) => (
                    <li key={c.id}>
                      <Link href={specialtyHref(s.id, c.id)}>{cityName(c, lang)}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <section className="lblock lblock--wide" id="sherbimet" aria-labelledby="services-title">
          <h2 id="services-title" className="lblock-title">
            {sp.services}
          </h2>
          <ul className="lblock-list lblock-list--cols">
            {services.map((label) => (
              <li key={label}>
                <Link href={searchPageHref({ q: label })}>{label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="lblocks">
          <section className="lblock" id="institucionet" aria-labelledby="types-title">
            <h2 id="types-title" className="lblock-title">
              {sp.institutions}
            </h2>
            <ul className="lblock-list">
              {types.map((type) => (
                <li key={type}>
                  <Link href={searchPageHref({ type })}>{clinicTypes[type]?.[lang] ?? type}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="lblock" aria-labelledby="cities-title">
            <h2 id="cities-title" className="lblock-title">
              {sp.cityTitle}
            </h2>
            <ul className="lblock-list">
              {citiesWithDoctors.map((c) => (
                <li key={c.id}>
                  <Link href={searchPageHref({ cityId: c.id })}>{pd.sections.inCity(lang === "sq" ? "Mjekë" : "Doctors", cityName(c, lang))}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
