import { NextResponse } from "next/server";
import { activeCampaignById, recordDelivery, safeDestination, verifyClick } from "@/lib/advertize";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const token=new URL(request.url).searchParams.get("t")||"";
 const data=verifyClick(token);
 if(!data)return new NextResponse("Ugyldig annonsekobling",{status:400});
 try{
  const campaign=await activeCampaignById(data.id,data.slot);
  if(!campaign)return new NextResponse("Annonsen er ikke lenger aktiv",{status:404});
  const target=safeDestination(campaign.destination_url);
  await recordDelivery({delivery:data.delivery,campaign:data.id,slot:data.slot,kind:"click"}).catch(()=>{});
  const response=NextResponse.redirect(target,302);
  response.headers.set("Referrer-Policy","no-referrer");
  response.headers.set("Cache-Control","no-store");
  return response;
 }catch{return new NextResponse("Annonsekoblingen er utilgjengelig",{status:503});}
}
