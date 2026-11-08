"use client";

import { DragEvent } from "react";
import type { BuilderBlock, PageBlockType } from "@/lib/page-builder";

const labels: Record<PageBlockType, string> = { hero: "Start", features: "Funksjoner", pricing: "Priser", contact: "Kontakt" };

type Props = {
  blocks: BuilderBlock[];
  selectedBlockId: string;
  onSelect: (blockId: string) => void;
  onAdd: (type: PageBlockType) => void;
};

export function ForgeCanvas({ blocks, selectedBlockId, onSelect, onAdd }: Props) {
  function startDrag(event: DragEvent<HTMLButtonElement>, type: PageBlockType) {
    event.dataTransfer.setData("application/x-vedoy-forge-element", type);
    event.dataTransfer.effectAllowed = "copy";
  }

  function dropElement(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-vedoy-forge-element") as PageBlockType;
    if (type && type in labels) onAdd(type);
  }

  return <aside className="forge-panel" aria-label="Forge canvas">
    <header className="forge-panel__bar"><span>FORGE CANVAS</span><span className="forge-panel__status"><i /> Klar</span></header>
    <div className="forge-library" aria-label="Elementbibliotek">
      {(Object.keys(labels) as PageBlockType[]).map((type) => <button key={type} type="button" draggable onDragStart={(event) => startDrag(event, type)} onClick={() => onAdd(type)}>+ {labels[type]}</button>)}
    </div>
    <div className="forge-canvas" onDragOver={(event) => event.preventDefault()} onDrop={dropElement}>
      <div className="forge-canvas__device"><div className="forge-canvas__browser"><span>● ● ●</span><code>vedoy://scene</code><span>100%</span></div>
        <div className="forge-canvas__stage">
          {blocks.map((block, index) => <button type="button" key={block.id} className={`forge-node forge-node--${block.type}${block.id === selectedBlockId ? " is-selected" : ""}`} onClick={() => onSelect(block.id)} aria-pressed={block.id === selectedBlockId}>
            <span className="forge-node__tag">{String(index + 1).padStart(2, "0")} · {labels[block.type]}</span>
            <strong>{block.content.heading || "Uten navn"}</strong>
            <small>{block.content.body || "Klikk for å redigere dette elementet."}</small>
            {block.type === "hero" || block.type === "contact" ? <em>{block.content.ctaLabel || "Knapp"} ↗</em> : null}
            {block.type === "features" || block.type === "pricing" ? <div className="forge-node__items">{(block.content.items || []).slice(0, 3).map((item) => <span key={item.title}>{item.price || item.title}</span>)}</div> : null}
          </button>)}
          {!blocks.length ? <div className="forge-canvas__empty"><strong>Slipp første element her.</strong><span>Velg eller dra inn en startseksjon fra biblioteket.</span></div> : <div className="forge-canvas__drop">Slipp nytt element her</div>}
        </div>
      </div>
    </div>
  </aside>;
}
