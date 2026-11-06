"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type StoryChapter = { title: string; body: string; cameraZ: number };
export const DEFAULT_CHAPTERS: StoryChapter[] = [
  { title: "En grønnere fremtid", body: "Utforsk hvordan vindkraft fungerer.", cameraZ: 22 },
  { title: "Energi i bevegelse", body: "Rotorbladene omdanner vindens bevegelse til elektrisitet.", cameraZ: 8 },
  { title: "Hva skjer videre?", body: "Energisystemer må planlegges med hensyn til natur og samfunn.", cameraZ: -7 }
];
export function VeDoThreeStory({ chapters = DEFAULT_CHAPTERS }: { chapters?: StoryChapter[] }) {
  const mount = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(motion);
    if (motion) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#b7dfeb");
    scene.fog = new THREE.Fog("#b7dfeb", 25, 100);
    const camera = new THREE.PerspectiveCamera(65, 1, .1, 150);
    camera.position.set(0, 3, 22);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x64805c, 2.5));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(150,150), new THREE.MeshLambertMaterial({color:"#79b75e"}));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -1; scene.add(ground);
    const turbines: THREE.Group[] = [];
    for (let i=0; i<8; i++) {
      const g = new THREE.Group();
      const white = new THREE.MeshStandardMaterial({color:"#f7faf9"});
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.13,.24,7,12), white);
      pole.position.y = 2.5; g.add(pole);
      const rotor = new THREE.Group(); rotor.position.y = 6.2;
      const hub = new THREE.Mesh(new THREE.SphereGeometry(.28,12,12),white); rotor.add(hub);
      for (let j=0;j<3;j++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(.22,3.2,.09),white);
        blade.position.y=1.7; blade.rotation.z=j*Math.PI*2/3;
        const pivot = new THREE.Group(); pivot.rotation.z=j*Math.PI*2/3;
        blade.rotation.z=0; pivot.add(blade); rotor.add(pivot);
      }
      g.add(rotor); g.position.set((i%2?1:-1)*(4+(i%3)*2),0,10-i*7);
      scene.add(g); turbines.push(rotor);
    }
    let frame=0, p=0, target=0;
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const onScroll=()=>{const rect=el.parentElement!.getBoundingClientRect(); const travel=Math.max(1,el.parentElement!.clientHeight-innerHeight);target=Math.max(0,Math.min(1,-rect.top/travel));setProgress(target);};
    resize(); onScroll();
    const observer = new ResizeObserver(resize); observer.observe(el);
    window.addEventListener("scroll",onScroll,{passive:true});
    const tick=()=>{frame=requestAnimationFrame(tick);p+=(target-p)*.06;camera.position.z=22-29*p;camera.position.x=Math.sin(p*Math.PI*2)*1.3;camera.lookAt(0,2,camera.position.z-12);turbines.forEach((t,i)=>t.rotation.z+=.005+i*.0003);renderer.render(scene,camera);};
    tick();
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",onScroll);observer.disconnect();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  const index=Math.min(chapters.length-1,Math.floor(progress*chapters.length));
  return <section style={{height:reduced?"auto":"300vh",position:"relative"}} aria-label="Interaktiv 3D-artikkel">
    <div style={{position:reduced?"relative":"sticky",top:0,height:reduced?"auto":"100vh",overflow:"hidden",background:"#b7dfeb"}}>
      <div ref={mount} aria-hidden="true" style={{position:"absolute",inset:0}}/>
      <div aria-live="off" style={{position:"relative",zIndex:1,maxWidth:520,padding:"clamp(24px,6vw,90px)",color:"#10251b",textShadow:"0 1px 12px #ffffffa8"}}>
        <p>VeDo · Interactive Story</p><h2 style={{fontSize:"clamp(30px,5vw,64px)"}}>{chapters[index]?.title}</h2><p style={{fontSize:20}}>{chapters[index]?.body}</p>
        <p style={{fontSize:14}}>{reduced?"Tilgjengelig tekstversjon":"Scroll for å utforske"}</p>
      </div>
      {reduced&&<ol>{chapters.map((c,i)=><li key={i}><h3>{c.title}</h3><p>{c.body}</p></li>)}</ol>}
    </div>
  </section>;
}
