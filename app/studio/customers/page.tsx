import { ModuleHeader } from "@/components/studio/module-header";
import { listCustomers } from "@/lib/repository";
import { formatDateTime, formatNok } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <><ModuleHeader eyebrow="DRIFT" title="Kunder og CRM" description="En enkel kundehistorikk for henvendelser, booking og oppfølging." badge="BETA" /><div className="crm-toolbar"><div className="studio-search"><span>⌕</span><input placeholder="Søk etter kunde, bedrift eller e-post" /><kbd>{customers.length}</kbd></div><button className="button button--dark">+ Ny kunde</button></div><div className="customer-table"><div className="customer-table__head"><span>Kunde</span><span>Merker</span><span>Verdi</span><span>Siste aktivitet</span><span /></div>{customers.map((customer) => <article key={customer.id}><div className="customer-person"><span>{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{customer.name}</strong><small>{customer.company || customer.email}</small></div></div><div className="tag-list">{customer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><strong>{formatNok(customer.valueNok)}</strong><span>{formatDateTime(customer.lastActivityAt)}</span><button className="icon-button">•••</button></article>)}</div></>;
}
