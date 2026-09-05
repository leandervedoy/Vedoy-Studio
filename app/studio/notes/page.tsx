import { ModuleHeader } from "@/components/studio/module-header";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  return (
    <section className="studio-canvas-page">
      <ModuleHeader
        eyebrow="VEDØY GROWTH"
        title="Vedøy Canvas"
        description="Skisser, diagrammer og visuelle notater samlet i Studio. Eksporter som TXT, PDF, PNG, Word og dokumentfiler for Google Docs eller Proton Docs."
        badge="PRIVAT"
      />
      <div className="studio-canvas-frame">
        <div className="studio-canvas-frame__bar">
          <div><i aria-hidden /><span>Vedøy Canvas</span><small>Visuelt arbeidsområde</small></div>
          <a href="https://vedoy-canvas.vercel.app/" target="_blank" rel="noreferrer">Åpne fullskjerm ↗</a>
        </div>
        <iframe src="https://vedoy-canvas.vercel.app/" title="Vedøy Canvas" loading="eager" allow="clipboard-read; clipboard-write" />
        <noscript>JavaScript må være aktivert for å bruke Vedøy Canvas.</noscript>
      </div>
    </section>
  );
}
