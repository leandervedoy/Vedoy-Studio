import { ModuleHeader } from "@/components/studio/module-header";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireSession();
  return (
    <>
      <ModuleHeader
        eyebrow="VEDØY GROWTH"
        title="Konto og profil"
        description="Se kontoinformasjon og sikkerhet for Vedøy-kontoen."
      />
      <div className="settings-content">
        <section className="studio-panel">
          <div className="panel-heading"><div><small>SIKKERHET</small><h2>Innlogging</h2></div></div>
          <p><strong>{session.email}</strong><br />Rollen din er <strong>{session.role === "owner" ? "Administrator" : session.role}</strong>. Tilgang styres av Vedøy Login.</p>
        </section>
      </div>
    </>
  );
}
