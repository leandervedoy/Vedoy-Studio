import type { CSSProperties } from "react";

const BASE="https://www.vedoystudio.no";
export function AdvertizePlacement({slot,title="Annonse",height=168,style}:{
 slot:"studio-home"|"sent-sidebar";
 title?:string;
 height?:number;
 style?:CSSProperties;
}){
 const url=new URL("/api/advertize/frame",BASE);
 url.searchParams.set("slot",slot);
 return <aside aria-label={title} style={{margin:"18px auto",maxWidth:500,width:"100%",...style}}>
   <span style={{display:"block",fontSize:10,fontWeight:800,letterSpacing:".12em",color:"#6e8071",paddingBottom:5}}>ANNONSE</span>
   <iframe src={url.toString()} title={title} loading="lazy" referrerPolicy="no-referrer"
    sandbox="allow-popups allow-popups-to-escape-sandbox" scrolling="no"
    style={{border:0,width:"100%",height,background:"transparent",borderRadius:14}}/>
  </aside>;
}
