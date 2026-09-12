"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function AnimatedStats({ projects, services }: { projects: number; services: number }) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !window.IntersectionObserver) return;
    setProgress(0);
    let frame = 0;
    let started = false;
    const finish = () => { cancelAnimationFrame(frame); setProgress(1); };
    const observer = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      const start = performance.now();
      function tick(now: number) {
        const elapsed = Math.min((now - start) / 1600, 1);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    if (ref.current) observer.observe(ref.current);
    reduced.addEventListener("change", finish);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); reduced.removeEventListener("change", finish); };
  }, [projects, services]);

  return <section ref={ref} className="studio-stats" aria-labelledby="studio-stats-title">
    <div className="studio-stats__intro"><p className="editorial-kicker lime">{t("eyebrow")}</p><h2 id="studio-stats-title">{t("title")}<br /><em>{t("emphasis")}</em></h2><p>{t("description")}</p></div>
    <dl className="studio-stats__numbers">
      {([{ key: "projects", value: projects, href: "/#prosjekter" }, { key: "services", value: services, href: "/#tjenester" }] as const).map(stat => <div key={stat.key} className={`studio-stat studio-stat--${stat.key}`}>
        <dt>{t(stat.key)}</dt>
        <dd aria-label={new Intl.NumberFormat(locale).format(stat.value)}><span aria-hidden="true">{new Intl.NumberFormat(locale).format(Math.round(stat.value * progress))}</span><span className="studio-stat__dot" aria-hidden="true">.</span></dd>
        <p>{t(`${stat.key}Note`)}</p><Link href={stat.href}>{t(`${stat.key}Link`)} <span aria-hidden="true">↗</span></Link>
      </div>)}
    </dl>
  </section>;
}
