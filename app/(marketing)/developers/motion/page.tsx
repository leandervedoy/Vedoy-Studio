import type {Metadata} from "next";
import Link from "next/link";
import {MotionEditor} from "@/components/motion/motion-editor";
import "./motion.css";
export const metadata:Metadata={
 title:"Vedoy Motion – Animation Engine for Websites",
 description:"Animate web objects with fade, slide, roll, shrink, screen-based movement and simple VedoyScript commands. Explore a live animation playground.",
 alternates:{canonical:"/developers/motion"}
};
const features=[
 ["Animate everything on web","Move, fade, rotate, shrink and scale HTML or SVG elements. Create custom CSS keyframes for almost any browser-animatable visual property."],
 ["Screen-aware positions","Move from 5% to 85% of the viewport. Positions adjust to the user's screen size whenever a scene starts."],
 ["Timeline & scenes","Combine effects, play several elements on separate tracks, delay movements, pause and reverse animations."],
 ["VedoyScript or JavaScript","Use intuitive language without code punctuation or create fluent JavaScript animations with a few commands."],
 ["AI Animation Studio (planned)","Describe an animation in natural language. A future assistant will suggest a scene, inspect the result and offer iterations."],
 ["Creator Marketplace (planned)","Public profiles, reusable published animations and clearly licensed free or paid templates. No account or checkout is activated yet."]
] as const;
export default function MotionPage(){return <div className="vm-page">
 <header className="vm-nav"><Link href="/developers/motion">◆ Vedoy Motion</Link>
  <nav aria-label="Vedoy developer products"><Link href="/developers">Developers</Link><Link href="/developers/forma">Forma</Link><Link href="/developers/forge">Forge</Link></nav>
 </header>
 <main className="vm-main">
  <section className="vm-hero">
   <p className="vm-eyebrow">VEDOY MOTION · ANIMATION ENGINE · PRIVATE BETA</p>
   <h1>Make things <span>move.</span></h1>
   <p>Fra små webanimasjoner til flerdelte historier. Vedoy Motion lar deg animere skjermobjekter fra punkt til punkt, kombinere visuelle effekter og bygge animerte scener med JavaScript eller VedoyScript.</p>
   <div className="vm-tags">{["Fade in / out","Slide","Roll","Shrink","Grow","Screen coordinates","Timelines","Reduced motion"].map(x=><span key={x}>{x}</span>)}</div>
  </section>
  <MotionEditor/>
  <section className="vm-feature-grid" aria-label="Motion capabilities">
   {features.map(([title,detail])=><article key={title}><h3>{title}</h3><p>{detail}</p></article>)}
  </section>
  <section className="vm-editor">
   <p className="vm-eyebrow">EXAMPLE API</p><h2>Simple commands, real motion.</h2>
   <p>Under finnes to uttrykksmåter for samme prinsipp. JavaScript-koden kan bruke en navngitt aktør. VedoyScript bruker en enkel, avgrenset kommandosyntaks.</p>
   <pre className="vm-code"><code>{`// JavaScript
import { actor, screen } from "@vedoy/motion";
const Sirkelmednavn = actor(document.getElementById("Circle"));
Sirkelmednavn.motion(screen(85, 50))
  .fadein(screen(-15, 50))
  .speed(4)
  .play();

// VedoyScript
Animate Circle.
  From Screen -15 50.
  FadeIn.
  To Screen 85 50.
  Speed 4.
  Play.`}</code></pre>
   <p className="vm-caption">Pakkeimporten er foreslått for en fremtidig npm-utgivelse. Denne betaen ligger foreløpig i Vedoy Studio-kildekoden.</p>
  </section>
 </main>
 <footer className="vm-nav"><span>Vedoy Motion · Animations for the web</span><Link href="/developers">Back to Developers</Link></footer>
 </div>}