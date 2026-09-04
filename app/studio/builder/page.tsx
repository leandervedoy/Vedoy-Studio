import { ModuleHeader } from "@/components/studio/module-header";

const templates = [
  { name: "Nordic Service", type: "Tjenestebedrift", accent: "#dfb934", blocks: ["Hero", "Tjenester", "Booking", "Omtaler"] },
  { name: "Quiet Commerce", type: "Nettbutikk", accent: "#8b5cf6", blocks: ["Kolleksjon", "Produkter", "Historie", "Nyhetsbrev"] },
  { name: "Local Studio", type: "Kreativ bedrift", accent: "#2563eb", blocks: ["Arbeider", "Om", "Prosess", "Kontakt"] }
];

export default function BuilderPage() {
  return <><ModuleHeader eyebrow="BYGG" title="Vedøy Builder" description="Sett sammen en profesjonell nettside fra rolige, responsive seksjoner." badge="PROTOTYPE" /><div className="builder-banner"><div><span>▦</span><div><small>VISUELL NETTSIDEBYGGER</small><h2>Velg en mal. Tilpass innholdet. Publiser gjennom Hosting.</h2><p>Dette området er en gjennomført UI-prototype. Lagring og dra-og-slipp-motor er neste tekniske steg.</p></div></div><button className="button button--dark">Start tom side</button></div><div className="template-grid">{templates.map((template) => <article key={template.name}><div className="template-preview" style={{ "--template-accent": template.accent } as React.CSSProperties}><header><i /><i /><i /></header><section><span /><h3 /><p /><button /></section><footer>{template.blocks.map((block) => <i key={block} />)}</footer></div><div><small>{template.type}</small><h2>{template.name}</h2><p>{template.blocks.join(" · ")}</p><button className="button button--ghost button--wide">Bruk denne malen</button></div></article>)}</div></>;
}
