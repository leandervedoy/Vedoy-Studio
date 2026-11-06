import {ImageResponse} from "next/og";
import type {NextRequest} from "next/server";

export const runtime="nodejs";
export async function GET(request:NextRequest,{params}:{params:Promise<{size:string}>}){
 const raw=(await params).size;
 if(raw!=="192"&&raw!=="512")return new Response("Not found",{status:404});
 const size=Number(raw);
 const iconUrl=new URL("/vedoy-deliver-icon.png",request.url);
 let iconBase64:string;
 try{
  const res=await fetch(iconUrl,{cache:"force-cache"});
  if(!res.ok)throw new Error("Icon unavailable");
  iconBase64=Buffer.from(await res.arrayBuffer()).toString("base64");
 }catch{return new Response("Icon unavailable",{status:503});}
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0b2343"}}>
   <img alt="" src={"data:image/png;base64,"+iconBase64} width={size} height={size} style={{display:"block",objectFit:"contain"}}/>
  </div>,
  {width:size,height:size,headers:{"Cache-Control":"public,max-age=86400"}}
 );
}
