"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fullDate } from "@/lib/format";
import { pagesDicts } from "@/lib/pagesText";
import { accountHref } from "@/lib/routes";
import { cityName } from "@/lib/search";
import { clinicTypes } from "@/lib/taxonomy";
import type { City, ListedPractice, Specialty } from "@/lib/types";
import { useApp } from "../AppContext";
import { BuildingIcon, PhoneIcon, PinIcon } from "../Icons";
import { ExternalIcon } from "../IconsExtra";

const FIRST = 12;

/** The exact point when it's mapped, otherwise a search for the name in the city. */
function mapHref(p: ListedPractice, city: string) {
  if (p.lat != null && p.lng != null) return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}`;
  const q = [p.name, p.address, city, "Kosovo"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Real practices for this specialty in this city that aren't on Mjeku.Im yet: phone, address and map, no booking. */
export function ListedPractices({ practices, specialty, city }: { practices: ListedPractice[]; specialty: Specialty; city: City }) {
  const { lang } = useApp();
  const l = pagesDicts[lang].listed;
  const place = cityName(city, lang);
  const [area, setArea] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Neighbourhoods and villages with at least one practice, the busiest first.
  const areas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of practices) if (p.neighborhood) counts.set(p.neighborhood, (counts.get(p.neighborhood) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sq"));
  }, [practices]);

  const shown = area ? practices.filter((p) => p.neighborhood === area) : practices;
  const visible = showAll ? shown : shown.slice(0, FIRST);
  const checked = practices.reduce((max, p) => (p.checked_on > max ? p.checked_on : max), "");
  const name = lang === "sq" ? specialty.name_sq : specialty.name_en;

  return (
    <section className="listed" id="te-tjere" aria-labelledby="listed-title">
      <h2 id="listed-title" className="lblock-title">
        {l.title(place)}
      </h2>
      <p className="muted listed-lede">{l.lede(practices.length, specialty.id, name, place)}</p>

      {areas.length > 1 && practices.length > 6 && (
        <div className="chips listed-areas" role="group" aria-label={l.area}>
          <button type="button" className="chip" aria-pressed={area === ""} onClick={() => setArea("")}>
            {l.allAreas} ({practices.length})
          </button>
          {areas.map(([a, n]) => (
            <button key={a} type="button" className="chip" aria-pressed={area === a} onClick={() => setArea(a)}>
              {a} ({n})
            </button>
          ))}
        </div>
      )}

      <ul className="llist">
        {visible.map((p) => {
          const where = [p.address, p.neighborhood, place].filter(Boolean).join(", ");
          return (
            <li key={p.id} className="lcard">
              <span className="avatar lcard-avatar" aria-hidden="true">
                <BuildingIcon width={22} height={22} />
              </span>
              <div className="lcard-main">
                <h3 className="lcard-name">{p.name}</h3>
                <p className="lcard-kind">
                  {clinicTypes[p.kind]?.[lang] ?? ""}
                  {p.sector === "public" && <span className="badge">{l.public}</span>}
                </p>
                <p className="rcard-where">
                  <PinIcon width={16} height={16} />
                  <span>{where}</span>
                </p>
                <div className="lcard-actions">
                  {p.phone ? (
                    <a className="btn btn-outline btn-sm" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>
                      <PhoneIcon width={16} height={16} />
                      {p.phone}
                    </a>
                  ) : (
                    <span className="small muted">{l.noPhone}</span>
                  )}
                  <a className="link" href={mapHref(p, place)} target="_blank" rel="noopener noreferrer">
                    {l.map}
                    <ExternalIcon width={15} height={15} />
                  </a>
                  {p.website && (
                    <a className="link" href={p.website} target="_blank" rel="noopener noreferrer nofollow">
                      {l.website}
                      <ExternalIcon width={15} height={15} />
                    </a>
                  )}
                </div>
                <Link className="lcard-claim" href={accountHref(p.id)}>
                  {l.claim}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {!showAll && shown.length > FIRST && (
        <div className="more-row">
          <button type="button" className="btn btn-outline" onClick={() => setShowAll(true)}>
            {l.showAll(shown.length)}
          </button>
        </div>
      )}

      <div className="listed-owner">
        <div>
          <b>{l.ownerTitle}</b>
          <p className="muted">{l.ownerText}</p>
        </div>
        <Link className="btn btn-ink btn-sm" href={accountHref()}>
          {l.ownerCta}
        </Link>
      </div>
      {checked && <p className="small muted listed-source">{l.source(fullDate(checked, lang))}</p>}
    </section>
  );
}
