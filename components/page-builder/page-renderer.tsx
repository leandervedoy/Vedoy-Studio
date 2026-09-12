import Link from "next/link";
import type { BuilderBlock, BuilderPage } from "@/lib/page-builder";
import "./page-renderer.css";

function CallToAction({ block }: { block: BuilderBlock }) {
  const { ctaHref = "/#kontakt", ctaLabel = "Ta kontakt" } = block.content;
  return <Link className="builder-page-cta" href={ctaHref}>{ctaLabel} <span aria-hidden="true">↗</span></Link>;
}

function Block({ block }: { block: BuilderBlock }) {
  const { eyebrow, heading, body, items = [] } = block.content;
  if (block.type === "hero") return <section className="builder-block builder-hero"><p>{eyebrow}</p><h1>{heading}</h1><div><p>{body}</p><CallToAction block={block} /></div></section>;
  if (block.type === "features") return <section className="builder-block builder-features"><div><p>{eyebrow}</p><h2>{heading}</h2><p>{body}</p></div><div className="builder-item-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>;
  if (block.type === "pricing") return <section className="builder-block builder-pricing"><header><p>{eyebrow}</p><h2>{heading}</h2><p>{body}</p></header><div className="builder-price-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><span>{item.price}</span><h3>{item.title}</h3><p>{item.text}</p><CallToAction block={block} /></article>)}</div></section>;
  return <section className="builder-block builder-contact"><p>{eyebrow}</p><h2>{heading}</h2><p>{body}</p><CallToAction block={block} /></section>;
}

export function PageRenderer({ page, preview = false }: { page: BuilderPage; preview?: boolean }) {
  return <main className="builder-page"><div className="builder-page-nav"><Link href="/">VEDØY STUDIO</Link><span>{preview ? "FORHÅNDSVISNING" : page.title}</span></div>{page.blocks.length ? page.blocks.map((block) => <Block key={block.id} block={block} />) : <section className="builder-empty"><p>Denne siden har ingen blokker ennå.</p></section>}</main>;
}
