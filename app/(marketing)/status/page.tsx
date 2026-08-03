import type { Metadata } from "next";

export const metadata: Metadata = { title: "Status" };

const services = [
  ["Studio Web", "Operational", "99,99%"],
  ["Booking API", "Operational", "99,98%"],
  ["Vedi AI", "Demo / optional API", "—"],
  ["Domain provider", "Not connected", "—"],
  ["Email delivery", "Not connected", "—"]
];

export default function StatusPage() {
  return <section className="status-page"><div className="container"><header><span className="large-status"><i /> Demoen kjører</span><h1>Systemstatus</h1><p>Dette skiller tydelig mellom fungerende prosjektmoduler og eksterne leverandører som fortsatt må kobles til.</p></header><div className="status-service-list">{services.map(([name, status, uptime]) => <article key={name}><div><strong>{name}</strong><small>Siste sjekk: nylig</small></div><span className={status === "Operational" ? "is-ok" : "is-pending"}><i />{status}</span><b>{uptime}</b></article>)}</div></div></section>;
}
