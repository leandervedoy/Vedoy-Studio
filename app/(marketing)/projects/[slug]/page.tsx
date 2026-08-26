import Link from "next/link";
import { notFound, redirect } from "next/navigation";
const details: Record<string, { title: string; text: string; points: string[] }> = {
  builder: { title: "Vedøy Builder", text: "En rolig byggeflate for profesjonelle nettsider.", points: ["Seksjonsbasert redigering", "Designsystem og temaer", "Forhåndsvisning før publisering"] },
  email: { title: "Vedøy E-post", text: "En samlet Vedøy-innboks for profesjonell e-post.", points: ["Domene-e-post og teaminnboks", "Redigerbare svarmaler", "Varsler og oppfølging"] },
  database: { title: "Vedøy Database", text: "Et oversiktlig og sikkert sted for dataene tjenestene dine bygger på.", points: ["PostgreSQL-prosjekter", "Sikre tilkoblinger og miljøer", "Backup- og statusoversikt"] },
  hosting: { title: "Vedøy Hosting", text: "Kommer snart. Hostingflyten er under utvikling og vises foreløpig som en ikke-bindende forhåndsvisning.", points: ["Planlagt publisering og deploy", "Planlagt DNS, SSL og backup", "Samlet support og drift når tjenesten åpner"] }
};
export function generateStaticParams() { return Object.keys(details).map((slug) => ({ slug })); }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (slug === "email") redirect("https://mail.vedoystudio.no"); const detail = details[slug]; if (!detail) notFound(); return <section className="project-detail-editorial"><div className="project-detail-editorial__inner"><Link href="/#prosjekter">← Tilbake til Vedøy Studio</Link><p className="editorial-kicker lime">VEDØY STUDIO · UNDER ARBEID</p><h1>{detail.title}<br /><em>kommer steg for steg.</em></h1><p>{detail.text}</p><div><h2>Dette bygger vi</h2><ul>{detail.points.map((point) => <li key={point}>{point}</li>)}</ul></div><Link className="editorial-button" href="/#kontakt">Snakk med oss <span>↗</span></Link></div></section>; }
