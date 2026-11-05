import Link from "next/link";
import styles from "./demo-showcase.module.css";

const bankFeatures = [
  "Valutakontoer i NOK, EUR og flere valutaer",
  "Tilpassbare kort og forbruksgrenser",
  "Vedoy Coins, lojalitet og belønninger",
  "Kursvarsler og simulert valutaveksling",
];

/**
 * Portfolio showcase: Vedoy Bank is a simulated product demo, not a licensed bank.
 * Add additional demo cards here as new prototypes are ready.
 */
export function DemoShowcase() {
  return (
    <section id="demoer" className={styles.section} aria-labelledby="demoer-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div>
            <p className={styles.kicker}>VEDØY LAB · INTERAKTIVE DEMOER</p>
            <h2 id="demoer-heading">Ikke bare idéer.<br /><em>Prøv det vi bygger.</em></h2>
          </div>
          <p>
            Se hvordan en digital løsning kan se ut og fungere før du bestiller.
            Dette er våre egne prototyper, ikke kundeprosjekter eller ferdige banktjenester.
          </p>
        </div>
        <article className={styles.card}>
          <div className={styles.copy}>
            <div className={styles.meta}>
              <span className={styles.live}><span aria-hidden="true" /> TESTBAR DEMO</span>
              <span>FINTECH · NEXT.JS</span>
            </div>
            <div className={styles.madeBy} aria-label="Utviklet av Vedøy Studio">
              <img src="/brand/vedoy-logo-white.svg" alt="Vedøy" width={120} height={50} />
              <div><strong>Utviklet av Vedøy Studio</strong><span>Vedøy Lab · Haugesund, Norge</span></div>
            </div>
            <p className={styles.projectEyebrow}>01 / UTVALGT PROTOTYPE</p>
            <h3>Vedoy <em>Bank.</em></h3>
            <p className={styles.lead}>
              Et eksklusivt bankapp-konsept med flervaluta, kortdesigner, budsjett, statistikk
              og Vedoy Coins. Utforsk grensesnittet med fiktive kontoer og transaksjoner.
            </p>
            <ul className={styles.features}>
              {bankFeatures.map((feature) => <li key={feature}><span aria-hidden="true">↗</span>{feature}</li>)}
            </ul>
            <div className={styles.actions}>
              <a href="https://vedoy-bank.vercel.app/" target="_blank" rel="noopener noreferrer" className={styles.primary}>
                Sjekk ut demoen <span aria-hidden="true">↗</span>
              </a>
              <Link href="/?need=Webapp&source=bank-demo#kontakt" className={styles.secondary}>
                Få tilbud på en lignende app
              </Link>
            </div>
            <p className={styles.disclaimer}>
              Kun demonstrasjon: Ingen ekte kontoer, betalingskort, sparerente eller pengeoverføringer.
              Alle beløp og valutavekslinger er simulert.
            </p>
          </div>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.appHeader}>
              <img src="/brand/vedoy-logo-white.svg" alt="" className={styles.previewLogo} width={110} height={46} />
              <span className={styles.bankWordmark}>BANK</span>
              <span className={styles.demoTag}>DEMO</span>
            </div>
            <p className={styles.balanceLabel}>TOTAL OVERSIKT</p>
            <p className={styles.balance}>49 680<span>,00 NOK</span></p>
            <div className={styles.bankCard}>
              <div className={styles.cardTop}><span>VEDOY</span><span>SIGNATURE</span></div>
              <div className={styles.chip} />
              <div className={styles.cardBottom}><span>SIMULERT KORT</span><strong>•••• 0000</strong></div>
            </div>
            <div className={styles.accountList}>
              <div><span className={styles.flag}>🇳🇴</span><span><b>NOK</b><small>Norske kroner</small></span><strong>35 920,00 kr</strong></div>
              <div><span className={styles.flag}>🇪🇺</span><span><b>EUR</b><small>Euro</small></span><strong>€ 1 240,00</strong></div>
              <div><span className={styles.flag}>🇺🇸</span><span><b>USD</b><small>Amerikanske dollar</small></span><strong>$ 320,00</strong></div>
            </div>
            <div className={styles.rewards}><span>✦ VEDOY COINS</span><strong>+100 / måned</strong></div>
            <p className={styles.previewCredit}>ET KONSEPT AV VEDØY STUDIO · DEMO</p>
          </div>
        </article>
        <p className={styles.more}>Flere demoer kommer etter hvert. <Link href="/#prosjekter">Se publiserte prosjekter <span aria-hidden="true">↗</span></Link></p>
      </div>
    </section>
  );
}
