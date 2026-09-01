import { ModuleHeader } from "@/components/studio/module-header";
import { listClothingRequests, listContactRequests, listHostingRequests } from "@/lib/repository";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function RequestsPage() {
  let databaseError = false;
  const [contacts, clothing, hosting] = await Promise.all([
    listContactRequests().catch(() => { databaseError = true; return []; }),
    listClothingRequests().catch(() => { databaseError = true; return []; }),
    listHostingRequests().catch(() => { databaseError = true; return []; })
  ]);
  return <>
    <ModuleHeader eyebrow="ADMINISTRATOR" title="Henvendelser" description="Kontaktskjema, nettsidebestillinger, hostingforespørsler og bedriftsklær lagret i Studio-databasen." />
    {databaseError ? <div className="admin-database-warning"><strong>Databasen er ikke klar.</strong><p>Kjør databaseskjemaet og kontroller DATABASE_URL før skjemaene tas i bruk.</p></div> : null}
    <section className="request-admin-grid">
      <article className="studio-panel request-admin-panel">
        <div className="panel-heading"><div><small>KONTAKT OG NETTSIDE</small><h2>{contacts.length} henvendelser</h2></div></div>
        <div className="request-list">{contacts.length ? contacts.map((item) => <article key={item.id}>
          <header><div><strong>{item.name}</strong><span>{item.company || "Privat"}</span></div><b>{item.status === "new" ? "NY" : item.status.toUpperCase()}</b></header>
          <dl><div><dt>Behov</dt><dd>{item.need}</dd></div><div><dt>E-post</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div>{item.phone ? <div><dt>Telefon</dt><dd><a href={`tel:${item.phone}`}>{item.phone}</a></dd></div> : null}</dl>
          {item.message ? <p>{item.message}</p> : null}<time>{formatDate(item.createdAt)}</time>
        </article>) : <p className="request-empty">Ingen henvendelser ennå.</p>}</div>
      </article>
      <article className="studio-panel request-admin-panel">
        <div className="panel-heading"><div><small>BEDRIFTSKLÆR</small><h2>{clothing.length} forespørsler</h2></div></div>
        <div className="request-list">{clothing.length ? clothing.map((item) => <article key={item.id}>
          <header><div><strong>{item.company || item.name}</strong><span>{item.productName} · {item.quantity} stk.</span></div><b>{item.status === "new" ? "NY" : item.status.toUpperCase()}</b></header>
          {item.logoData && item.logoContentType ? <div className="request-logo"><img src={`data:${item.logoContentType};base64,${item.logoData}`} alt={`Logo fra ${item.company || item.name}`} /></div> : null}
          <dl><div><dt>Kontakt</dt><dd>{item.name}</dd></div><div><dt>E-post</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div><div><dt>Produkt</dt><dd>{item.productCode}</dd></div></dl>
          {item.details ? <p>{item.details}</p> : null}<time>{formatDate(item.createdAt)}</time>
        </article>) : <p className="request-empty">Ingen klesforespørsler ennå.</p>}</div>
      </article>
      <article className="studio-panel request-admin-panel">
        <div className="panel-heading"><div><small>HOSTING OG DOMENE</small><h2>{hosting.length} forespørsler</h2></div></div>
        <div className="request-list">{hosting.length ? hosting.map((item) => <article key={item.id}>
          <header><div><strong>{item.company || item.name}</strong><span>{item.serverCount} server{item.serverCount === 1 ? "" : "e"} · {item.ramGb} GB RAM · {item.storageGb} GB</span></div><b>{item.status === "new" ? "NY" : item.status.toUpperCase()}</b></header>
          <dl><div><dt>Kontakt</dt><dd>{item.name}</dd></div><div><dt>E-post</dt><dd><a href={`mailto:${item.email}`}>{item.email}</a></dd></div><div><dt>Domene</dt><dd>{item.domain ? `${item.domainMode} · ${item.domain}` : item.domainMode}</dd></div><div><dt>Prisanslag</dt><dd>{item.monthlyNok} kr/mnd. + {item.setupNok} kr etablering</dd></div></dl>
          {item.details ? <p>{item.details}</p> : null}<time>{formatDate(item.createdAt)}</time>
        </article>) : <p className="request-empty">Ingen hostingforespørsler ennå.</p>}</div>
      </article>
    </section>
  </>;
}
