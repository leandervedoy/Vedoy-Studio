const options = [
  {
    label: "01 · NETTBUTIKK",
    title: "Shopify som handelsmotor.",
    text: "Riktig når kunder skal finne, betale for og motta varer. Vi kan sette opp Shopify direkte eller bygge en skreddersydd Next.js-front mot Storefront API.",
    tools: ["Shopify", "Storefront API", "Checkout", "Next.js"],
    fit: "Best for: varer, kolleksjoner og merkevareopplevelse."
  },
  {
    label: "02 · SHOPIFY-APP",
    title: "Shopify CLI for bedrifter.",
    text: "Riktig når løsningen skal installeres i Shopify Admin og jobbe med produkter, ordre, kunder eller interne arbeidsflyter. CLI setter opp appens OAuth, testbutikk og utviklingsflyt.",
    tools: ["Shopify CLI", "Admin API", "App Bridge", "OAuth"],
    fit: "Best for: app i Shopify Admin og flere butikkinstallasjoner."
  },
  {
    label: "03 · SYNKRONISERING",
    title: "Koble handel til Growth.",
    text: "Riktig når Booking, CRM eller Growth skal reagere på ordre og kundehendelser. Webhooks sender hendelser inn til en sikker serverrute, som validerer og lagrer det bedriften trenger.",
    tools: ["Webhooks", "Supabase", "Vedøy Growth", "API"],
    fit: "Best for: ordrestatus, kundekort, rapporter og automatisering."
  }
];

export function ShopifyToolGuide() {
  return (
    <section className="shopify-tool-guide" id="shopify-verktoy">
      <div className="shopify-tool-guide__heading">
        <div><p className="editorial-kicker lime">VELG RIKTIG SPOR</p><h2>Ikke alle trenger<br /><em>en Shopify-app.</em></h2></div>
        <p>Vi starter med løsningen som gir minst teknisk drift: butikk for salg, Shopify CLI for en installérbar app, eller en sikker integrasjon mot Vedøy Growth.</p>
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
        <div><small>VEDØY / SHOPIFY-OPPSETT</small><h3>Det vi setter opp før en bedrift går live.</h3></div>
        <ol><li>Utviklingsbutikk og app i Shopify Dev Dashboard.</li><li>Minste nødvendige API-tilganger, sikre Vercel-miljøvariabler og databasekobling.</li><li>Signaturkontroll av webhooks og test av produkter, ordre og feiltilfeller.</li><li>Pilot med én butikk før løsningen tilbys bredt.</li></ol>
        <a href="https://shopify.dev/docs/apps/build/scaffold-app" target="_blank" rel="noreferrer">Se Shopify CLI-oppsettet <span aria-hidden>↗</span></a>
      </div>
    </section>
  );
}
