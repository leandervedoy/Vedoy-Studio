"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { PRINT_PRODUCTS, estimateImageDpi, outputPixels, productById, renderPrintSvg, starterDesign, validateDesign, type PrintDesign, type PrintLayer, type ProductId, type TextLayer } from "../lib/print-engine/core";
const DRAFT_KEY = "vedoy_print_engine_draft_v1";
function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 2500); }
async function rasterize(svg: string, width: number, height: number): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nettleseren støtter ikke Canvas 2D.");
    context.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Kunne ikke eksportere PNG.")), "image/png"));
  } finally { URL.revokeObjectURL(url); }
}
export default function PrintEditor() {
  const [design, setDesign] = useState<PrintDesign>(() => starterDesign());
  const [selectedId, setSelectedId] = useState<string>("headline");
  const [notice, setNotice] = useState("Lokal designer. Ingen bestilling blir sendt.");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved && saved.length < 9_000_000) {
        const parsed = validateDesign(JSON.parse(saved));
        setDesign(parsed); setSelectedId(parsed.layers[0]?.id || "");
      }
    } catch { window.localStorage.removeItem(DRAFT_KEY); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(design)); } catch { setNotice("Lagringsplassen er full. Last ned designfilen."); } } }, [design, ready]);
  const product = productById(design.productId)!;
  const view = { width: 1000, height: Math.round(1000 * product.heightMm / product.widthMm) };
  const preview = useMemo(() => renderPrintSvg(design), [design]);
  const selected = design.layers.find(l => l.id === selectedId);
  function updateLayer(id: string, patch: Partial<PrintLayer>) {
    setDesign(current => ({ ...current, layers: current.layers.map(l => l.id === id ? { ...l, ...patch } as PrintLayer : l) }));
  }
  function addText() {
    if (design.layers.length >= 24) return setNotice("Maksimalt 24 lag.");
    const id = crypto.randomUUID();
    const layer: TextLayer = { id, kind: "text", x: 500, y: view.height / 2, rotation: 0, size: 46, text: "Din tekst", color: "#202820", font: "sans" };
    setDesign(d => ({ ...d, layers: [...d.layers, layer] })); setSelectedId(id);
  }
  async function addImage(file?: File) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) return setNotice("Bruk PNG, JPG eller WebP under 4 MB.");
    if (design.layers.length >= 24) return setNotice("Maksimalt 24 lag.");
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Kunne ikke lese fil.")); reader.readAsDataURL(file); });
    try {
      const img = new Image(); img.src = dataUrl; await img.decode();
      if (img.width * img.height > 40_000_000) throw new Error("For stort bilde.");
      const width = Math.min(720, Math.round(1000 * img.width / Math.max(img.width, img.height)));
      const height = Math.round(width * img.height / img.width);
      const id = crypto.randomUUID();
      const layer: PrintLayer = { id, kind: "image", x: 500, y: view.height / 2, width, height, rotation: 0, dataUrl };
      setDesign(d => ({ ...d, layers: [...d.layers, layer] })); setSelectedId(id);
      const dpi = estimateImageDpi(img.width, width, product);
      setNotice(dpi < 150 ? "Bildet kan bli uskarpt på trykk (" + dpi + " DPI)." : "Bilde lagt til (" + dpi + " DPI).");
    } catch { setNotice("Bildet kunne ikke leses."); }
  }
  function pointerMove(e: React.PointerEvent) {
    if (!drag.current || !selectedId || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const scaleX = view.width / rect.width, scaleY = view.height / rect.height;
    updateLayer(selectedId, { x: Math.round(Math.max(-500, Math.min(1500, drag.current.x + (e.clientX - drag.current.pointerX) * scaleX))), y: Math.round(Math.max(-500, Math.min(view.height + 500, drag.current.y + (e.clientY - drag.current.pointerY) * scaleY))) });
  }
  async function exportPng() {
    setBusy(true);
    try {
      const validated = validateDesign(design);
      const px = outputPixels(productById(validated.productId)!);
      download(await rasterize(renderPrintSvg(validated), px.width, px.height), "vedoy-" + validated.productId + "-300dpi.png");
      setNotice("PNG eksportert. Kontroller trykkflate og utfallende trykk hos produsenten.");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Eksport mislyktes."); } finally { setBusy(false); }
  }
  function exportProject() { download(new Blob([JSON.stringify(validateDesign(design), null, 2)], { type: "application/json" }), "vedoy-print-design.json"); }
  return <main className="print-shell">
    <header className="print-header"><a href="/">VEDØY <span>PRINT ENGINE</span></a><span>DESIGN STUDIO · BETA</span></header>
    <section className="print-heading"><p className="print-eyebrow">Gjør en idé til noe fysisk</p><h1>Design din egen <em>gave.</em></h1><p>En enkel, leverandøruavhengig printdesigner bygget av Vedøy. Lag ditt eget motiv og last ned en trykkfil.</p></section>
    <div className="print-workspace">
      <aside className="print-panel">
        <p className="print-eyebrow">01 / Produkt</p><label>Velg størrelse<select value={design.productId} onChange={e => { const id = e.target.value as ProductId; setDesign(d => ({ ...d, productId: id })); }}>{PRINT_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
        <p className="print-eyebrow print-space">02 / Verktøy</p>
        <div className="print-actions"><button type="button" onClick={addText}>＋ Legg til tekst</button><button type="button" onClick={() => fileRef.current?.click()}>↑ Last opp bilde</button></div>
        <input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void addImage(e.target.files?.[0]); e.target.value = ""; }} />
        <label>Bakgrunnsfarge<input type="color" value={design.background} onChange={e => setDesign(d => ({ ...d, background: e.target.value }))} /></label>
        <p className="print-eyebrow print-space">03 / Lag</p>
        <div className="print-layers">{design.layers.map((l, index) => <button key={l.id} className={selectedId === l.id ? "print-selected" : ""} onClick={() => setSelectedId(l.id)}>{index + 1}. {l.kind === "text" ? l.text.slice(0, 26) : "Bilde"}</button>)}</div>
        {selected && <div className="print-settings"><p className="print-eyebrow">Rediger lag</p>{selected.kind === "text" && <>
          <label>Tekst<textarea rows={3} maxLength={280} value={selected.text} onChange={e => updateLayer(selected.id, { text: e.target.value || " " })} /></label>
          <label>Skrifttype<select value={selected.font} onChange={e => updateLayer(selected.id, { font: e.target.value as TextLayer["font"] })}><option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Mono</option></select></label>
          <label>Tekststørrelse<input type="range" min={10} max={220} value={selected.size} onChange={e => updateLayer(selected.id, { size: Number(e.target.value) })} /></label>
          <label>Tekstfarge<input type="color" value={selected.color} onChange={e => updateLayer(selected.id, { color: e.target.value })} /></label></>}
          {selected.kind === "image" && <label>Bildebredde<input type="range" min={50} max={1200} value={selected.width} onChange={e => { const width = Number(e.target.value); updateLayer(selected.id, { width, height: Math.min(1700, Math.max(1, selected.height * width / selected.width)) }); }} /></label>}
          <label>Rotasjon<input type="range" min={-180} max={180} value={selected.rotation} onChange={e => updateLayer(selected.id, { rotation: Number(e.target.value) })} /></label>
          <div className="print-actions"><button onClick={() => setDesign(d => ({ ...d, layers: d.layers.filter(l => l.id !== selectedId) }))}>Fjern lag</button><button onClick={() => { const layers = [...design.layers]; const index = layers.findIndex(l => l.id === selectedId); if (index >= 0 && index < layers.length - 1) { const [layer] = layers.splice(index, 1); layers.push(layer); setDesign(d => ({ ...d, layers })); } }}>Til toppen</button></div>
        </div>}
      </aside>
      <div className="print-preview"><div className="print-preview-header"><span>FORHÅNDSVISNING</span><span>{product.widthMm} × {product.heightMm} mm</span></div>
        <div className="print-artboard" style={{ aspectRatio: product.widthMm + "/" + product.heightMm }} ref={stageRef} onPointerMove={pointerMove} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null}>
          <div aria-hidden="true" className="print-artwork" dangerouslySetInnerHTML={{ __html: preview }} />
          {design.layers.map(layer => <button key={layer.id} title="Flytt lag" type="button" className={"print-handle " + (selectedId === layer.id ? "active" : "")} style={{ left: (layer.x / view.width * 100) + "%", top: (layer.y / view.height * 100) + "%" }} onPointerDown={e => { setSelectedId(layer.id); drag.current = { pointerX: e.clientX, pointerY: e.clientY, x: layer.x, y: layer.y }; e.currentTarget.setPointerCapture(e.pointerId); }} aria-label={"Flytt " + layer.id} />)}
        </div>
        <p className="print-caption">Dra de små punktene for å flytte lagene. Utsnittet er kun en digital forhåndsvisning.</p>
      </div>
      <aside className="print-panel print-delivery"><p className="print-eyebrow">04 / Eksporter</p><h2>Fra skjerm til print.</h2><p>Designet lagres lokalt i denne nettleseren. Ingen bilder sendes til leverandører.</p>
        <div className="print-spec"><span>Oppløsning</span><strong>300 DPI</strong></div><div className="print-spec"><span>Trykkflate</span><strong>{outputPixels(product).width} × {outputPixels(product).height} px</strong></div>
        <button className="print-primary" onClick={() => void exportPng()} disabled={busy}>{busy ? "Eksporterer…" : "Last ned PNG ↗"}</button>
        <button className="print-secondary" onClick={exportProject}>Last ned prosjektfil</button>
        <label className="print-secondary print-import">Importer prosjektfil<input hidden type="file" accept="application/json,.json" onChange={async e => { const f = e.target.files?.[0]; if (!f || f.size > 9_000_000) return setNotice("Ugyldig eller for stor prosjektfil."); try { const next = validateDesign(JSON.parse(await f.text())); setDesign(next); setSelectedId(next.layers[0]?.id || ""); setNotice("Prosjektfil importert."); } catch { setNotice("Ugyldig prosjektfil."); } e.target.value = ""; }} /></label>
        <button className="print-secondary" onClick={() => { const next = starterDesign(); setDesign(next); setSelectedId("headline"); setNotice("Nytt design startet."); }}>Start på nytt</button>
        <p className="print-alert" role="status">{notice}</p>
        <small>Før produksjon: avklar papirtype, sikkerhetsmarginer, bleeds og leverandørens oppdaterte trykkspesifikasjon.</small>
      </aside>
    </div>
    <footer className="print-footer">© Vedøy · Made for ideas worth keeping <span>PRINT ENGINE v0.1</span></footer>
  </main>;
}