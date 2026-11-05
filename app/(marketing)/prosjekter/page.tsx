import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { cloudSession } from "@/lib/vedoy-cloud";
import { VedoyCloudWorkspace } from "@/components/cloud/vedoy-cloud-workspace";
import styles from "@/components/cloud/vedoy-cloud.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Prosjekter og Vedoy Cloud",
  description: "Samle prosjekter, koble offentlige GitHub-repositorier og lagre filer privat i Vedoy Cloud."
};

export default async function ProsjekterPage() {
  const user = await cloudSession();
  return <main className={styles.page}>
    <MarketingHeader variant="public" />
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}><Link href="/">Vedøy Studio</Link><span>/</span><span>Prosjekter</span></div>
      <div className={styles.hero}>
        <div><p className={styles.kicker}>VEDOY STUDIO / PROSJEKTER</p><h1>Samle arbeidet.<br/><em>Bygg videre.</em></h1>
          <p className={styles.lead}>Opprett et prosjekt, koble til et offentlig GitHub-repositorium eller last opp filer til din private Vedoy Cloud.</p>
          <div className={styles.heroTags}><span>◈ Prosjektbibliotek</span><span>⌁ GitHub</span><span>◫ Privat skylagring</span></div>
        </div>
        <div className={styles.heroPanel}><span className={styles.heroPanelTop}>VEDOY CLOUD · BETA</span><strong>Din arbeidsplass.<br/>Dine filer.</strong><p>Filer holdes adskilt per Vedøy-konto. Lagring er foreløpig i Supabases Stockholm-region, ikke på norsk server.</p><span className={styles.limit}>10 MB per fil · 100 MB per konto</span></div>
      </div>
      {user ? <VedoyCloudWorkspace name={user.name} /> :
        <section className={styles.gate}><div><p className={styles.kicker}>KOM I GANG</p><h2>Alt samlet i én prosjektoversikt.</h2><p>Logg inn med Vedøy Login for å opprette prosjekter, se dine filer og ta vare på arbeid du vil videreutvikle.</p></div>
          <Link className={styles.primary} href="/login?next=/prosjekter">Fortsett med Vedøy Login ↗</Link></section>}
      <section className={styles.explain}><article><span>01</span><h3>Opprett et prosjekt</h3><p>Start med et navn. Du kan samle design, kode og dokumenter etter hvert.</p></article><article><span>02</span><h3>Koble til GitHub</h3><p>Registrer et offentlig repository på prosjektet. Privat repo-import kommer senere med samtykke.</p></article><article><span>03</span><h3>Last opp en mappe</h3><p>Behold mappestrukturen. Opplastinger er private og må være innenfor beta-grensene.</p></article></section>
      <p className={styles.finePrint}>Beta: Dette er fil- og prosjektlagring, ikke automatisk hosting eller Git-synkronisering. Sikkerhetskopi, databehandleravtale og betalte planer må ferdigstilles før bred kommersiell lansering.</p>
    </div>
  </main>;
}
