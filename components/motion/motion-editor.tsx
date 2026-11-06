"use client";
import {useEffect,useRef,useState} from "react";
import {motion,screen,runVedoyScript,presets} from "@/packages/vedoy-motion/index.mjs";
const effects=["fadeIn","fadeOut","slideToLeft","slideToRight","rollOutToLeft","rollOutToRight","shrink","grow","bounce","spin","pop","blurIn","blurOut","pulse","float","shake","slideInFromLeft","slideInFromRight"];
const defaultScript="Animate Circle.\n  From Screen -15 50.\n  FadeIn.\n  To Screen 85 50.\n  Speed 4.\n  Play.";
export function MotionEditor(){
 const stage=useRef<HTMLDivElement>(null);
 const dot=useRef<HTMLDivElement>(null);
 const active=useRef<{cancel:()=>unknown}|null>(null);
 const [effect,setEffect]=useState("fadeIn");
 const [speed,setSpeed]=useState(4);
 const [endX,setEndX]=useState(80);
 const [endY,setEndY]=useState(50);
 const [script,setScript]=useState(defaultScript);
 const [mode,setMode]=useState<"visual"|"script">("visual");
 const [status,setStatus]=useState("Klar til forhåndsvisning");
 const [reduce,setReduce]=useState(false);
 const [playCount,setPlayCount]=useState(0);
 useEffect(()=>()=>{active.current?.cancel()},[]);
 const demo=()=>{
  if(!stage.current||!dot.current)return;
  active.current?.cancel();
  dot.current.getAnimations().forEach(animation=>animation.cancel());
  const rect=stage.current.getBoundingClientRect();
  const frame={width:Math.max(1,rect.width),height:Math.max(1,rect.height)};
  // Viewport coordinate engine supports arbitrary stage dimensions.
  const display=dot.current;
  display.style.transform="none";
  display.style.opacity="1";
  try{
   const sequence=motion(display);
   if(mode==="script"){
    const lines=script.replace(/\bCircle\b/g,"Circle");
    const player=runVedoyScript(lines,{root:{getElementById:(id:string)=>id==="Circle"?display:null} as Document,viewport:frame,reducedMotion:reduce});
    active.current=player;
    setStatus("VedoyScript kjører");
   } else {
    sequence.from(screen(5,50)).to(screen(endX,endY)).speed(speed);
    const functions:Record<string,()=>unknown>={
      fadeIn:()=>sequence.fadeIn(),fadeOut:()=>sequence.fadeOut(),
      slideToLeft:()=>sequence.slideToLeft(),slideToRight:()=>sequence.slideToRight(),
      rollOutToLeft:()=>sequence.rollOutToLeft(),rollOutToRight:()=>sequence.rollOutToRight(),
      shrink:()=>sequence.shrink(),grow:()=>sequence.grow(),bounce:()=>sequence.bounce(),
      spin:()=>sequence.spin(),pop:()=>sequence.pop(),blurIn:()=>sequence.blurIn(),
      blurOut:()=>sequence.blurOut(),pulse:()=>sequence.pulse(),float:()=>sequence.float(),
      shake:()=>sequence.shake(),slideInFromLeft:()=>sequence.slideInFromLeft(),
      slideInFromRight:()=>sequence.slideInFromRight()
    };
    functions[effect]?.();
    const player=sequence.play({viewport:frame,reducedMotion:reduce});
    active.current=player;
    setStatus("Spiller "+effect);
   }
   setPlayCount(n=>n+1);
  }catch(err){setStatus(err instanceof Error?err.message:"Kunne ikke spille av")}
 };
 const generated=`import { motion, screen } from "@vedoy/motion";\nmotion("#Circle").from(screen(5,50)).to(screen(${endX},${endY})).${effect}().speed(${speed}).play();`;
 const save=()=>{
  const doc={schemaVersion:1,title:"Untitled Motion",effect,speed,endX,endY,mode,script};
  try{localStorage.setItem("vedoy-motion-draft",JSON.stringify(doc));setStatus("Utkast lagret lokalt på denne enheten")}catch{setStatus("Lokal lagring er ikke tilgjengelig")}
 };
 const load=()=>{
  try{const data=localStorage.getItem("vedoy-motion-draft");if(!data){setStatus("Ingen lagret animasjon");return}
   const parsed=JSON.parse(data);
   if(parsed.schemaVersion!==1||!effects.includes(parsed.effect))throw Error("Ugyldig utkast");
   setEffect(parsed.effect);setSpeed(Math.max(1,Math.min(10,Number(parsed.speed)||4)));
   setEndX(Math.max(0,Math.min(100,Number(parsed.endX)||80)));setEndY(Math.max(0,Math.min(100,Number(parsed.endY)||50)));
   setMode(parsed.mode==="script"?"script":"visual");
   setScript(typeof parsed.script==="string"?parsed.script.slice(0,12000):defaultScript);setStatus("Utkast hentet");
  }catch{setStatus("Lagret utkast kan ikke leses")}
 };
 return <section className="vm-editor" aria-labelledby="vm-editor-heading">
  <div className="vm-editor-head"><div><p className="vm-eyebrow">MOTION PLAYGROUND · LOKAL BETA</p><h2 id="vm-editor-heading">Animer nesten hva som helst på web.</h2><p>Velg effekt, retning, hastighet eller skriv VedoyScript. Start med sirkelen – bruk deretter samme motor på dine egne HTML- og SVG-elementer.</p></div></div>
  <div className="vm-editor-grid">
   <div className="vm-controls">
    <div className="vm-switch"><button type="button" aria-pressed={mode==="visual"} onClick={()=>setMode("visual")}>Visuell</button><button type="button" aria-pressed={mode==="script"} onClick={()=>setMode("script")}>VedoyScript</button></div>
    {mode==="visual"?<>
     <label>Effekt<select value={effect} onChange={e=>setEffect(e.target.value)}>{effects.map(value=><option value={value} key={value}>{value}</option>)}</select></label>
     <label>Hastighet: {speed}/10<input type="range" min="1" max="10" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label>
     <label>Horisontalt mål: {endX}%<input type="range" min="0" max="100" value={endX} onChange={e=>setEndX(Number(e.target.value))}/></label>
     <label>Vertikalt mål: {endY}%<input type="range" min="0" max="100" value={endY} onChange={e=>setEndY(Number(e.target.value))}/></label>
    </>:<label>VedoyScript-kode<textarea rows={10} spellCheck={false} value={script} onChange={e=>setScript(e.target.value)} aria-describedby="vm-script-hint"/><small id="vm-script-hint">Start med Animate Circle. Avslutt hver kommando med punktum.</small></label>}
    <label className="vm-check"><input type="checkbox" checked={reduce} onChange={e=>setReduce(e.target.checked)}/> Test redusert bevegelse</label>
    <div className="vm-actions"><button type="button" className="vm-primary" onClick={demo}>▶ Spill av</button><button type="button" onClick={()=>{active.current?.cancel();setStatus("Stoppet")}}>Stopp</button><button type="button" onClick={save}>Lagre utkast</button><button type="button" onClick={load}>Hent utkast</button></div>
   </div>
   <div className="vm-output">
    <div className="vm-top"><strong>Forhåndsvisning</strong><span role="status" aria-live="polite">{status}</span></div>
    <div className="vm-stage" ref={stage}><div id="Circle" ref={dot} className="vm-dot" aria-label="Animert sirkel"><span>V</span></div><div className="vm-stage-label">0 % → 100 %</div></div>
    <div className="vm-top"><strong>{mode==="visual"?"JavaScript":"VedoyScript"}</strong><button type="button" onClick={()=>navigator.clipboard?.writeText(mode==="visual"?generated:script).then(()=>setStatus("Kode kopiert")).catch(()=>setStatus("Kunne ikke kopiere"))}>Kopier kode</button></div>
    <pre className="vm-code"><code>{mode==="visual"?generated:script}</code></pre>
    <p className="vm-caption">Lagring skjer lokalt i nettleseren. Ingen KI, konto, videoeksport eller markedsplass er koblet til denne editoren ennå. Avspilling: {playCount} ganger.</p>
   </div>
  </div>
 </section>
}