import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { getLoginCredentials, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Logg inn" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requestedNext = (await searchParams).next;
  const next = requestedNext?.startsWith("/studio") ? requestedNext : "/studio";
  if (await getSession()) redirect(next);
  const { demoAllowed } = getLoginCredentials();
  return <main className="login-page"><section className="login-side"><Brand inverse /><div><p className="eyebrow">ETT STED FOR ALT DIGITALT</p><h1>Velkommen inn i Studio.</h1><p>Utforsk domener, hosting, booking, analyse, Vedi og personlig support i en sammenhengende arbeidsflate.</p></div><blockquote>«Teknologi skal gjøre hverdagen enklere, tryggere og mer inspirerende.»</blockquote></section><section className="login-panel"><div className="login-panel__inner"><Link href="/" className="back-link">← Til forsiden</Link><small>VEDØY STUDIO</small><h2>Logg inn</h2><p>Administratorinnlogging for Vedøy Studio.</p><LoginForm demoAllowed={demoAllowed} next={next} /></div></section></main>;
}
