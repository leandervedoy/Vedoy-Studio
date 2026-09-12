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
  status: "Publisert" | "Beta" | "Planlagt" | "Demo";
  category: string;
  image?: { src: string; alt: string };
  secondaryActions?: Array<{ href: string; label: string }>;
  note?: string;
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
  },
  calendar: {
    title: "Vedøy Calendar",
    text: "Kalenderlaget som binder booking, timeregistrering og arbeidsplan sammen i Vedøy Growth. Prosjektet bruker bookingpakken som visuell kalender, men lar data høre hjemme der de faktisk oppstår.",
    points: ["Bookingavtaler kan vises som kalenderhendelser", "Timeregistrering får dag-for-dag oversikt i Growth", "Google og Microsoft kan kobles senere når OAuth og kundekontoer er klart", "Konfliktkontroll og kapasitet kan brukes før en bestilling godkjennes", "Fungerer først som intern Growth-modul og kan pakkes videre som egen kalenderpakke"],
    actionHref: "/studio/hours",
    actionLabel: "Åpne timeregistrering",
    status: "Beta",
    category: "Drift / kalender",
    secondaryActions: [
      { href: "/studio/booking", label: "Åpne booking i Growth" },
      { href: "/booking", label: "Test offentlig booking" },
      { href: "/#kontakt", label: "Bestill kalenderoppsett" }
    ],
    note: "Vedøy Calendar er ikke en ekstern kalenderkonto ennå. Booking og timer kan vises i Studio, mens Google/Microsoft-synk settes opp som en egen integrasjon når kunden trenger det."
  }
};

const statusLabels = { live: "Publisert", beta: "Beta", planned: "Planlagt", demo: "Demo" } as const;

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
    actionLabel: product.status === "planned" ? "Bestill når klart" : product.status === "demo" ? "Åpne demo" : product.href.startsWith("/studio") ? "Åpne i Vedøy Growth" : `Åpne ${product.name}`,
    status: statusLabels[product.status],
    category: product.group,
    secondaryActions: product.status === "planned" ? [{ href: "/#kontakt", label: "Be om tidlig tilgang" }] : product.status === "demo" ? [{ href: "/#kontakt", label: "Bestill oppsett" }] : undefined,
    note: product.status === "planned"
      ? "Dette er merket Planlagt. Du kan melde interesse eller bestille en avklaring, men løsningen settes opp manuelt før noe blir aktivt for kunder."
      : product.status === "demo"
        ? "Dette er merket Demo. Funksjonen kan utforskes, men ekte kundeleveranse avtales og settes opp manuelt før bruk."
        : undefined
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
        {project.note ? <aside className="project-detail-editorial__notice"><strong>{project.status}</strong><p>{project.note}</p></aside> : null}
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
          {project.secondaryActions?.map((action) => action.href.startsWith("http") ? (
            <a key={action.href + action.label} className="editorial-outline" href={action.href} target="_blank" rel="noreferrer">{action.label}</a>
          ) : (
            <Link key={action.href + action.label} className="editorial-outline" href={action.href}>{action.label}</Link>
          ))}
          <Link className="editorial-outline" href="/#kontakt">Snakk med Vedøy Studio</Link>
        </div>
      </div>
    </main>
  );
}
