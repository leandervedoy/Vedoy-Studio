import { getShopifyStatus } from "../lib/config";

const pilotSteps = [
  "Opprett en privat eller custom Shopify-app for første pilotkunde.",
  "Velg minste nødvendige tilgang: produkter, ordre og kunder.",
  "Legg inn server-variablene i Vercel – aldri i Studio eller nettleseren.",
  "Pek Shopify-webhookene til denne appen og test leveranse mot Growth.",
];

export default function Home() {
  const integration = getShopifyStatus();
  const ready = integration.status === "ready_for_pilot";

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Vedøy / Shopify pilot</p>
        <div className="hero-grid">
          <div>
            <h1>Shopify-synk som er klar for en ekte pilot.</h1>
            <p className="lede">
              En separat integrasjonskjerne mellom Shopify og Vedøy Growth. Studio forblir kundevendt;
              denne appen holder admin-nøkler, webhook-validering og synk på serversiden.
            </p>
          </div>
          <aside className={`status ${ready ? "ready" : "not-ready"}`}>
            <span className="status-dot" aria-hidden="true" />
            <p>Integrasjonsstatus</p>
            <strong>{ready ? "Klar for pilot" : "Ikke konfigurert"}</strong>
            <small>
              {ready
                ? "Signaturkontroll og sikker levering til Growth er konfigurert."
                : "Ingen webhook-hemmelighet eller sikker Growth-forbindelse er koblet til ennå."}
            </small>
          </aside>
        </div>
      </section>

      <section className="grid" aria-label="Hva integrasjonen gjør">
        <article>
          <span>01</span>
          <h2>Produkter</h2>
          <p>Tar imot produktoppdateringer og sender et minimert produktobjekt til Growth.</p>
          <code>products/update</code>
        </article>
        <article>
          <span>02</span>
          <h2>Ordre</h2>
          <p>Sender ordrestatus, total og kundenavn/e-post – uten leverings- eller betalingsdetaljer.</p>
          <code>orders/create</code>
        </article>
        <article>
          <span>03</span>
          <h2>Kunder</h2>
          <p>Sender kundens basisdata slik at Growth senere kan koble aktivitet mot riktig bedrift.</p>
          <code>customers/create</code>
        </article>
      </section>

      <section className="setup">
        <div>
          <p className="eyebrow">Neste steg</p>
          <h2>Konfigurer først når en pilotkunde er klar.</h2>
          <p>
            Dette er bevisst ikke en App Store-app ennå. Første versjon installeres hos én samtykkende
            pilotkunde, testes med reelle ordre, og utvides derfra.
          </p>
        </div>
        <ol>
          {pilotSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {!ready && (
        <section className="missing" aria-label="Mangler før pilot">
          <p className="eyebrow">Mangler før pilot</p>
          <div>
            {integration.missing.map((name) => (
              <code key={name}>{name}</code>
            ))}
          </div>
          <p>
            API-versjon: <strong>{integration.apiVersion}</strong>. Verdiene vises aldri her, bare hva som
            mangler.
          </p>
        </section>
      )}
    </main>
  );
}
