import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dokumentasjon" };

export default function DocsPage() {
  return (
    <section className="docs-page">
      <div className="container docs-layout">
        <aside className="docs-nav"><strong>Kom i gang</strong><a href="#install">Installasjon</a><a href="#booking">Booking</a><a href="#api">API</a><a href="#deploy">Deploy</a><strong>Arkitektur</strong><a href="#database">Database</a><a href="#security">Sikkerhet</a></aside>
        <article className="docs-content"><p className="eyebrow">VEDØY DEVELOPERS</p><h1>Bygg med Studio.</h1><p className="docs-lead">Prosjektet kombinerer en full-stack Next.js-app med en lokal, gjenbrukbar bookingpakke.</p>
          <h2 id="install">Installer og start</h2><pre><code>npm install{"\n"}cp .env.example .env.local{"\n"}npm run dev</code></pre><p>Åpne <code>http://localhost:3000</code>. Demokontoen er beskrevet på innloggingssiden når demomodus er aktiv.</p>
          <h2 id="booking">Bruk bookingpakken</h2><pre><code>{`import { BookingCalendar } from "@vedoy/booking";
import "@vedoy/booking/styles.css";

<BookingCalendar
  services={services}
  plans={plans}
  adapter={adapter}
  schedule={schedule}
/>`}</code></pre><p>Pakken ligger i <code>packages/booking</code> og kan senere publiseres separat.</p>
          <h2 id="api">API-ruter</h2><div className="docs-table"><span>GET</span><code>/api/domains/search?query=navn</code><p>Demobasert domenesøk</p><span>GET/POST</span><code>/api/projects</code><p>Prosjekter og hosting</p><span>GET/POST</span><code>/api/bookings</code><p>Booking og konfliktkontroll</p><span>POST</span><code>/api/ai</code><p>Vedi AI eller demomodus</p><span>GET/POST</span><code>/api/api-keys</code><p>API-nøkler</p></div>
          <h2 id="database">Koble PostgreSQL</h2><pre><code>DATABASE_URL=postgresql://...{"\n"}npm run db:setup</code></pre><p>Uten <code>DATABASE_URL</code> bruker appen et minnelager som nullstilles ved omstart. Med database brukes tabellene i <code>data/schema.sql</code>.</p>
          <h2 id="deploy">Deploy til Vercel</h2><ol><li>Push prosjektet til GitHub.</li><li>Importer repoet i Vercel.</li><li>Legg inn miljøvariabler.</li><li>Koble en PostgreSQL-leverandør.</li><li>Kjør databaseskriptet lokalt mot produksjonsdatabasen.</li></ol>
          <h2 id="security">Før produksjon</h2><ul><li>Bytt demoinnlogging med Auth.js, Clerk eller egen identitetsleverandør.</li><li>Bruk en sterk <code>SESSION_SECRET</code>.</li><li>Legg betalings-, domene- og hostinghandlinger bak serverkontroll.</li><li>Gjennomfør tilgangstesting og personvernvurdering.</li></ul>
        </article>
      </div>
    </section>
  );
}
