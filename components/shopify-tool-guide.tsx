const options = [
  {
    label: "01 · RIMELIG START",
    title: "Payhip for enkel handel.",
    text: "Riktig for digitale produkter, kurs, medlemskap, coaching og mindre vareutvalg. Vedøy bygger uttrykket og oppsettet, mens Payhip håndterer checkout og produktlevering.",
    tools: ["Payhip", "Direkte checkout", "Digitale produkter", "Medlemskap"],
    fit: "Payhip Free: $0/mnd + 5 % per salg. Plus: $29/mnd + 2 %. Pro: $99/mnd uten Payhip-transaksjonsgebyr. Stripe/PayPal-gebyrer kommer i tillegg, og Vedøy-drift prises separat."
  },
  {
    label: "02 · BUTIKK I VEKST",
    title: "Shopify for mer handel.",
    text: "Riktig når bedriften trenger større vareutvalg, lager, frakt, rabatter og flere integrasjoner. Vi kan sette opp Shopify eller bygge en egen Next.js-front mot Shopify.",
    tools: ["Shopify", "Produkter og lager", "Frakt", "Storefront API"],
    fit: "Shopify har ikke ren pay-as-you-go: Basic er fra 289 kr/mnd ved årlig fakturering (389 kr/mnd månedlig), pluss kort-/betalingsgebyrer og eventuelle apper. Vedøy-drift prises separat."
  },
  {
    label: "03 · SKREDDERSYDD",
    title: "Koble handelen til bedriften.",
    text: "Når standardoppsettet ikke er nok, kan ordre og kundehendelser kobles til CRM, Booking eller Vedøy Growth gjennom sikre integrasjoner og automatisering.",
    tools: ["Webhooks", "API", "Vedøy Growth", "Automatisering"],
    fit: "Best for: arbeidsflyter, rapporter og egne systemer."
  }
];

export function EcommercePlatformGuide() {
  return (
    <section className="shopify-tool-guide" id="velg-handelsplattform">
      <div className="shopify-tool-guide__heading">
        <div><p className="editorial-kicker lime">VELG HANDELSPLATTFORM</p><h2>Payhip eller<br /><em>Shopify?</em></h2></div>
        <p>Kunden velger ikke på teknisk navn alene. Vi anbefaler Payhip når enkelhet og lav pris er viktigst, og Shopify når butikken trenger mer lager, frakt, vekst og integrasjoner. Vedøy-drift har samme faste grunnpris på 299 kr/mnd for begge.</p>
      </div>
      <div className="shopify-tool-guide__options">
        {options.map((option) => (
          <article key={option.label}>
            <small>{option.label}</small>
            <h3>{option.title}</h3>
            <p>{option.text}</p>
            <ul>{option.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            <strong>{option.fit}</strong>
          </article>
        ))}
      </div>
      <div className="shopify-tool-guide__setup">
        <div><small>VEDØY / PRISPRINSIPP</small><h3>Den rimeligste løsningen som fortsatt er trygg å levere.</h3></div>
        <ol><li>Payhip kan startes uten månedspris, men tar transaksjonsgebyr på gratisplanen.</li><li>Shopify krever et løpende abonnement; det finnes ikke en ren pay-as-you-go-plan.</li><li>Transaksjonsgebyrer, betalingsgebyrer, apper og domene vises separat.</li><li>Vedøy gir en konkret totalpris før arbeidet blir bindende.</li></ol>
        <div className="shopify-tool-guide__links">
          <a href="/#kontakt">Be om plattformvalg <span aria-hidden>↗</span></a>
          <a href="https://payhip.com/pricing" target="_blank" rel="noreferrer">Se Payhip-priser <span aria-hidden>↗</span></a>
        </div>
      </div>
    </section>
  );
}
