import { activeSponsors } from "@/lib/news-community";
import styles from "./news-experience.module.css";
export async function NewsSponsors({placement}:{placement:"index"|"article"}){
  const ads=await activeSponsors(placement).catch(()=>[]);
  if(!ads.length)return null;
  return <aside className={styles.sponsors} aria-label="Annonser">
    {ads.map(ad=><a key={ad.id} href={ad.destinationUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className={styles.sponsorCard}>
      <span className={styles.sponsorLabel}>ANNONSE · {ad.sponsor}</span>
      <strong>{ad.headline}</strong>
      <p>{ad.body}</p><span className={styles.sponsorAction}>Besøk annonsør ↗</span>
    </a>)}
  </aside>;
}
