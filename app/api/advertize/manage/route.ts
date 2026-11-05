import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isVedoyOwner, privilegedSupabase, sameOriginWrite } from "@/lib/vedoy-manager";
import { safeDestination } from "@/lib/advertize";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function forbidden(){return NextResponse.json({error:"Ikke tilgang."},{status:403});}

export async function POST(request:Request){
 const session=await getSession();
 if(!isVedoyOwner(session)||!sameOriginWrite(request))return forbidden();
 if(Number(request.headers.get("content-length")||0)>8192)return NextResponse.json({error:"For stor forespørsel"},{status:413});
 try {
  const body=await request.json();
  const slot_key=String(body.slot_key||"").trim();
  const advertiser=String(body.advertiser||"").trim();
  const headline=String(body.headline||"").trim();
  const description=String(body.body||"").trim();
  const destination_url=safeDestination(String(body.destination_url||""));
  if(!["sent-sidebar","studio-home"].includes(slot_key)||
    advertiser.length<2||advertiser.length>100||
    headline.length<3||headline.length>100||
    description.length<5||description.length>240)
    return NextResponse.json({error:"Ugyldig kampanjeinnhold"},{status:400});
  // House ads only, until paid inventory contracts, moderation and billing exist.
  const client=privilegedSupabase();
  const result=await client.from("advertize_campaigns").insert({
    slot_key,advertiser,headline,body:description,destination_url,status:"draft",house:true
  }).select("id").single();
  if(result.error)return NextResponse.json({error:"Kampanjen kunne ikke lagres"},{status:503});
  return NextResponse.json({ok:true,id:result.data.id});
 }catch{return NextResponse.json({error:"Ugyldig forespørsel"},{status:400});}
}

export async function PATCH(request:Request){
 const session=await getSession();
 if(!isVedoyOwner(session)||!sameOriginWrite(request))return forbidden();
 try{
  const payload=await request.json();
  if(!/^[a-f0-9-]{36}$/i.test(String(payload.id||""))||!["active","paused","draft"].includes(payload.status))
   return NextResponse.json({error:"Ugyldig status"},{status:400});
  const client=privilegedSupabase();
  const {data:existing}=await client.from("advertize_campaigns").select("house").eq("id",payload.id).maybeSingle();
  if(!existing?.house)return forbidden();
  const {error}=await client.from("advertize_campaigns").update({status:payload.status}).eq("id",payload.id).eq("house",true);
  if(error)return NextResponse.json({error:"Kunne ikke oppdatere status"},{status:503});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Ugyldig forespørsel"},{status:400});}
}
