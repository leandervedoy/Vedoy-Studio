import type { Metadata } from "next";
import Link from "next/link";
import { cloudSession } from "@/lib/vedoy-cloud";
import { CloudWorkspace } from "@/components/cloud/cloud-workspace";
import "@/app/vedoy-cloud.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vedoy Cloud – Prosjekter", description: "Opprett prosjekter, koble offentlige GitHub-repositorier og lagre private filer i Vedoy Cloud." };

export default async function ProsjekterPage() {
  const session = await cloudSession();
  if (session) return <CloudWorkspace userName={session.name} />;
  return <div className="vedoy-cloud__landing">
    <nav><Link href="/">VEDØY STUDIO</Link><Link href="/studio">Growth ↗</Link></nav>
    <main>
      <span className="vedoy-cloud__eyebrow">VEDOY CLOUD / BETA</span>
      <h1>Dine ideer.<br /><em>Samlet i skyen.</em></h1>
      <p>Gi prosjektene dine et hjem. Koble et offentlig GitHub-repositorium, opprett et nytt prosjekt eller last opp en mappe. Private filer, enkel organisering og innlogging med Vedøy Login.</p>
      <Link className="start" href="/api/auth/login?next=%2Fprosjekter">Fortsett med Vedøy Login ↗</Link>
      <section className="cloud-info" aria-label="Funksjoner">
        <span><strong>01 · PROSJEKTER</strong><br />Opprett og organiser egne prosjekter.</span>
        <span><strong>02 · GITHUB</strong><br />Koble offentlige repoer. Ingen kode kopieres automatisk.</span>
        <span><strong>03 · PRIVAT SKY</strong><br />Last opp filer og mapper. 100 MB testkvote.</span>
      </section>
      <footer>Beta · Filer lagres i Supabase eu-north-1 (Sverige), ikke garantert i Norge. <Link href="/privacy">Personvern</Link></footer>
    </main>
  </div>;
}
