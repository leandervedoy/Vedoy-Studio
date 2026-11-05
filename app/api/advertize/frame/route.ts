import { NextResponse } from "next/server";
import { approvedFrameAncestors, deliveryId, eligibleCampaign, escapeHtml, recordDelivery, safeDestination, signClick } from "@/lib/advertize";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const blank=()=>new NextResponse("",{status:204,headers:{"Cache-Control":"no-store"}});
export async function GET(request:Request){
 const url=new URL(request.url);
 const slot=url.searchParams.get("slot")||"";
 if(!/^[a-z0-9-]{2,70}$/.test(slot)) return blank();
 try{
  const selected=await eligibleCampaign(slot);
  if(!selected)return blank();
  const {campaign,site}=selected;
  safeDestination(campaign.destination_url);
  const delivery=deliveryId();
  const token=signClick({id:campaign.id,slot,delivery,exp:Date.now()+10*60*1000});
  const click="/api/advertize/click?t="+encodeURIComponent(token);
  const css="*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f4faf6;color:#173e2c;font-family:system-ui,-apple-system,sans-serif}body{min-width:0}.ad{display:flex;flex-direction:column;justify-content:center;gap:8px;padding:17px;border:1px solid #d4e7d9;border-radius:16px;min-height:140px}.top{display:flex;justify-content:space-between;gap:10px;align-items:center}.eyebrow{font-size:10px;color:#5b8269;letter-spacing:.08em;font-weight:800}.label{font-size:10px;color:#637d6d;border:1px solid #cadecf;padding:3px 7px;border-radius:99px}.heading{font-size:18px;line-height:1.2;letter-spacing:-.03em;margin:0;font-weight:830}.body{font-size:12px;color:#5a7462;line-height:1.55;margin:0}.link{font-size:12px;font-weight:800;color:#0e7849;display:inline-flex;align-items:center;gap:4px}a{color:inherit;text-decoration:none}a:focus-visible{outline:3px solid #23a76c;outline-offset:4px}";
  const html="<!doctype html><html lang=\"no\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Vedoy Advertize – annonse</title><style>"+css+"</style></head><body><article class=\"ad\"><div class=\"top\"><span class=\"eyebrow\">"+escapeHtml(campaign.advertiser)+"</span><span class=\"label\">Annonse</span></div><h2 class=\"heading\"><a target=\"_blank\" rel=\"noopener noreferrer sponsored\" href=\""+escapeHtml(click)+"\">"+escapeHtml(campaign.headline)+"</a></h2><p class=\"body\">"+escapeHtml(campaign.body)+"</p><a class=\"link\" target=\"_blank\" rel=\"noopener noreferrer sponsored\" href=\""+escapeHtml(click)+"\">Les mer →</a></article></body></html>";
  // A request for an ad is not a verified viewability event. Count as served-creative impression only.
  // Metrics are aggregated; no IP, visitor ID, cookies, page URL or message data are persisted.
  await recordDelivery({delivery,campaign:campaign.id,slot,kind:"impression"}).catch(()=>{});
  const ancestors=approvedFrameAncestors(site);
  return new NextResponse(html,{headers:{
    "Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store",
    "Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff",
    "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors "+ancestors+"; sandbox allow-popups allow-popups-to-escape-sandbox",
    "Permissions-Policy":"camera=(),microphone=(),geolocation=()"
  }});
 }catch{return blank();}
}
