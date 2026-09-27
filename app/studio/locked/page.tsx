import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LockedModulePage({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { module = "Denne modulen" } = await searchParams;
  return <div className="growth-dashboard">
    <header className="dashboard-heading"><div><p className="eyebrow">VEDØY GROWTH / TILGANG</p><h1>{module} er låst</h1><p>Denne arbeidsflaten krever en aktiv Growth-plan eller en administrator som åpner tilgangen.</p></div><div className="dashboard-heading__actions"><span className="data-mode"><i />Tilgang ikke aktivert</span></div></header>
    <section className="studio-panel locked-module-panel"><div className="locked-module-panel__icon">⌑</div><div><small>TRYGG TILGANG</small><h2>Se hva du får når modulen åpnes.</h2><p>Vi viser ikke innhold eller kundedata før abonnement, rolle og eventuelle leverandørkoblinger er avklart. Velg en plan for å sammenligne tilgang og få hjelp til oppsettet.</p><div className="dashboard-heading__actions"><Link className="button button--dark" href="/pricing#vedoy-growth">Se Growth-priser ↗</Link><Link className="button button--ghost" href="/studio">Tilbake til styrebordet</Link></div></div></section>
  </div>;
}
