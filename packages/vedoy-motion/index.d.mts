export type MotionPoint = {x:number;y:number;unit?:"screen"|"px"};
export type MotionTarget = string | Element | Iterable<Element>;
export type MotionViewport = {width:number;height:number};
export type MotionKeyframe = Record<string,string|number|undefined>;
export interface Playback {
  finished:Promise<boolean>;
  pause():this;resume():this;reverse():this;cancel():this;
}
export const version:string;
export const presets:readonly string[];
export function screen(x:number,y:number):MotionPoint;
export function pixels(x:number,y:number):MotionPoint;
export function point(value:MotionPoint):MotionPoint;
export function durationForSpeed(speed:number):number;
export function compileFrames(c:Record<string,unknown>,context:{
  rect:{left:number;top:number;width:number;height:number};
  viewport:MotionViewport;
  previous?:Record<string,number>;baseTransform?:string;
}):{frames:MotionKeyframe[];next:Record<string,number>};
export class MotionBuilder {
  constructor(target:MotionTarget,options?:{root?:Document|Element});
  from(p:MotionPoint):this;to(p:MotionPoint):this;moveTo(p:MotionPoint):this;
  fadeIn(p?:MotionPoint):this;fadein(p?:MotionPoint):this;
  fadeOut(p?:MotionPoint):this;fadeout(p?:MotionPoint):this;
  slideToLeft():this;slideToRight():this;slideToTop():this;slideToBottom():this;
  slideInFromLeft():this;slideInFromRight():this;rollOutToLeft():this;rollOutToRight():this;
  shrink():this;grow():this;pop():this;blurIn():this;blurOut():this;
  bounce():this;shake():this;spin():this;pulse():this;float():this;
  scale(n:number):this;rotate(degrees:number):this;opacity(n:number):this;
  speed(n:number):this;duration(ms:number):this;delay(ms:number):this;
  easing(e:string):this;repeat(n:number):this;keyframes(frames:MotionKeyframe[]):this;
  then():this;serialize():{version:string;clips:Array<Record<string,unknown>>};
  play(options?:{root?:Document|Element;viewport?:MotionViewport;reducedMotion?:boolean;offset?:number}):Playback;
}
export function motion(target:MotionTarget,options?:{root?:Document|Element}):MotionBuilder;
export function actor(target:MotionTarget,options?:{root?:Document|Element}):{
 motion(destination:MotionPoint):MotionBuilder;
 animate():MotionBuilder;
};
export class MotionTimeline {
 add(builder:MotionBuilder,start?:number):this;
 play(options?:{viewport?:MotionViewport;reducedMotion?:boolean}):{
  players:Playback[];finished:Promise<boolean[]>;
  pause():unknown;resume():unknown;reverse():unknown;cancel():unknown;
 };
}
export function timeline():MotionTimeline;
export function compileVedoyScript(script:string):{version:string;target:string;instructions:{command:string;args:unknown[]}[]};
export function runVedoyScript(script:string,options?:{
 root?:Document|Element;viewport?:MotionViewport;reducedMotion?:boolean;
}):Playback;
