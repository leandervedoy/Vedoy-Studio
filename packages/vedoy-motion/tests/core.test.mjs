import test from "node:test";
import assert from "node:assert/strict";
import {motion,actor,screen,compileFrames,durationForSpeed,compileVedoyScript,runVedoyScript,timeline,presets} from "../index.mjs";

const rect={left:100,top:200,width:70,height:70};
const viewport={width:1000,height:800};
test("speed 4 is 1.6 seconds",()=>{
 assert.equal(durationForSpeed(4),1600);
 assert.throws(()=>durationForSpeed(0),RangeError);
});
test("actor moves screen-left to screen-right while fading in",()=>{
 const sequence=actor("#Circle").motion(screen(85,50)).fadein(screen(-15,50)).speed(4);
 const result=compileFrames(sequence.current,{rect,viewport});
 assert.match(result.frames[0].transform,/translate3d\(-250px,200px/);
 assert.match(result.frames[1].transform,/translate3d\(750px,200px/);
 assert.equal(result.frames[0].opacity,0);
 assert.equal(result.frames[1].opacity,1);
});
test("roll-out and shrink work and compose with fade",()=>{
 let result=compileFrames(motion("#Circle").rollOutToLeft().current,{rect,viewport});
 assert.equal(result.next.x,-194);
 assert.equal(result.next.rotate,-360);
 assert.equal(result.next.opacity,0);
 result=compileFrames(motion("#Circle").shrink().fadeOut().current,{rect,viewport});
 assert.equal(result.next.scale,0.05);
 assert.equal(result.next.opacity,0);
 assert.ok(presets.includes("slideToLeft"));
});
test("custom CSS properties can be animated",()=>{
 const k=[{opacity:0,backgroundColor:"black"},{opacity:1,backgroundColor:"white"}];
 assert.deepEqual(compileFrames(motion("#Card").keyframes(k).current,{rect,viewport}).frames,k);
});
test("VedoyScript is a strict declarative command syntax",()=>{
 const script="Animate Circle.\n  From Screen -15 50.\n  FadeIn.\n  To Screen 85 50.\n  Speed 4.\n  Play.";
 const compiled=compileVedoyScript(script);
 assert.equal(compiled.target,"Circle");
 assert.equal(compiled.instructions.length,5);
 assert.throws(()=>compileVedoyScript("Animate Circle.\n  Execute alert."),/Unknown command/);
 assert.throws(()=>compileVedoyScript("Animate Circle.\n  To Screen x y."),/Use To Screen/);
});
test("playback and parallel timeline use Web Animations API",async()=>{
 const calls=[];
 const element={getBoundingClientRect(){return rect},animate(frames,opts){calls.push({frames,opts});return {finished:Promise.resolve(),pause(){},play(){},reverse(){},cancel(){},finish(){}}}};
 const player=motion(element).fadeIn().slideToLeft().speed(4).play({viewport,reducedMotion:false});
 assert.equal(await player.finished,true);
 assert.equal(calls[0].opts.duration,1600);
 const scene=timeline().add(motion(element).grow(),100).add(motion(element).shrink(),250);
 const running=scene.play({viewport,reducedMotion:true});
 await running.finished;
 assert.equal(calls[1].opts.duration,1);
 running.cancel();
});
test("safe VedoyScript dispatches to the selected DOM actor",async()=>{
 const element={getBoundingClientRect(){return rect},animate(){return {finished:Promise.resolve(),finish(){},cancel(){}}}};
 const root={getElementById(id){return id==="Circle"?element:null}};
 const player=runVedoyScript("Animate Circle.\n FadeIn.\n SlideToRight.\n Speed 4.\n Play.",{root,viewport,reducedMotion:true});
 assert.equal(await player.finished,true);
});
