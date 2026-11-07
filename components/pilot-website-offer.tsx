import Link from "next/link";
import styles from "./pilot-website-offer.module.css";

export function PilotWebsiteOffer() {
  return (
    <section className={styles.offer} aria-labelledby="pilot-website-heading">
      <div className={styles.inner}>
        <div>
          <p className={styles.kicker}>Vedøy Studio · Pilotkundetilbud</p>
          <h2 className={styles.title} id="pilot-website-heading">
            Bli pilotkunde. <em>Få 50 % rabatt på nettsideutviklingen.</em>
          </h2>
          <p className={styles.description}>
            Vi søker våre første pilotkunder. Du får en moderne, mobilvennlig nettside
            til halv ordinær pris for avtalt utviklings- og oppstartsarbeid.
            Til gjengjeld ønsker vi ærlige tilbakemeldinger underveis.
          </p>
          <div className={styles.actions}>
            <Link
              href="/?need=Nettside&source=pilotkunde-nettside-50#kontakt"
              className={styles.primary}
            >
              Be om pilotkundetilbud <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/tjenester/nettsider" className={styles.secondary}>
              Se nettsidetjenesten
            </Link>
          </div>
        </div>
        <div className={styles.priceCard} aria-label="50 prosent rabatt på oppstart og utvikling av nettside">
          <span className={styles.percent}>−50 %</span>
          <p className={styles.priceLabel}>På utvikling og oppstart av en ny nettside</p>
          <p className={styles.priceSmall}>
            Rabatten gjelder engangsarbeidet, ikke løpende abonnement, hosting,
            domene, lisenser eller eksterne tjenestekostnader.
          </p>
        </div>
      </div>
      <p className={styles.note}>
        Tilbudet gjelder avtalte pilotprosjekter. Du får skriftlig spesifikasjon av
        ordinærpris, rabatt, leveranse og eventuell MVA før oppstart. Ingen forpliktelse
        ved forespørsel. Bruk av prosjektet som offentlig referanse krever separat samtykke.
      </p>
    </section>
  );
}
