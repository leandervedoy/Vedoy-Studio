"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

type Props = { isOpen: boolean; onClose: () => void; projectKey?: string };

export function ForgeDesignTool({ isOpen, onClose, projectKey = "new-project" }: Props) {
  const [elements, setElements] = useState<readonly OrderedExcalidrawElement[]>([]);
  const storageKey = `vedoy-forge-ui-sketch:${projectKey}`;

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      setElements(saved ? JSON.parse(saved) as OrderedExcalidrawElement[] : []);
    } catch { setElements([]); }
  }, [isOpen, storageKey]);

  if (!isOpen) return null;
  return <section className="forge-design-tool" role="dialog" aria-modal="true" aria-label="UI Sketch">
    <header><div><p className="builder-kicker">FORGE UI SKETCH</p><h2>Skisser før du bygger.</h2><p>Tegn knapper, skjermer og flyter. Skissen lagres lokalt for dette prosjektet.</p></div><button type="button" onClick={onClose} aria-label="Lukk UI Sketch">×</button></header>
    <div className="forge-design-tool__canvas"><Excalidraw key={storageKey} initialData={{ elements }} onChange={(nextElements) => {
      setElements(nextElements);
      try { window.localStorage.setItem(storageKey, JSON.stringify(nextElements)); } catch { /* Local storage can be unavailable in private browsing. */ }
    }} /></div>
    <footer><span>{elements.length ? `${elements.length} elementer i skissen` : "Tegn første komponent"}</span><button type="button" onClick={() => { window.localStorage.removeItem(storageKey); setElements([]); }}>Tøm skisse</button></footer>
  </section>;
}
