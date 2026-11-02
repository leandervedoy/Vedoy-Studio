import Link from "next/link";
import type { ServiceStory } from "@/lib/service-stories";

function Preview({ story, example }: { story: ServiceStory; example: ServiceStory["examples"][number] }) {
  const items = example.items;
  return (
    <div className={`service-demo service-demo--${story.preview}`} aria-label={`Illustrasjon: ${example.title}`}>
      <div className="service-demo__top"><span className="service-demo__dots"><i/><i/><i/></span><span>VEDØY / KONSEPTVISNING</span><span>✦</span></div>
      <div className="service-demo__content">
        <div className="service-demo__eyebrow">{example.audience} · DEMO</div>
        {story.preview === "phone" ? <div className="service-demo__big-icon" aria-hidden="true">☎</div> : null}
        {story.preview === "rewards" ? <div className="service-demo__big-icon" aria-hidden="true">✳</div> : null}
        {story.preview === "infra" ? <div className="service-demo__big-icon" aria-hidden="true">◎</div> : null}
        <h3>{example.title}</h3>
        <p>{example.result}</p>
        <div className="service-demo__tiles">{items.map((item,index)=><div className="service-demo__tile" key={item}><span>{index===0?"↗":index===1?"◇":"+"}</span><strong>{item}</strong></div>)}</div>
        <div className="service-demo__footer"><span>UTFORMET FOR {example.audience.toLocaleUpperCase("nb-NO")}</span><span>EKSEMPEL · IKKE KUNDECASE</span></div>
      </div>
    </div>
  );
}

export function ServiceShowcase({ story, upcoming }: { story: ServiceStory; upcoming: boolean }) {
  return (
    <div className="service-story" style={{ "--story-accent": story.accent } as React.CSSProperties}>
      <section className="service-story__intro" aria-labelledby="service-story-title">
        <div><p className="service-story__eyebrow">UTFORSK MULIGHETENE / {story.slug.toLocaleUpperCase("nb-NO").replaceAll("-"," ")}</p><h2 id="service-story-title">Se hva vi kan<br/><em>skape sammen.</em></h2></div>
        <div><p>{story.statement}</p><span className="service-story__intro-note">{upcoming ? "KONSEPTER · IKKE TILGJENGELIG ENNÅ" : "ILLUSTRASJONER · EKSEMPLER PÅ MULIGE LEVERANSER"}</span></div>
      </section>
      <section className="service-story__examples" aria-labelledby="service-examples-title">
        <div className="service-story__section-header"><span>01 / BRUKSOMRÅDER</span><h2 id="service-examples-title">Tre måter å bruke løsningen på.</h2><p>Velg eksempelet som ligner mest på din bedrift. Alle eksemplene er illustrasjoner, ikke tidligere kundeoppdrag.</p></div>
        <div className="service-story__example-grid">{story.examples.map((example,index)=>
          <article className="service-story__example" key={example.title}>
            <div className="service-story__example-title"><span>0{index+1} / {example.audience}</span><h3>{example.title}</h3></div>
            <Preview story={story} example={example}/>
            <div className="service-story__example-bottom"><div><span>UTFORDRING</span><p>{example.challenge}</p></div><div><span>MULIG LØSNING</span><p>{example.result}</p></div></div>
          </article>
        )}</div>
      </section>
      <section className="service-story__decision" aria-labelledby="service-decision-title">
        <div><span className="service-story__eyebrow">02 / HVORDAN STARTE</span><h2 id="service-decision-title">{upcoming ? "Vær med fra starten." : "Start lite. Bygg videre."}</h2><p>{upcoming ? "Dette produktet er under utvikling. Fortell oss hva du trenger, så kan vi vurdere det når vi planlegger en pilot." : "Vi tar utgangspunkt i den minste løsningen som gir verdi. Du får avklart omfang og pris før vi starter."}</p><Link className="service-story__action" href="/#kontakt">{upcoming ? "Meld interesse" : "Be om et uforpliktende forslag"} <span aria-hidden="true">↗</span></Link></div>
        <div className="service-story__steps"><div><b>01</b><span>{upcoming?"Fortell om behovet":"Beskriv utfordringen"}</span></div><div><b>02</b><span>{upcoming?"Vi vurderer en pilot":"Få et konkret forslag"}</span></div><div><b>03</b><span>{upcoming?"Vi gir beskjed ved lansering":"Godkjenn før vi bygger"}</span></div></div>
      </section>
      <section className="service-story__faq" aria-labelledby="service-faq-title"><div><span className="service-story__eyebrow">03 / OFTE SPURT</span><h2 id="service-faq-title">Greit å vite.</h2></div><div>{story.faq.map(item=><details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>
    </div>
  );
}
