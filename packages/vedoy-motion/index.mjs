/** Vedoy Motion: a lightweight browser animation engine (HTML + SVG). */
export const version = "1.1.0-beta.1";
export const presets = Object.freeze([
  "fadeIn","fadeOut","slideToLeft","slideToRight","slideToTop","slideToBottom",
  "slideInFromLeft","slideInFromRight","rollOutToLeft","rollOutToRight",
  "shrink","grow","pop","blurIn","blurOut","bounce","shake","spin","pulse","float"
]);
const state=()=>({x:0,y:0,opacity:1,scale:1,rotate:0,blur:0});
const number=(n,name)=>{if(typeof n!=="number"||!Number.isFinite(n))throw new TypeError(name+" must be finite");return n;};
export const screen=(x,y)=>({x:number(x,"x"),y:number(y,"y"),unit:"screen"});
export const pixels=(x,y)=>({x:number(x,"x"),y:number(y,"y"),unit:"px"});
export function point(p){
  if(!p||typeof p!=="object")throw new TypeError("Point must have x,y");
  if(p.unit && !["screen","px"].includes(p.unit))throw new TypeError("Unit must be screen or px");
  return {x:number(p.x,"x"),y:number(p.y,"y"),unit:p.unit||"screen"};
}
export function durationForSpeed(value){
  number(value,"speed");
  if(value<1||value>10)throw new RangeError("Speed must be 1–10");
  return Math.round(2400-200*value);
}
const clip=()=>({from:null,to:null,mode:null,opacityFrom:null,opacityTo:null,
  scaleFrom:null,scaleTo:null,rotateTo:null,blurFrom:null,blurTo:null,
  keyframes:null,speed:5,duration:null,delay:0,easing:"ease-in-out",repeat:1});
const coords=(p,rect,view)=>p.unit==="screen"?
  {x:p.x*view.width/100-rect.left,y:p.y*view.height/100-rect.top}:
  {x:p.x-rect.left,y:p.y-rect.top};
const transform=(s,base)=>(base?base+" ":"")+"translate3d("+s.x+"px,"+s.y+"px,0) rotate("+s.rotate+"deg) scale("+s.scale+")";

/** Pure compiler, suitable for playback, testing and future visual analysis. */
export function compileFrames(c,{rect,viewport,previous,baseTransform=""}){
  if(!rect||!viewport)throw new Error("rect and viewport are required");
  const old={...state(),...previous},a={...old},b={...old};
  if(c.from)Object.assign(a,coords(point(c.from),rect,viewport));
  if(c.to)Object.assign(b,coords(point(c.to),rect,viewport));
  if(["slideToLeft","rollOutToLeft"].includes(c.mode))b.x=-rect.left-rect.width-24;
  if(["slideToRight","rollOutToRight"].includes(c.mode))b.x=viewport.width-rect.left+24;
  if(c.mode==="slideToTop")b.y=-rect.top-rect.height-24;
  if(c.mode==="slideToBottom")b.y=viewport.height-rect.top+24;
  if(c.mode==="slideInFromLeft")a.x=-rect.left-rect.width-24;
  if(c.mode==="slideInFromRight")a.x=viewport.width-rect.left+24;
  if(c.mode==="rollOutToLeft"){b.rotate=old.rotate-360;b.opacity=0;}
  if(c.mode==="rollOutToRight"){b.rotate=old.rotate+360;b.opacity=0;}
  if(c.mode==="shrink")b.scale=0.05;
  if(c.mode==="grow"){a.scale=0.35;b.scale=1;}
  if(c.mode==="pop"){a.scale=0.6;a.opacity=0;b.scale=1;b.opacity=1;}
  if(c.mode==="blurIn"){a.opacity=0;a.blur=15;b.opacity=1;b.blur=0;}
  if(c.mode==="blurOut"){b.opacity=0;b.blur=15;}
  if(c.mode==="spin")b.rotate=old.rotate+360;
  for(const [field,key,side] of [
    ["opacityFrom","opacity",a],["opacityTo","opacity",b],
    ["scaleFrom","scale",a],["scaleTo","scale",b],
    ["rotateTo","rotate",b],["blurFrom","blur",a],["blurTo","blur",b]
  ])if(c[field]!=null)side[key]=number(c[field],field);
  const frame=s=>({transform:transform(s,baseTransform),opacity:s.opacity,filter:"blur("+s.blur+"px)"});
  let frames=[frame(a),frame(b)];
  if(c.mode==="bounce")frames=[frame({...a,y:a.y-36}),frame({...b,y:b.y+8}),frame(b)];
  if(c.mode==="shake")frames=[frame({...a,x:a.x-9}),frame({...a,x:a.x+9}),frame({...a,x:a.x-6}),frame(b)];
  if(c.mode==="pulse")frames=[frame(a),frame({...a,scale:a.scale*1.13}),frame(b)];
  if(c.mode==="float")frames=[frame(a),frame({...a,y:a.y-18}),frame(b)];
  if(c.keyframes)frames=c.keyframes.map(f=>({...f}));
  return {frames,next:b};
}
const targets=(target,root)=>{
  const isEl=e=>e&&typeof e.animate==="function"&&typeof e.getBoundingClientRect==="function";
  if(typeof target==="string"){
    const d=root||(typeof document!=="undefined"?document:null);
    if(!d)throw new Error("Cannot resolve target without DOM");
    return [...d.querySelectorAll(target)].filter(isEl);
  }
  if(isEl(target))return [target];
  if(target&&typeof target[Symbol.iterator]==="function")return [...target].filter(isEl);
  throw new TypeError("Use an HTML/SVG element, selector or array of elements");
};
const running=new WeakMap();
class Playback{
  constructor(els,clips,options){
    this.els=els;this.clips=clips;this.options=options;this.animations=[];this.cancelled=false;
    els.forEach(el=>{running.get(el)?.cancel();running.set(el,this);});
    this.finished=this.run();
  }
  async run(){
    const view=this.options.viewport||{
      width:typeof window==="undefined"?1024:window.innerWidth,
      height:typeof window==="undefined"?768:window.innerHeight
    };
    const reduce=this.options.reducedMotion??(
      typeof window!=="undefined"&&typeof window.matchMedia==="function"&&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    const nodes=this.els.map(el=>{
      const t=typeof getComputedStyle==="function"?getComputedStyle(el).transform:"";
      return {el,rect:el.getBoundingClientRect(),baseTransform:t==="none"?"":t||"",prev:state()};
    });
    for(let i=0;i<this.clips.length&&!this.cancelled;i++){
      const c=this.clips[i],animations=[];
      for(const node of nodes){
        const compiled=compileFrames(c,{rect:node.rect,viewport:view,previous:node.prev,baseTransform:node.baseTransform});
        node.prev=compiled.next;
        const animation=node.el.animate(compiled.frames,{
          duration:reduce?1:c.duration??durationForSpeed(c.speed),
          delay:reduce?0:c.delay+(i===0?this.options.offset||0:0),
          easing:c.easing,iterations:reduce?1:c.repeat,fill:"forwards"
        });
        this.animations.push(animation);animations.push(animation);
        if(reduce)animation.finish?.();
      }
      await Promise.all(animations.map(a=>Promise.resolve(a.finished).catch(e=>{
        if(!this.cancelled&&e?.name!=="AbortError")throw e;
      })));
    }
    return !this.cancelled;
  }
  pause(){this.animations.forEach(a=>a.pause?.());return this;}
  resume(){this.animations.forEach(a=>a.play?.());return this;}
  reverse(){this.animations.forEach(a=>a.reverse?.());return this;}
  cancel(){this.cancelled=true;this.animations.forEach(a=>a.cancel?.());this.els.forEach(el=>{if(running.get(el)===this)running.delete(el)});return this;}
}
export class MotionBuilder{
  constructor(target,options={}){this.target=target;this.options=options;this.clips=[clip()];}
  get current(){return this.clips[this.clips.length-1];}
  from(v){this.current.from=point(v);return this;}
  to(v){this.current.to=point(v);return this;}
  moveTo(v){return this.to(v);}
  fadeIn(from){if(from)this.from(from);this.current.opacityFrom=0;this.current.opacityTo=1;return this;}
  fadein(v){return this.fadeIn(v);}
  fadeOut(to){if(to)this.to(to);this.current.opacityFrom=1;this.current.opacityTo=0;return this;}
  fadeout(v){return this.fadeOut(v);}
  slideToLeft(){this.current.mode="slideToLeft";return this;}
  slideToRight(){this.current.mode="slideToRight";return this;}
  slideToTop(){this.current.mode="slideToTop";return this;}
  slideToBottom(){this.current.mode="slideToBottom";return this;}
  slideInFromLeft(){this.current.mode="slideInFromLeft";return this;}
  slideInFromRight(){this.current.mode="slideInFromRight";return this;}
  rollOutToLeft(){this.current.mode="rollOutToLeft";return this;}
  rollOutToRight(){this.current.mode="rollOutToRight";return this;}
  shrink(){this.current.mode="shrink";return this;}
  grow(){this.current.mode="grow";return this;}
  pop(){this.current.mode="pop";return this;}
  blurIn(){this.current.mode="blurIn";return this;}
  blurOut(){this.current.mode="blurOut";return this;}
  bounce(){this.current.mode="bounce";return this;}
  shake(){this.current.mode="shake";return this;}
  spin(){this.current.mode="spin";return this;}
  pulse(){this.current.mode="pulse";return this;}
  float(){this.current.mode="float";return this;}
  scale(n){this.current.scaleTo=number(n,"scale");return this;}
  rotate(n){this.current.rotateTo=number(n,"rotate");return this;}
  opacity(n){this.current.opacityTo=Math.max(0,Math.min(1,number(n,"opacity")));return this;}
  speed(n){durationForSpeed(n);this.current.speed=n;return this;}
  duration(n){number(n,"duration");if(n<0||n>300000)throw new RangeError("Duration out of range");this.current.duration=n;return this;}
  delay(n){number(n,"delay");if(n<0||n>300000)throw new RangeError("Delay out of range");this.current.delay=n;return this;}
  easing(e){if(typeof e!=="string"||!/^(linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\([\d.,\s-]+\))$/.test(e))throw new RangeError("Invalid easing");this.current.easing=e;return this;}
  repeat(n){if(n!==Infinity&&(!Number.isInteger(n)||n<1||n>1000))throw new RangeError("Repeat out of range");this.current.repeat=n;return this;}
  keyframes(frames){if(!Array.isArray(frames)||frames.length<2||frames.length>120||frames.some(f=>!f||typeof f!=="object"||Array.isArray(f)))throw new TypeError("Expected 2–120 keyframe objects");this.current.keyframes=frames.map(f=>({...f}));return this;}
  then(){this.clips.push(clip());return this;}
  serialize(){return {version,clips:this.clips.map(c=>({...c}))};}
  play(options={}){const els=targets(this.target,options.root||this.options.root);if(!els.length)throw new Error("No animation targets");return new Playback(els,this.clips.map(c=>({...c})),options);}
}
export const motion=(target,options)=>new MotionBuilder(target,options);
/** Allows Sirkel.motion(screen(...)).fadein(screen(...)).speed(4).play() */
export const actor=(target,options)=>Object.freeze({
  motion(destination){return motion(target,options).to(destination);},
  animate(){return motion(target,options);}
});
export class MotionTimeline{
  constructor(){this.tracks=[];}
  add(builder,start=0){if(!(builder instanceof MotionBuilder))throw new TypeError("Expected MotionBuilder");number(start,"start");if(start<0||start>300000)throw new RangeError("Start out of range");this.tracks.push({builder,start});return this;}
  play(options={}){
    const players=this.tracks.map(t=>t.builder.play({...options,offset:t.start}));
    return {players,finished:Promise.all(players.map(p=>p.finished)),
      pause(){players.forEach(p=>p.pause());return this;},
      resume(){players.forEach(p=>p.resume());return this;},
      reverse(){players.forEach(p=>p.reverse());return this;},
      cancel(){players.forEach(p=>p.cancel());return this;}};
  }
}
export const timeline=()=>new MotionTimeline();
/** Fixed-command parser. No eval, Function, JS execution or arbitrary selectors. */
export function compileVedoyScript(script){
  if(typeof script!=="string"||script.length>12000)throw new TypeError("Script too large or not text");
  let target=null;
  const instructions=[];
  const noArgs=new Set(["FadeIn","FadeOut","SlideToLeft","SlideToRight","SlideToTop","SlideToBottom","SlideInFromLeft","SlideInFromRight","RollOutToLeft","RollOutToRight","Shrink","Grow","Pop","BlurIn","BlurOut","Bounce","Shake","Spin","Pulse","Float","Then","Play"]);
  for(const [i,raw] of script.split(/\r?\n/).entries()){
    const line=raw.trim();if(!line||line.startsWith("#"))continue;
    const m=/^([A-Z][A-Za-z]*)\s*(.*?)\.$/.exec(line);
    if(!m)throw new SyntaxError("Line "+(i+1)+": start with uppercase and finish with a period");
    const command=m[1],args=m[2];
    if(command==="Animate"){if(target||!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(args))throw new SyntaxError("Invalid actor");target=args;continue;}
    if(!target)throw new SyntaxError("Select an actor first: Animate Circle.");
    if(noArgs.has(command)){if(args)throw new SyntaxError(command+" takes no arguments");instructions.push({command,args:[]});continue;}
    if(command==="From"||command==="To"){
      const p=/^(Screen|Px)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/.exec(args);
      if(!p)throw new SyntaxError("Use "+command+" Screen x y.");
      instructions.push({command,args:[point({x:Number(p[2]),y:Number(p[3]),unit:p[1]==="Screen"?"screen":"px"})]});continue;
    }
    if(["Speed","Duration","Delay","Scale","Rotate","Opacity","Repeat"].includes(command)){
      if(!/^-?\d+(?:\.\d+)?$/.test(args))throw new SyntaxError("Expected a number");
      instructions.push({command,args:[Number(args)]});continue;
    }
    throw new SyntaxError("Unknown command "+command);
  }
  if(!target)throw new SyntaxError("Missing Animate instruction");
  if(instructions.length>100)throw new RangeError("Too many commands");
  return {version,target,instructions};
}
export function runVedoyScript(script,options={}){
  const compiled=compileVedoyScript(script);
  const root=options.root||(typeof document!=="undefined"?document:null);
  if(!root)throw new Error("Script requires browser DOM");
  const el=typeof root.getElementById==="function"?root.getElementById(compiled.target):root.querySelector('[id="'+compiled.target+'"]');
  if(!el)throw new Error("Actor not found: "+compiled.target);
  const seq=motion(el);
  const allowed={
    From:"from",To:"to",FadeIn:"fadeIn",FadeOut:"fadeOut",
    SlideToLeft:"slideToLeft",SlideToRight:"slideToRight",SlideToTop:"slideToTop",SlideToBottom:"slideToBottom",
    SlideInFromLeft:"slideInFromLeft",SlideInFromRight:"slideInFromRight",RollOutToLeft:"rollOutToLeft",RollOutToRight:"rollOutToRight",
    Shrink:"shrink",Grow:"grow",Pop:"pop",BlurIn:"blurIn",BlurOut:"blurOut",Bounce:"bounce",Shake:"shake",Spin:"spin",Pulse:"pulse",Float:"float",
    Then:"then",Speed:"speed",Duration:"duration",Delay:"delay",Rotate:"rotate",Scale:"scale",Opacity:"opacity",Repeat:"repeat"
  };
  for(const action of compiled.instructions){
    if(action.command==="Play")continue;
    seq[allowed[action.command]](...action.args);
  }
  return seq.play(options);
}
