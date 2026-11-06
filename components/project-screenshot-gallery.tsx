import Link from "next/link";
import type { StudioScreenshot } from "@/lib/project-screenshots";
import styles from "./project-screenshot-gallery.module.css";

type Props = {
  title: string;
  intro: string;
  items: readonly StudioScreenshot[];
  eyebrow?: string;
  light?: boolean;
  compact?: boolean;
};

function ItemLink({href, children, label}: {href?: string; children: React.ReactNode; label: string}) {
  if (!href) return <span className={styles.imageLink}>{children}</span>;
  if (href.startsWith("https://")) {
    return <a className={styles.imageLink} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{children}</a>;
  }
  return <Link className={styles.imageLink} href={href} aria-label={label}>{children}</Link>;
}

export function ProjectScreenshotGallery({title,intro,items,eyebrow="VEDØY LAB · SKJERMBILDER",light=false,compact=false}: Props) {
  if (!items.length) return null;
  return (
    <section aria-label={title} className={[styles.gallery,light?styles.light:"",compact?styles.compact:""].filter(Boolean).join(" ")}>
      <div className={styles.head}>
        <div><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2></div>
        <p>{intro}</p>
      </div>
      <div className={styles.track} aria-label="Prosjekteksempler">
        {items.map((item) => (
          <figure className={styles.card} key={item.src}>
            <ItemLink href={item.href} label={`Utforsk ${item.project}`}>
              <div className={styles.screen}>
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              </div>
            </ItemLink>
            <figcaption className={styles.caption}>
              <span className={styles.status}>{item.status}</span>
              <h3>{item.project}</h3>
              <p>{item.caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={styles.note}>Egne prototyper og demonstrasjoner fra Vedøy. Skjermbildene viser utviklingsstatus og er ikke kundeuttalelser.</p>
    </section>
  );
}
