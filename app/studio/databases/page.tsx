import { ModuleHeader } from "@/components/studio/module-header";
import { isUsingDatabase } from "@/lib/repository";

const databases = [
  { name: "studio-production", type: "PostgreSQL", region: "Europe West", size: "1.8 GB", status: "healthy", tables: 9 },
  { name: "analytics-events", type: "PostgreSQL", region: "Europe West", size: "640 MB", status: "paused", tables: 4 }
];

export default function DatabasesPage() {
  return <><ModuleHeader eyebrow="UTVIKLE" title="Databaser" description="Se datakilder, tabeller, region og backupstatus i en enklere oversikt." badge={isUsingDatabase() ? "TILKOBLET" : "PROTOTYPE"} /><div className="database-notice"><span>◫</span><div><strong>{isUsingDatabase() ? "Studio bruker PostgreSQL" : "Ingen DATABASE_URL er satt"}</strong><p>{isUsingDatabase() ? "API-rutene leser og skriver nå til den tilkoblede databasen." : "Demoen bruker minnelagring. Koble PostgreSQL og kjør npm run db:setup for varig data."}</p></div><code>npm run db:setup</code></div><div className="database-grid">{databases.map((database) => <article key={database.name}><header><span>◫</span><div><strong>{database.name}</strong><small>{database.type} · {database.region}</small></div><i className={`health-dot health-dot--${database.status}`} /></header><div><span><small>Størrelse</small><strong>{database.size}</strong></span><span><small>Tabeller</small><strong>{database.tables}</strong></span><span><small>Backup</small><strong>Daglig</strong></span></div><footer><button className="button button--ghost">Åpne tabeller</button><button className="icon-button">•••</button></footer></article>)}</div><section className="schema-preview"><div className="panel-heading"><div><small>DATAMODELL</small><h2>Studio-kjernen</h2></div><span>data/schema.sql</span></div><div className="schema-map">{["organizations", "projects", "domains", "bookings", "customers", "api_keys", "support_tickets"].map((table) => <span key={table}>◫ {table}</span>)}</div></section></>;
}
