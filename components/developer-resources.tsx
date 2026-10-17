import styles from "./developer-resources.module.css";

const resources = [
  {
    number: "01",
    title: "Vedøy Developer Portal",
    text: "Utforsk dokumentasjon, API-er og kodeeksempler. Finn ressursene du trenger for å bygge integrasjoner med Vedøy.",
    href: "https://vedoy-dev-portal.vercel.app/",
    action: "Åpne Developer Portal",
  },
  {
    number: "02",
    title: "Vedøy Hub",
    text: "Få oversikt over Vedøy-universet. Finn produkter, prosjekter og verktøy, og gå videre til det du vil utforske.",
    href: "https://vedoy-portfolio.vercel.app/",
    action: "Utforsk Vedøy Hub",
  },
  {
    number: "03",
    title: "Developer Handbook",
    text: "Ta med deg utviklerhåndboken som PDF. Åpne den i nettleseren eller last ned en kopi du kan ha tilgjengelig mens du bygger.",
    href: "/downloads/vedoy-developer-handbook.pdf",
    action: "Åpne håndboken",
    download: true,
  },
];

export function DeveloperResources() {
  return (
    <section className={styles.section} id="utviklere" aria-labelledby="developer-resources-title">
      <div className={styles.heading}>
        <div>
          <p className="editorial-kicker lime">FOR UTVIKLERE OG NYSGJERRIGE</p>
          <h2 id="developer-resources-title">Bygg videre.<br /><em>Med Vedøy.</em></h2>
        </div>
        <p>Fra oversikt til dokumentasjon. Utforsk Developer Portal og Hub, eller ta med deg håndboken til ditt neste prosjekt.</p>
      </div>
      <div className={styles.grid}>
        {resources.map((resource) => (
          <article className={styles.card} key={resource.number}>
            <span className={styles.number}>{resource.number} / {resource.download ? "PDF · 127 KB" : "UTFORSK"}</span>
            <h3>{resource.title}</h3>
            <p>{resource.text}</p>
            <div className={styles.links}>
              <a href={resource.href}>{resource.action} <span aria-hidden="true">↗</span></a>
              {resource.download && <a href={resource.href} download="vedoy-developer-handbook.pdf">Last ned PDF <span aria-hidden="true">↓</span></a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
