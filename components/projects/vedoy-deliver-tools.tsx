"use client";

import { useState } from "react";
import styles from "./vedoy-deliver.module.css";

const nok = (value: number) => new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(Math.round(value));

function bounded(raw: string, min: number, max: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

export function DeliverSavingsCalculator() {
  const [orders, setOrders] = useState(100);
  const [basket, setBasket] = useState(400);
  const [marketplaceRate, setMarketplaceRate] = useState(25);
  const [processingRate, setProcessingRate] = useState(2.9);
  const [platformFee, setPlatformFee] = useState(9);
  const [subscription, setSubscription] = useState(399);
  const [deliveryDifference, setDeliveryDifference] = useState(0);
  const marketplaceCost = orders * basket * marketplaceRate / 100;
  const directCost = orders * basket * processingRate / 100 + orders * platformFee + subscription + orders * deliveryDifference;
  const difference = marketplaceCost - directCost;
  const hoursSaved = orders * 3 / 60;
  return (
    <div className={styles.calculator}>
      <div className={styles.calculatorIntro}>
        <p className={styles.eyebrow}>REGNEEKSEMPEL · IKKE ET PRISTILBUD</p>
        <h3>Hva kan egne bestillinger bety?</h3>
        <p>Juster antakelsene for ordrer som faktisk kommer gjennom din egen nettside eller app, i stedet for via en markedsplass. Du kan fortsatt være synlig og motta andre bestillinger på Wolt og Foodora.</p>
      </div>
      <div className={styles.calculatorGrid}>
        <div className={styles.calculatorInputs}>
          <label>Bestillinger via egen kanal per måned
            <input type="number" min="0" max="10000" value={orders} onChange={(event) => setOrders(bounded(event.target.value, 0, 10000))} />
          </label>
          <label>Gjennomsnittlig ordresum (kr)
            <input type="number" min="0" max="100000" step="50" value={basket} onChange={(event) => setBasket(bounded(event.target.value, 0, 100000))} />
          </label>
          <label>Eksempel på markedsplassprovisjon (%)
            <input type="number" min="0" max="60" step="0.5" value={marketplaceRate} onChange={(event) => setMarketplaceRate(bounded(event.target.value, 0, 60))} />
          </label>
          <label>Betalingskostnad på egen kanal (%)
            <input type="number" min="0" max="30" step="0.1" value={processingRate} onChange={(event) => setProcessingRate(bounded(event.target.value, 0, 30))} />
          </label>
          <label>Eksempel: Vedoy-avgift per ordre (kr)
            <input type="number" min="0" max="1000" value={platformFee} onChange={(event) => setPlatformFee(bounded(event.target.value, 0, 1000))} />
          </label>
          <label>Eksempel: abonnement per måned (kr)
            <input type="number" min="0" max="100000" value={subscription} onChange={(event) => setSubscription(bounded(event.target.value, 0, 100000))} />
          </label>
          <label>Netto leveringskostnad per ordre (kr)
            <input type="number" min="-1000" max="1000" value={deliveryDifference} onChange={(event) => setDeliveryDifference(bounded(event.target.value, -1000, 1000))} />
            <small>Leverandørens pris minus leveringsgebyret kunden betaler. Sett til 0 bare når beløpene dekker hverandre.</small>
          </label>
        </div>
        <div className={styles.calculatorResults} aria-live="polite">
          <p>Simulert kostnadsforskjell per måned</p>
          <strong>{difference < 0 ? "−" : "+"}{nok(Math.abs(difference))} kr</strong>
          <span>{difference < 0 ? "Egen kanal blir dyrere i dette eksemplet." : "Lavere kostnad i dette eksemplet – ikke garantert fortjeneste."}</span>
          <div className={styles.resultLine}><span>Illustrativ markedsplasskostnad</span><b>{nok(marketplaceCost)} kr</b></div>
          <div className={styles.resultLine}><span>Illustrativ kostnad på egen kanal</span><b>{nok(directCost)} kr</b></div>
          <div className={styles.resultLine}><span>Mulig spart manuelt arbeid *</span><b>{new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(hoursSaved)} t/mnd</b></div>
          <small>* Kun dersom 3 minutter manuell registrering per ordre faktisk fjernes. Markedsføring, ordreanskaffelse, moms, returer, oppsett og eventuelle andre gebyrer er ikke med. Prisene over er redigerbare antakelser, ikke verifiserte Wolt-, Foodora- eller Vedoy-priser.</small>
        </div>
      </div>
    </div>
  );
}

const channels = [
  { id: "own", name: "Egen nettside eller app", info: "Direktebestilling, betaling og valgfri Wolt Drive-levering." },
  { id: "wolt", name: "Wolt-appen", info: "Behold synlighet og ordrer på Wolt. Felles oversikt krever godkjent integrasjon." },
  { id: "foodora", name: "Foodora-appen", info: "Behold eksisterende Foodora-salg. Ordresynk krever riktig API-tilgang." },
  { id: "pickup", name: "Henting / kasse / telefon", info: "Ordre fra egen butikk eller telefon kan registreres på samme sted." }
] as const;
type ChannelId = (typeof channels)[number]["id"];

export function DeliverChannelPicker() {
  const [selected, setSelected] = useState<ChannelId[]>(["own", "wolt", "foodora"]);
  function toggle(id: ChannelId) {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }
  return (
    <div className={styles.chooser}>
      <div className={styles.choiceList}>
        {channels.map((channel) => (
          <label key={channel.id} className={styles.choice}>
            <input type="checkbox" checked={selected.includes(channel.id)} onChange={() => toggle(channel.id)} />
            <span className={styles.choiceText}><strong>{channel.name}</strong><small>{channel.info}</small></span>
          </label>
        ))}
      </div>
      <div className={styles.choiceSummary} aria-live="polite">
        <span className={styles.eyebrow}>DIN VALGTE LØSNING · KONSEPT</span>
        <strong>{selected.length === 0 ? "Velg en kanal" : selected.length + (selected.length === 1 ? " kanal" : " kanaler") + " valgt"}</strong>
        <p>{selected.length === 0
          ? "Du kan velge én eller flere salgskanaler. Ingen kanal er påkrevd."
          : "Du beholder " + selected.map((id) => channels.find((channel) => channel.id === id)?.name).join(", ") + ". Vedoy skal samle tilgjengelige ordrer i én arbeidsflate – etter at nødvendige tilganger er på plass."}</p>
        <span className={styles.chooserNote}>Dette endrer bare forhåndsvisningen, ikke eksisterende butikkontoer eller integrasjoner.</span>
      </div>
    </div>
  );
}
