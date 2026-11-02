import { requireAdminSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type CashbackRow = { id: string; source: string; customer_ref: string; order_ref: string; amount_ore: number; currency: string; state: string; created_at: string };

export default async function CashbackPage() {
  const session = await requireAdminSession();
  const sql = getSql();
  let rows: CashbackRow[] = [];
  let connected = false;
  if (sql) {
    try {
      rows = (await sql`
        select id::text, source, customer_ref, order_ref, amount_ore, currency, state, created_at::text
        from vedoy_cashback_entries
        where organization_id = ${session.organizationId}
        order by created_at desc limit 100
      `) as CashbackRow[];
      connected = true;
    } catch {
      // A missing migration is displayed as unconfigured, never as zero earned.
    }
  }
  const sums = rows.filter((x) => x.state === "confirmed").reduce((acc, x) => acc + (x.currency === "NOK" ? Number(x.amount_ore) : 0), 0);
  const pending = rows.filter((x) => x.state === "pending").reduce((acc, x) => acc + (x.currency === "NOK" ? Number(x.amount_ore) : 0), 0);
  const money = (ore: number) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" }).format(ore / 100);
  return <main style={{ display:"grid", gap:24, padding: "8px 0 40px" }}>
    <header className="dashboard-heading"><div><p className="eyebrow">VEDOY PAY / REWARDS</p><h1>Cashback</h1><p>Samlet oversikt over opptjent, ventende og tilbakeført cashback fra Vedøy-tjenester.</p></div></header>
    {!connected && <div className="studio-panel" role="status"><strong>Cashback er ikke koblet til databasen ennå.</strong><p>Kjør migreringen i <code>supabase/migrations/20261102_vedoy_cashback.sql</code> mot Studio-databasen og koble godkjente betalingshendelser til cashback-ledgeren. Ingen saldotall vises som ekte før dette er klart.</p></div>}
    <section className="stat-grid">
      <article><span>◉</span><div><small>Bekreftet cashback</small><strong>{connected ? money(sums) : "—"}</strong><p>Registrert i NOK</p></div></article>
      <article><span>◷</span><div><small>Avventer</small><strong>{connected ? money(pending) : "—"}</strong><p>Ikke tilgjengelig for uttak</p></div></article>
      <article><span>▤</span><div><small>Registrerte hendelser</small><strong>{connected ? rows.length : "—"}</strong><p>De siste 100</p></div></article>
    </section>
    <section className="studio-panel"><div className="panel-heading"><div><small>ALLE KANALER</small><h2>Cashback-historikk</h2></div></div>
      {rows.length ? <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr><th>Kilde</th><th>Ordre</th><th>Kunde</th><th>Status</th><th>Cashback</th><th>Registrert</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{x.source}</td><td>{x.order_ref}</td><td>{x.customer_ref}</td><td>{x.state}</td><td>{x.currency === "NOK" ? money(x.amount_ore) : `${x.amount_ore / 100} ${x.currency}`}</td><td>{new Date(x.created_at).toLocaleDateString("nb-NO")}</td></tr>)}</tbody></table></div> : <p>Ingen cashback-hendelser er registrert. Vedoy Pay, Vedoy Store og andre kanaler kan kobles til denne oversikten når betalingshendelser er verifisert.</p>}
    </section>
    <section className="studio-panel"><h2>Hvordan cashback fungerer</h2><p>Cashback skal først registreres etter bekreftet betaling. Refusjoner og chargebacks må motposteres. Vipps, Klarna og kortbetaling er betalingsmetoder – ikke egne cashback-programmer uten avtale.</p></section>
  </main>;
}
