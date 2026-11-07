"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getStaffArticles, STAFF_AREAS, type StaffArea } from "@/lib/staff-knowledge";

export function StaffHub({ area }: { area?: StaffArea }) {
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("vedoy-staff-articles-v1") || "{}");
      if (Array.isArray(raw.completed)) setCompleted(raw.completed.filter((value: unknown) => typeof value === "string"));
    } catch { /* private-browsing storage is optional */ }
  }, []);
  const articles = useMemo(() => getStaffArticles(area).filter((article) => {
    const haystack = [article.title, article.intro, article.category, STAFF_AREAS[article.area].name, ...article.sections.map((section) => section.title)].join(" ").toLocaleLowerCase("nb-NO");
    return haystack.includes(search.trim().toLocaleLowerCase("nb-NO"));
  }), [area, search]);
  const category = area ? STAFF_AREAS[area] : null;
  const total = getStaffArticles(area).length;
  const done = getStaffArticles(area).filter((article) => completed.includes(article.slug)).length;

  return (
    <div className="staff-portal staff-hub">
      <div className="staff-breadcrumbs"><Link href="/studio">Studio</Link><span>/</span>{area ? <><Link href="/studio/staff">Ansattportal</Link><span>/</span><strong>{category?.short}</strong></> : <strong>Ansattportal</strong>}</div>
      <header className={`staff-hero ${area ? `staff-hero--${area}` : ""}`}>
        <div className="staff-hero__text">
          <div className="staff-overline">{category?.kicker ?? "VEDØY · INTERN LÆRINGSPLATTFORM"}</div>
          <h1>{category?.title ?? <>Lær. Test. <em>Lever bedre.</em></>}</h1>
          <p>{category?.subtitle ?? "Ett arbeidsområde for ansatte – praktiske artikler, interaktive kalkulatorer, sjekklister og simuleringer for Studio, Link og PBX."}</p>
          <div className="staff-hero__chips"><span>Kun for autorisert team</span><span>{total} fagartikler</span><span>Interaktive øvelser</span></div>
        </div>
        <div className="staff-hero__graphic" aria-hidden="true"><span className="staff-graphic__orbit">VØ</span><span>INTERNAL<br/>KNOWLEDGE<br/>SYSTEM / 01</span></div>
      </header>
      {!area && <section className="staff-section" aria-label="Velg produktportal">
        <div className="staff-section-heading"><div><span className="staff-overline">01 / ARBEIDSOMRÅDER</span><h2>Velg avdeling</h2></div><span>Tre portaler. Ett system.</span></div>
        <div className="staff-area-grid">
          {(["studio", "link", "pbx"] as const).map((item) => {const meta = STAFF_AREAS[item]; return <Link href={`/studio/staff/${item}`} className={`staff-area-card staff-area-card--${item}`} key={item}>
            <div className="staff-area-card__top"><span className="staff-area-card__icon">{meta.emoji}</span><span>0{item === "studio" ? 1 : item === "link" ? 2 : 3} / {getStaffArticles(item).length} artikler</span></div>
            <h3>{meta.name}</h3><p>{meta.subtitle}</p><div className="staff-area-card__footer"><span>{meta.focus.join(" · ")}</span><span aria-hidden="true">↗</span></div>
          </Link>})}
        </div>
      </section>}
      <section className="staff-section" aria-labelledby="staff-articles-heading">
        <div className="staff-section-heading"><div><span className="staff-overline">{area ? "02" : "02"} / BIBLIOTEK</span><h2 id="staff-articles-heading">{area ? "Fagartikler og øvelser" : "Utforsk kunnskapsbiblioteket"}</h2></div><span>{done} av {total} fullført på denne enheten</span></div>
        <div className="staff-list-toolbar"><label htmlFor="staff-search">Søk i artikler</label><div className="staff-search-field"><span aria-hidden="true">⌕</span><input id="staff-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Søk på tema, verktøy eller produkt …" /></div><span aria-live="polite">{articles.length} treff</span></div>
        <div className="staff-article-grid">
          {articles.map((article) => <Link href={`/studio/staff/${article.area}/${article.slug}`} key={article.slug} className="staff-article-tile">
            <div className="staff-article-tile__top"><span>{STAFF_AREAS[article.area].name} / {article.category}</span><span className="staff-status-dot">{completed.includes(article.slug) ? "✓ Lest" : article.badge}</span></div>
            <h3>{article.title}</h3><p>{article.intro}</p><div className="staff-article-tile__bottom"><span>◷ {article.minutes} min · Oppdatert {new Intl.DateTimeFormat("nb-NO", {day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${article.updated}T12:00:00Z`))}</span><span aria-hidden="true">→</span></div>
          </Link>)}
        </div>
        {articles.length === 0 && <div className="staff-empty">Ingen artikler matcher søket. Prøv et annet ord.</div>}
      </section>
      <div className="staff-disclaimer">Interne opplæringsartikler og simulatorer. Eksempeltall er antakelser, ikke kundedata, regnskapsresultater eller faktiske operatørpriser. Lesestatus lagres bare lokalt i nettleseren.</div>
    </div>
  );
}
