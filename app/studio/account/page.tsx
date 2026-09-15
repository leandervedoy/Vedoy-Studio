import { ModuleHeader } from "@/components/studio/module-header";
import { NewsProfileSettings } from "@/components/studio/news-profile-settings";
import { requireSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AccountPage(){const session=await requireSession();return <><ModuleHeader eyebrow="VEDØY GROWTH" title="Konto og profil" description="Administrer navnet og profilen som brukes i Vedøy News og andre moduler."/><div className="settings-content"><NewsProfileSettings initialName={session.name} initialAvatar={session.avatarUrl}/><section className="studio-panel"><div className="panel-heading"><div><small>SIKKERHET</small><h2>Innlogging</h2></div></div><p><strong>{session.email}</strong><br/>Rollen din er <strong>{session.role === "owner" ? "Administrator" : session.role}</strong>. Tilgang styres av Vedøy Login.</p></section></div></>;}
