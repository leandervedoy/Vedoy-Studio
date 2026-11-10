import type { Metadata } from "next";
import Link from "next/link";
import { DeliverSavingsCalculator, DeliverChannelPicker } from "@/components/projects/vedoy-deliver-tools";
import styles from "@/components/projects/vedoy-deliver.module.css";
import { ProjectScreenshotGallery } from "@/components/project-screenshot-gallery";
import { DELIVER_SCREENSHOTS } from "@/lib/project-screenshots";
import { MonetizedInsightsSection } from "@/components/insights/monetized-insights-section";

export const metadata: Metadata = {
  title: "Vedoy Deliver – én ordreoversikt, flere salgskanaler",
  description: "Vedoy Deliver er et planlagt produkt fra Vedoy Studio: samlet ordreoversikt, egen nettside eller app og mulighet for lokale leveringsintegrasjoner."
};

const channels = [
  ["NETTBUTIKK", "Egen nettside", "Gi kunder mulighet til å bestille og betale direkte hos deg, med butikkens merkevare og egne kundereiser."],
  ["MOBIL", "Egen app", "La faste kunder bestille på nytt, følge status og få relevante varsler – dersom bedriften ønsker en app."],
  ["MARKEDSPLASS", "Wolt og Foodora", "Behold tilgjengeligheten i eksisterende apper. Samordning av ordrene forutsetter tilgang til godkjente integrasjoner."],
  ["LEVERING", "Wolt Drive", "Bruk budlevering for bestillinger fra egen kanal der Wolt Drive er tilgjengelig og avtale/API-tilgang er godkjent."]
] as const;

const automation = [
  ["01","Alt på ett sted","Importer ordrer via autoriserte API-er eller registrer dem manuelt i én kø. Samme visning for tilberedning, pakking, henting og levering."],
  ["02","Automatisk status","Send bekreftelser, gi kundene ordrestatuser og varsle ved klargjøring. Utsending krever samtykke og korrekt kanaloppsett."],
  ["03","Mindre dobbeltarbeid","Synk produkter, priser og lager der plattformenes integrasjoner tillater det. Unngå dobbeltregistrering når samme ordre går mellom systemer."],
  ["04","Smartere arbeidsflyt","Bruk regler for åpningstid, kapasitet, estimert klargjøringstid og automatisk videresending til kjøkken eller pakkestasjon."],
  ["05","Levering når det trengs","Be om pristilbud fra tilkoblet budpartner, la kunden se riktig leveringspris og opprett budoppdrag etter godkjent betaling."],
  ["06","Rapporter uten regneark","Summer salg per kanal, leveringskostnader, kanselleringer og behandlingstid – med sporing tilbake til originale ordresystemer."]
] as const;

export default function VedoyDeliverPage() {
  return (
    <main className={styles.page}>
      <div className={styles.boundary}>
        <nav className={styles.topbar} aria-label="Prosjektnavigasjon">
          <Link href="/#prosjekter">← Tilbake til prosjekter</Link>
          <span>UNDER UTVIKLING · IKKE I SALG</span>
        </nav>
        <section className={styles.hero} aria-labelledby="deliver-title">
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>VEDOY STUDIO / LEVERING & HANDEL</p>
            <h1 id="deliver-title">Alle bestillinger. <em>Én oversikt.</em></h1>
            <p className={styles.lead}>Selg på din egen nettside eller i en egen app. Fortsett samtidig på Wolt og Foodora. Vedoy Deliver skal samle ordrer og automatisere arbeidet bak – uten at du må gi opp kanalene som allerede skaffer kunder.</p>
            <div className={styles.heroActions}>
              <a className={styles.primary} href="/?need=Vedoy%20Deliver&source=deliver#kontakt">Snakk med Vedoy Studio ↗</a>
              <a className={styles.secondary} href="#ordre">Utforsk løsningen ↓</a>
            </div>
            <span className={styles.caveat}>Konsept og illustrasjon. Integrasjoner, tilgang, pris og tilgjengelighet er ikke godkjent eller lansert.</span>
          </div>
          <div className={styles.preview} aria-label="Illustrasjon av planlagt samlet ordreoversikt">
            <div className={styles.previewHeader}><span>VEDOY / DELIVER</span><b>ILLUSTRASJON · INGEN LIVE DATA</b></div>
            <div className={styles.previewTitle}><strong>Bestillinger</strong><span>Alle kanaler · eksempel</span></div>
            <div className={styles.previewRows}>
              <div className={styles.previewRow}><div><strong>#1041 · Egen nettbutikk</strong><small>2 varer · henting med bud</small></div><span>12:35</span><span className={styles.rowStatus}>Klargjøres</span></div>
              <div className={styles.previewRow}><div><strong>#1042 · Wolt</strong><small>1 vare · markedsplassordre</small></div><span>12:41</span><span className={styles.rowStatus}>Mottatt</span></div>
              <div className={styles.previewRow}><div><strong>#1043 · Foodora</strong><small>3 varer · markedsplassordre</small></div><span>12:47</span><span className={[styles.rowStatus,styles.rowStatusWarn].join(" ")}>Ny ordre</span></div>
              <div className={styles.previewRow}><div><strong>#1044 · Egen app</strong><small>1 vare · klikk og hent</small></div><span>12:52</span><span className={styles.rowStatus}>Klar</span></div>
            </div>
            <div className={styles.previewFooter}><span>Én arbeidsflate · færre faner</span><span>Demo, ikke tilkoblet</span></div>
          </div>
        </section>
        <div className={styles.metrics} aria-label="Planlagte fordeler">
          <div className={styles.metric}><strong>Én kø</strong><span>Samle ordrer fra tilgjengelige integrasjoner</span></div>
          <div className={styles.metric}><strong>Valgfritt</strong><span>Egen nettside, app og budlevering</span></div>
          <div className={styles.metric}><strong>Uten å forsvinne</strong><span>Behold eksisterende Wolt- og Foodora-kanaler</span></div>
        </div>

        <section id="ordre" className={styles.section} aria-labelledby="orders-heading">
          <div className={styles.sectionHead}><p className={styles.eyebrow}>01 / SAMLET BESTILLINGSFLYT</p><h2 id="orders-heading">Slutt å hoppe <em>mellom systemene.</em></h2><p>Vedoy Deliver skal fungere som en felles arbeidsflate for mottak, klargjøring og status. Hver ordre beholder kilden sin, slik at ansatte vet hvor den kom fra.</p></div>
          <div className={styles.channelGrid}>{channels.map(([tag,title,text])=><article className={styles.channelCard} key={title}><span>{tag}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className={styles.steps}>
            <div className={styles.step}><b>01</b><strong>Bestillingen kommer inn</strong><p>Fra egen butikk eller en godkjent ekstern salgskanal.</p></div>
            <div className={styles.step}><b>02</b><strong>Samles i én kø</strong><p>Ansatte ser kilde, varer, prioritet og ønsket tidspunkt.</p></div>
            <div className={styles.step}><b>03</b><strong>Klargjør og bekreft</strong><p>Status oppdateres mot tilkoblede kanaler når integrasjonen tillater det.</p></div>
            <div className={styles.step}><b>04</b><strong>Henting eller levering</strong><p>Bruk eksisterende leveringsflyt eller Wolt Drive for egne bestillinger.</p></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="automation-heading">
          <div className={styles.sectionHead}><p className={styles.eyebrow}>02 / AUTOMATISERING</p><h2 id="automation-heading">Mindre administrasjon. <em>Mer tid til kundene.</em></h2><p>Hver bedrift velger hvilke arbeidsoppgaver som skal automatiseres, og hva ansatte fortsatt skal godkjenne manuelt.</p></div>
          <div className={styles.featureGrid}>{automation.map(([id,title,text])=><article className={styles.featureCard} key={id}><b>{id}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section className={styles.section} aria-labelledby="savings-heading">
          <div className={styles.sectionHead}><p className={styles.eyebrow}>03 / ØKONOMI</p><h2 id="savings-heading">Hva kan bedriften <em>spare?</em></h2><p>Besparelser oppstår først og fremst når kunder velger din egen kanal i stedet for en provisjonsbasert markedsplass. Ordrer du fortsatt mottar via Wolt og Foodora følger avtalene der.</p></div>
          <DeliverSavingsCalculator />
        </section>

        <section className={styles.section} aria-labelledby="choices-heading">
          <div className={styles.sectionHead}><p className={styles.eyebrow}>04 / BEDRIFTEN BESTEMMER</p><h2 id="choices-heading">Behold kanalene. <em>Legg til flere.</em></h2><p>Du trenger ikke velge bort Wolt eller Foodora for å få din egen nettside, bestillingsapp eller integrasjon mot Wolt Drive. Velg den kombinasjonen som passer deg.</p></div>
          <DeliverChannelPicker />
        </section>

        <aside className={styles.notice}><h2>Om Wolt Drive og Foodora-integrasjoner</h2><p>Vedoy Studio ønsker å bygge en leverings- og ordrehub for bedrifter. Wolt Drive vurderes som mulig leveringspartner for bestillinger fra bedriftens egne kanaler. Godkjent avtale, API-tilgang, dekning og priser er ikke bekreftet. Integrasjoner mot markedsplassordrer fra Wolt og Foodora må godkjennes separat og kan kreve POS-/aggregatorpartner. Vedoy Deliver er et utviklingsprosjekt, ikke en aktiv leveringstjeneste. Eksisterende markedsplassavtaler gjelder fortsatt.</p></aside>
        <ProjectScreenshotGallery
          title="Et blikk inn i mobilpiloten."
          intro="Se eksempler på hvordan bud kan søke, finne fiktive oppdrag og beregne mulig godtgjørelse. Piloten kan ikke ta imot ekte leveranser."
          items={DELIVER_SCREENSHOTS}
          eyebrow="VEDOY DELIVER · MOBILPILOT"
          compact
        />
        <div className={styles.cta}>
          <div><p className={styles.eyebrow}>VEDOY STUDIO · HAUGESUND</p><h2>Vil du teste konseptet?</h2><p>Fortell oss hvilken bransje du driver i og hvordan du håndterer bestillingene i dag.</p></div>
          <a className={styles.primary} href="/?need=Vedoy%20Deliver&source=deliver#kontakt">Meld interesse ↗</a>
        </div>
      </div>
      <MonetizedInsightsSection />
    </main>
  );
}
