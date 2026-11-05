import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { getSession } from "@/lib/auth";
import { cloudIdentity } from "@/lib/vedoy-cloud-auth";
import { safeStudioNext } from "@/lib/vedoy-owner-access.mjs";

export const metadata: Metadata = { title: "Logg inn" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; authError?: string }>;
}) {
  const params = await searchParams;
  const next = safeStudioNext(params.next);
  if (next === "/prosjekter" || next === "/projects") {
    if (await cloudIdentity()) redirect(next);
  } else if (await getSession()) redirect(next);
  const loginHref = `/api/auth/login?next=${encodeURIComponent(next)}`;

  return (
    <main className="login-page">
      <section className="login-side">
        <Brand inverse />
        <div>
          <p className="eyebrow">ÉN KONTO · ALLE VEDØY-PROSJEKTER</p>
          <h1>Fortsett med Vedøy Login.</h1>
          <p>Logg inn eller registrer kontoen din på den felles og sikre innloggingssiden.</p>
        </div>
        <blockquote>Identiteten din er felles. Tilgang og data holdes adskilt i hvert prosjekt.</blockquote>
      </section>
      <section className="login-panel">
        <div className="login-panel__inner">
          <Link href="/" className="back-link">← Til forsiden</Link>
          <small>VEDØY STUDIO</small>
          <h2>Logg inn</h2>
          <p>Du sendes til Vedøy Login og returnerer automatisk til Studio.</p>
          {params.authError && <p className="form-error" role="alert">{params.authError}</p>}
          <Link className="button button--dark button--wide" href={loginHref}>Fortsett med Vedøy Login →</Link>
        </div>
      </section>
    </main>
  );
}
