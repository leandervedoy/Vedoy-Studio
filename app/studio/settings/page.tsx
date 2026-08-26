import { CompanySettings } from "@/components/studio/company-settings";
import { GrowthSettings } from "@/components/studio/growth-settings";
import { ModuleHeader } from "@/components/studio/module-header";
import { requireSession } from "@/lib/auth";
import { getIntegrationStatuses } from "@/lib/integration-status";
import { getGrowthCompanyProfile, getGrowthPreferences } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const [integrations, preferences, profile] = await Promise.all([
    getIntegrationStatuses(), getGrowthPreferences(session.email), getGrowthCompanyProfile()
  ]);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);
  return <>
    <ModuleHeader eyebrow="VEDØY GROWTH" title="Innstillinger" description="Virksomhet, varslingsvalg, standarder og integrasjoner." />
    <div className="settings-layout">
      <nav><a className="is-active">Virksomhet</a><a>Varsler</a><a>Merkevare</a><a>Team og roller</a><a>Fakturering</a><a>Integrasjoner</a><a>Sikkerhet</a></nav>
      <div className="settings-content">
        <CompanySettings initialProfile={profile} />
        <GrowthSettings initialPreferences={preferences} emailConfigured={emailConfigured} />
        <section><div className="panel-heading"><div><small>INTEGRASJONER</small><h2>Leverandørstatus</h2></div></div><p>Ingen integrasjon markeres som aktiv uten gyldig konfigurasjon. Demo-funksjoner fortsetter å virke uten eksterne nøkler.</p><div className="toggle-list">{integrations.map((integration) => <div key={integration.id}><span><strong>{integration.name}</strong><small>{integration.detail}</small></span><code>{integration.status}</code></div>)}</div><p><a href="https://status.stripe.com" target="_blank" rel="noreferrer">Stripe Status ↗</a></p></section>
        <section><div className="panel-heading"><div><small>STANDARDER</small><h2>Nye prosjekter</h2></div></div><div className="toggle-list"><label><span><strong>Automatisk SSL</strong><small>Aktiver HTTPS på nye domener</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Daglig backup</strong><small>Opprett sikkerhetskopi automatisk</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Vedi-innsikt</strong><small>Lag forslag fra aggregert aktivitet</small></span><input type="checkbox" defaultChecked /></label></div></section>
        <section className="danger-zone"><div><strong>Demomodus</strong><p>Når demomodus er på, kan prosjektet brukes uten eksterne leverandører. Skru den av før ekte kundedrift.</p></div><code>NEXT_PUBLIC_DEMO_MODE=false</code></section>
      </div>
    </div>
  </>;
}
