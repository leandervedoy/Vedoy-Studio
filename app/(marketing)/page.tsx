import Link from "next/link";
import { DashboardPreview } from "@/components/dashboard-preview";
import { DomainSearch } from "@/components/domain-search";
import { ProductGrid } from "@/components/product-grid";

const principles = [
  { number: "01", title: "Start enkelt", text: "Domene, nettside og e-post uten en jungel av valg." },
  { number: "02", title: "Drift samlet", text: "Booking, kunder, status og support i samme arbeidsflate." },
  { number: "03", title: "Voks med innsikt", text: "Tydelige tall og Vedi-forslag som ender i praktiske handlinger." },
  { number: "04", title: "Utvid når du trenger", text: "API-er, databaser og SDK-er for utviklere og større løsninger." }
];

const plans = [
  { name: "Start", price: "299", text: "For en liten virksomhet som vil komme ryddig på nett.", features: ["1 domene", "Nettsidehosting", "Booking Lite", "Personlig oppstart"] },
  { name: "Growth", price: "699", text: "For bedriften som vil samle drift og få mer ut av nettsiden.", features: ["3 prosjekter", "Full booking", "Statistics", "Vedi AI", "Prioritert support"], popular: true },
  { name: "Business", price: "Fra 1 499", text: "For team, API-er og løsninger som må formes rundt virksomheten.", features: ["Team og roller", "API og webhooks", "Flere miljøer", "Tilpasset oppfølging"] }
];

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">DIGITAL INFRASTRUKTUR · HAUGESUND</p>
            <h1>Alt virksomheten din vil ha på nett.<br /><em>Samlet.</em></h1>
            <p className="hero-lead">Domener, nettsider, hosting, booking, kunder, API-er, analyse og menneskelig IT-hjelp — laget for å være forståelig fra første klikk.</p>
            <div className="hero-actions">
              <Link className="button button--dark button--large" href="/login">Utforsk Studio <span>↗</span></Link>
              <Link className="button button--ghost button--large" href="#produkter">Se alt som er med</Link>
            </div>
            <div className="hero-proof"><span><i /> Ingen binding i demo</span><span><i /> Personlig support</span><span><i /> Bygget modulært</span></div>
          </div>
          <div className="hero-visual">
            <div className="floating-label floating-label--one"><i /> Alle tjenester friske</div>
            <div className="floating-label floating-label--two">✦ Vedi fant 3 muligheter</div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="partner-strip">
        <div className="container"><p>Ett rolig kontrollsenter for</p><div><span>LOKALE TJENESTER</span><span>NETTBUTIKKER</span><span>KREATIVE</span><span>KONSULENTER</span><span>OPPSTARTER</span></div></div>
      </section>

      <section className="domain-section" id="domains">
        <div className="container domain-section__grid">
          <div>
            <p className="eyebrow">START MED NAVNET</p>
            <h2>Finn domenet. Vi hjelper med resten.</h2>
            <p>Søk etter et navn, se tydelige eksempelpriser og koble domenet til nettside, e-post og booking fra samme sted.</p>
          </div>
          <DomainSearch />
        </div>
      </section>

      <section className="products-section" id="produkter">
        <div className="container">
          <header className="section-heading section-heading--split">
            <div><p className="eyebrow">VEDØY-ØKOSYSTEMET</p><h2>Bygg. Drift. Voks. Utvikle.</h2></div>
            <p>Én plattform kan ikke gjøre alt på dag én. Derfor viser Studio tydelig hva som er tilgjengelig, beta og planlagt — men alt følger samme språk og samme konto.</p>
          </header>
          <ProductGrid />
        </div>
      </section>

      <section className="platform-section" id="hosting">
        <div className="container platform-grid">
          <div className="platform-copy">
            <p className="eyebrow">ETT KONTROLLSENTER</p>
            <h2>Fra idé til drift uten å miste oversikten.</h2>
            <p>Vedøy Studio knytter sammen det virksomheten faktisk bruker. Du kan begynne med én nettside og legge til booking, e-post, rapporter og API-er når behovet kommer.</p>
            <div className="principle-list">
              {principles.map((principle) => <article key={principle.number}><span>{principle.number}</span><div><h3>{principle.title}</h3><p>{principle.text}</p></div></article>)}
            </div>
          </div>
          <div className="infrastructure-visual">
            <div className="infra-center"><img src="/vedoy-mark.svg" alt="" /><strong>VEDØY STUDIO</strong><small>Én konto · ett API</small></div>
            {[{ t: "DOMENER", c: "#dfb934" }, { t: "HOSTING", c: "#171714" }, { t: "BOOKING", c: "#2563eb" }, { t: "VEDI AI", c: "#7c3aed" }, { t: "STATISTICS", c: "#ea580c" }, { t: "ASSIST", c: "#16a34a" }].map((item, index) => <div className={`infra-node infra-node--${index + 1}`} key={item.t} style={{ "--node-color": item.c } as React.CSSProperties}><i />{item.t}</div>)}
            <svg viewBox="0 0 500 500" aria-hidden><circle cx="250" cy="250" r="150" /><circle cx="250" cy="250" r="205" /></svg>
          </div>
        </div>
      </section>

      <section className="feature-showcase" id="booking">
        <div className="container feature-showcase__grid">
          <div className="calendar-mock">
            <div className="calendar-mock__top"><div><small>VEDØY BOOKING</small><h3>August 2026</h3></div><div><button>‹</button><button>›</button></div></div>
            <div className="calendar-weekdays">{["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-days">{Array.from({ length: 35 }, (_, index) => { const day = index - 4; const hasEvent = [4, 7, 11, 12, 18, 21, 25].includes(day); return <button key={index} className={day === 12 ? "is-selected" : day < 1 || day > 31 ? "is-muted" : ""}>{day > 0 && day <= 31 ? day : ""}{hasEvent && <i />}</button>; })}</div>
            <div className="calendar-agenda"><div><span style={{ background: "#2563eb" }} /><strong>10:00</strong><p>Digital IT-hjelp<br /><small>Ingrid Solheim · 60 min</small></p></div><div><span style={{ background: "#7c3aed" }} /><strong>13:00</strong><p>Bedriftssjekk<br /><small>Nordlys Kafé · 120 min</small></p></div></div>
          </div>
          <div>
            <p className="eyebrow">BOOKING SOM PASSER BEDRIFTEN</p>
            <h2>Kalenderen ser enkel ut. Motoren tenker for deg.</h2>
            <p>Tjenester, planer, ansatte, åpningstider, buffertid, kapasitet og fargekoder kan tilpasses uten å bygge hele kundereisen på nytt.</p>
            <ul className="check-list"><li>Outlook-inspirert kunde- og adminvisning</li><li>Planer, abonnement og tilpassede felter</li><li>API-adapter for database og integrasjoner</li><li>Responsiv i helside, kort, modal og smal kolonne</li></ul>
            <Link className="text-link" href="/booking">Prøv bookingdemoen <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="vedi-section" id="vedi">
        <div className="container vedi-public-grid">
          <div className="vedi-public-copy"><div className="vedi-mark">✦</div><p className="eyebrow">MØT VEDI</p><h2>KI som ender med et forståelig neste steg.</h2><p>Vedi kan forklare tall, oppsummere aktivitet og hjelpe med nettside, booking og digitale rutiner. Når menneskelig hjelp trengs, går du videre til Vedøy Assist.</p><Link href="/login" className="button button--light">Snakk med Vedi</Link></div>
          <div className="vedi-public-chat"><div className="public-chat-message"><span>EL</span><p>Hva bør jeg prioritere denne uken?</p></div><div className="public-chat-message is-vedi"><span>✦</span><div><p><strong>Prioriter én komplett kundereise:</strong></p><ol><li>Gjør domenesøket ferdig.</li><li>Koble én nettsidemal til hosting.</li><li>La en testkunde booke fra start til bekreftelse.</li></ol><small>Basert på Studio-aktiviteten din</small></div></div><div className="public-chat-sources"><span>◎ Domener</span><span>□ Booking</span><span>↗ Statistics</span></div></div>
        </div>
      </section>

      <section className="developer-section" id="api">
        <div className="container developer-grid">
          <div><p className="eyebrow">FOR UTVIKLERE</p><h2>Ferdige byggeklosser. Full kontroll når du trenger det.</h2><p>Bruk den hostede tjenesten, bygg inn en widget eller installer pakkene i egne Next.js- og React-prosjekter.</p><div className="developer-actions"><Link className="button button--dark" href="/docs">Åpne dokumentasjon</Link><span>API · Webhooks · TypeScript</span></div></div>
          <div className="terminal"><div className="terminal__top"><span><i /><i /><i /></span><small>terminal</small></div><pre><code><span>$</span> npm install @vedoy/booking{"\n\n"}<b>import</b> {`{ BookingCalendar }`} <b>from</b>{"\n"}  <em>"@vedoy/booking"</em>;{"\n\n"}<b>export default function</b> Page() {`{`}{"\n"}  <b>return</b> &lt;BookingCalendar /&gt;;{"\n"}{`}`}</code></pre></div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container"><header className="section-heading"><p className="eyebrow">ENKLE RAMMER</p><h2>Start lite. Skru på mer når det gir verdi.</h2><p>Prisene under er konseptpriser i prosjektet og bør kvalitetssikres før salg.</p></header><div className="pricing-grid">{plans.map((plan) => <article key={plan.name} className={plan.popular ? "pricing-card is-popular" : "pricing-card"}>{plan.popular && <span className="popular-label">MEST AKTUELL</span>}<h3>{plan.name}</h3><p>{plan.text}</p><div className="price"><strong>{plan.price}</strong><span>kr/mnd</span></div><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><Link className={plan.popular ? "button button--dark button--wide" : "button button--ghost button--wide"} href="/login">Velg {plan.name}</Link></article>)}</div></div>
      </section>

      <section className="final-cta" id="contact"><div className="container final-cta__inner"><div><p className="eyebrow">BYGG MED OSS</p><h2>En digital grunnmur som kan vokse med ideene dine.</h2></div><div><p>Åpne demoen, test modulene og se hvordan Vedøy Studio kan bli kontrollsenteret for virksomheten din.</p><Link className="button button--light button--large" href="/login">Åpne Studio-demo <span>↗</span></Link></div></div></section>
    </>
  );
}
