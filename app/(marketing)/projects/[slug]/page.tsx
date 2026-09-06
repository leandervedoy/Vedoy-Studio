import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { studioProducts } from "@/lib/products";

type ProjectDetail = {
  title: string;
  text: string;
  points: string[];
  actionHref: string;
  actionLabel: string;
  status: "Publisert" | "Beta" | "Planlagt";
  category: string;
  image?: { src: string; alt: string };
};

const projectOverrides: Record<string, ProjectDetail> = {
  assist: {
    title: "Vedøy Assist",
    text: "Personlig teknologihjelp for PC, mobil, TV, internett og digitale spørsmål — forklart steg for steg.",
    points: ["Fjernhjelp og personlig oppfølging", "Hjemmebesøk i Haugesund", "Trygg hjelp uten unødvendig fagspråk"],
    actionHref: "https://vedoyassist.no",
    actionLabel: "Åpne Vedøy Assist",
    status: "Publisert",
    category: "IT-hjelp / service",
    image: { src: "/projects/vedoy-assist.png", alt: "Vedøy Assist" }
  },
  collective: {
    title: "Vedøy Collective",
    text: "Nettbutikk, kolleksjoner og merkevarearbeid som kobler digital handel med Vedøys kreative retning.",
    points: ["Kolleksjoner og produktpresentasjon", "Nettbutikk og merkevare", "Et praktisk laboratorium for commerce og vekst"],
    actionHref: "https://vedoycollective.no",
    actionLabel: "Åpne Vedøy Collective",
    status: "Publisert",
    category: "Commerce / brand",
    image: { src: "/projects/vedoy-collective.jfif", alt: "Vedøy Collective-prosjekt" }
  },
  "omnicart-tycoon": {
    title: "Omnicart Tycoon",
    text: "En interaktiv e-commerce-simulator der produktvalg, leverandører, månedlige kostnader, lager, ordre og vekst påvirker samme butikk.",
    points: ["Produkt-, leverandør- og kolleksjonsvalg", "Lager, ordre, marginer og månedlige utgifter", "Scenarioer for markedsføring, oppgraderinger og vekst"],
    actionHref: "https://vedoy-eccomerce-game.vercel.app/",
    actionLabel: "Spill Omnicart Tycoon",
    status: "Beta",
    category: "Simulator / commerce",
    image: { src: "/projects/omnicart-tycoon.jfif", alt: "Omnicart Tycoon e-commerce simulator" }
  }
};

const statusLabels = { live: "Publisert", beta: "Beta", planned: "Planlagt" } as const;

function getProject(slug: string): ProjectDetail | undefined {
  const override = projectOverrides[slug];
  if (override) return override;

  const product = studioProducts.find((item) => item.id === slug);
  if (!product) return undefined;

  return {
    title: product.name,
    text: product.description,
    points: product.highlights,
    actionHref: product.status === "planned" ? "/#kontakt" : product.href,
    actionLabel: product.status === "planned" ? "Meld interesse" : product.href.startsWith("/studio") ? "Åpne i Vedøy Growth" : `Åpne ${product.name}`,
    status: statusLabels[product.status],
    category: product.group
  };
}

export function generateStaticParams() {
  return [...new Set([...studioProducts.map((product) => product.id), ...Object.keys(projectOverrides)])].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.text } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const external = project.actionHref.startsWith("http");

  return (
    <main className="project-detail-editorial">
      <div className="project-detail-editorial__inner">
        <Link href="/#prosjekter">← Tilbake til forsiden</Link>
        <div className="project-detail-editorial__meta">
          <span>{project.status}</span>
          <span>{project.category}</span>
        </div>
        <p className="editorial-kicker lime">VEDØY-ØKOSYSTEMET · PROSJEKT</p>
        <h1>{project.title}<br /><em>forklart.</em></h1>
        <p>{project.text}</p>
        {project.image ? <img className="project-detail-editorial__media" src={project.image.src} alt={project.image.alt} /> : null}
        <section>
          <small>DETTE INNEHOLDER PROSJEKTET</small>
          <h2>Bygget for et<br /><em>tydelig behov.</em></h2>
          <ul>{project.points.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
        <div className="project-detail-editorial__actions">
          {external ? (
            <a className="editorial-button" href={project.actionHref} target="_blank" rel="noreferrer">{project.actionLabel} <span>↗</span></a>
          ) : (
            <Link className="editorial-button" href={project.actionHref}>{project.actionLabel} <span>↗</span></Link>
          )}
          <Link className="editorial-outline" href="/#kontakt">Snakk med Vedøy Studio</Link>
        </div>
      </div>
    </main>
  );
}
