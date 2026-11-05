import Link from "next/link";
import { listPublishedPrices, money, type CatalogPrice } from "@/lib/vedoy-catalog";
import styles from "./bulk-packages.module.css";

const packNumber = (plan: CatalogPrice) => {
  const match = /^collective-(\d+)$/.exec(plan.code);
  return match ? Number(match[1]) : null;
};

export async function CollectiveBulkPackages() {
  let plans: CatalogPrice[] = [];
  try {
    plans = (await listPublishedPrices("collective"))
      .filter(p => p.billingPeriod === "one_time" && packNumber(p) !== null)
      .sort((a, b) => (packNumber(a) || 0) - (packNumber(b) || 0));
  } catch (error) {
    console.error("Collective packages unavailable", error instanceof Error ? error.message : "unknown");
  }
  return (
    <section className={styles.section} id="profilpakker" aria-labelledby="collective-packages-heading">
      <div className={styles.heading}>
        <div>
          <p className={styles.kicker}>VEDØY PRICING · BEDRIFT</p>
          <h2 id="collective-packages-heading">Små og store <em>profilpakker.</em></h2>
        </div>
        <p>Velg 5, 10, 15, 20, 30, 40 eller flere plagg. Hele utvalget hos Vedoy Collective kan vurderes for egen logo. Du kan kombinere produkter og størrelser i en forespørsel.</p>
      </div>
      {plans.length ? <div className={styles.grid}>
        {plans.map(plan => {
          const count = packNumber(plan)!;
          return <article key={plan.code} className={count === 10 ? styles.featured : styles.card}>
            <div className={styles.top}><span>{count} plagg</span>{count === 10 ? <b>POPULÆRT VALG</b> : null}</div>
            <h3>{plan.title}</h3>
            <strong>{money(plan.amountOre)} <small>fra*</small></strong>
            <p>{money(Math.round(plan.amountOre / count))} per plagg i regneeksempelet</p>
            <ul>{plan.features.slice(0,3).map(feature=><li key={feature}>✓ {feature}</li>)}</ul>
            <a href="#bestill-profilprodukter" className={styles.action}>Be om fast tilbud <span aria-hidden>↗</span></a>
          </article>;
        })}
      </div> : <p className={styles.unavailable}>Gjeldende pakkepriser er midlertidig utilgjengelige. Du kan fortsatt be om et uforpliktende tilbud.</p>}
      <div className={styles.disclaimer}>
        <strong>* Illustrasjon, ikke totalpris med logo.</strong>
        <p>Fra-prisene er regnet ut med en basis-T-skjorte til 200 kr i Vedoy Collective og gjelder kun plaggene i dette eksempelet. Logotrykk eller broderi, eventuelt oppsett, frakt og MVA avklares i et individuelt tilbud. Andre produkter i katalogen har andre priser. Ingen produksjon eller betaling skjer før du godkjenner et konkret tilbud.</p>
        <Link href="https://vedoycollective.com/collections/all" target="_blank" rel="noopener noreferrer">Se hele Collective-katalogen ↗</Link>
      </div>
    </section>
  );
}
