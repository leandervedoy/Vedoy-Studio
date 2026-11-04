import Link from "next/link";
import styles from "./in-progress-projects.module.css";

export function InProgressProjects() {
  return (
    <div className={styles.section} aria-labelledby="projects-in-progress-heading">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>VEDØY STUDIO / PÅ TEGNEBRETTET</p>
          <h3 id="projects-in-progress-heading">Prosjekter under arbeid<span>.</span></h3>
        </div>
        <p>Her deler vi nye løsninger vi ønsker å utvikle. Disse er ikke tilgjengelige for bestilling ennå.</p>
      </div>
      <Link href="/projects/deliver" className={styles.card}>
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={styles.tag}>PLANLAGT · INTEGRASJONER UTREDES</span>
            <span className={styles.number}>01 / LOKAL LEVERING</span>
          </div>
          <h4>Vedoy <em>Deliver.</em></h4>
          <p>Vi utvikler konseptet for en leveringsplattform der butikker og serveringssteder kan tilby lokal hjemlevering fra egne nettsider og apper – uten å administrere egne bud.</p>
          <ul aria-label="Planlagte funksjoner">
            <li>Bestillinger og ordreoversikt</li>
            <li>Integrasjon mot nettbutikker</li>
            <li>Leveringspris og sporing</li>
          </ul>
          <p className={styles.partner}>Vi har meldt interesse for Wolt Drive som mulig leveringspartner. API-tilgang, avtale og dekning er ikke bekreftet.</p>
          <span className={styles.action}>Les om prosjektet <span aria-hidden="true">↗</span></span>
        </div>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.routeLabel}>BUTIKK <span>→</span> KUNDE</div>
          <svg viewBox="0 0 210 164" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34 117 C56 117 49 42 104 65 C148 84 153 46 177 46" stroke="#CEF68D" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round" />
            <rect x="13" y="98" width="44" height="44" rx="12" fill="#CEF68D" />
            <path d="M24 115H46M27 115V130H43V115M29 108H41L45 115H25L29 108Z" stroke="#1B2920" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="177" cy="46" r="22" fill="#CEF68D" />
            <path d="M163 46L177 35L191 46M168 43V58H186V43M175 58V48H181V58" stroke="#1B2920" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="105" cy="65" r="7" fill="#CEF68D" />
            <circle cx="105" cy="65" r="13" stroke="#CEF68D" strokeOpacity=".45" strokeWidth="1.5" />
          </svg>
          <div className={styles.routeFooter}><span>BESTILLING</span><span>HENTING</span><span>LEVERING</span></div>
        </div>
      </Link>
    </div>
  );
}
