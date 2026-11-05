import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { privilegedSupabase } from "@/lib/vedoy-manager";

export const ADVERTIZE_ORIGIN = "https://www.vedoystudio.no";

type AdSite = {slug:string; allowed_origins:string[]; enabled:boolean};
type AdSlot = {key:string;site_slug:string;enabled:boolean};
export type AdCampaign = {id:string;slot_key:string;advertiser:string;headline:string;body:string;destination_url:string;status:string;house:boolean;starts_at:string;ends_at:string|null};
const SLOT_PATTERN = /^[a-z0-9-]{2,70}$/;
export const STAT_GROUPS = ["home","marketing","sent","news"] as const;
export const STAT_METRICS = ["page_view","cta_click"] as const;

export function safeDestination(raw:string):string {
  if (!raw || raw.length>2000 || /[\u0000-\u001f\u007f]/.test(raw)) throw new Error("Ugyldig nettadresse");
  const parsed=new URL(raw);
  if (parsed.protocol!=="https:" || !parsed.hostname.includes(".") || parsed.username || parsed.password ||
      parsed.port || /(^|\.)localhost$/.test(parsed.hostname) ||
      /(^|\.)example$/.test(parsed.hostname)) throw new Error("Kun offentlige HTTPS-adresser tillates");
  return parsed.toString();
}
export function escapeHtml(value:string):string {
  return value.replace(/[&<>"']/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char] || char));
}
function signingKey():string {
  const secret=process.env.ADVERTIZE_SIGNING_SECRET || process.env.SESSION_SECRET;
  if (!secret || secret.length<32) throw new Error("Ad signing secret unavailable");
  return secret;
}
export function signClick(data:{id:string;slot:string;delivery:string;exp:number}):string {
  const body=Buffer.from(JSON.stringify(data),"utf8").toString("base64url");
  const mac=createHmac("sha256",signingKey()).update("advertize-click-v1:"+body).digest("base64url");
  return body+"."+mac;
}
export function verifyClick(token:string):{id:string;slot:string;delivery:string;exp:number}|null {
  if (token.length>1200) return null;
  const bits=token.split(".");
  if (bits.length!==2) return null;
  try{
    const expected=createHmac("sha256",signingKey()).update("advertize-click-v1:"+bits[0]).digest();
    const received=Buffer.from(bits[1],"base64url");
    if (expected.length!==received.length||!timingSafeEqual(expected,received)) return null;
    const data=JSON.parse(Buffer.from(bits[0],"base64url").toString("utf8")) as {id:string;slot:string;delivery:string;exp:number};
    if (!data|| typeof data.id!=="string"|| !SLOT_PATTERN.test(data.slot)||
        !/^[a-f0-9-]{36}$/.test(data.delivery)||!Number.isSafeInteger(data.exp)||
        data.exp<Date.now()||data.exp>Date.now()+15*60*1000) return null;
    return data;
  }catch{return null;}
}
export async function eligibleCampaign(slotKey:string):Promise<{campaign:AdCampaign;site:AdSite}|null>{
  if(!SLOT_PATTERN.test(slotKey))return null;
  const supabase=privilegedSupabase();
  const {data:slot,error:slotError}=await supabase.from("advertize_slots").select("key,site_slug,enabled").eq("key",slotKey).maybeSingle();
  if(slotError||!slot?.enabled)return null;
  const {data:site,error:siteError}=await supabase.from("advertize_sites").select("slug,allowed_origins,enabled").eq("slug",(slot as AdSlot).site_slug).maybeSingle();
  if(siteError||!site?.enabled)return null;
  const now=new Date().toISOString();
  const {data,error}=await supabase.from("advertize_campaigns").select("*")
    .eq("slot_key",slotKey).eq("status","active").eq("house",true)
    .lte("starts_at",now).or("ends_at.is.null,ends_at.gt."+now)
    .order("created_at",{ascending:true}).limit(10);
  if(error||!data?.length)return null;
  const index=Math.floor(Date.now()/60000)%data.length;
  return {campaign:data[index] as AdCampaign,site:site as AdSite};
}
export async function activeCampaignById(id:string,slot:string):Promise<AdCampaign|null>{
 if(!/^[0-9a-f-]{36}$/i.test(id)||!SLOT_PATTERN.test(slot))return null;
 const selected=privilegedSupabase();
 const {data,error}=await selected.from("advertize_campaigns").select("*")
   .eq("id",id).eq("slot_key",slot).eq("status","active").eq("house",true).maybeSingle();
 if(error||!data)return null;
 const now=Date.now();
 if(new Date(data.starts_at).getTime()>now||
   (data.ends_at&&new Date(data.ends_at).getTime()<=now))return null;
 const {data:slotRecord}=await selected.from("advertize_slots").select("site_slug,enabled").eq("key",slot).maybeSingle();
 if(!slotRecord?.enabled)return null;
 const {data:site}=await selected.from("advertize_sites").select("enabled").eq("slug",slotRecord.site_slug).maybeSingle();
 return site?.enabled ? data as AdCampaign : null;
}
export async function recordDelivery(data:{delivery:string;campaign:string;slot:string;kind:"impression"|"click"}):Promise<boolean>{
  const result=await privilegedSupabase().rpc("advertize_record_delivery",{
    p_delivery_id:data.delivery,p_campaign_id:data.campaign,p_slot_key:data.slot,p_kind:data.kind
  });
  if(result.error)throw new Error("Could not record aggregate ad event");
  return result.data===true;
}
export function deliveryId():string{return randomUUID();}
export function approvedFrameAncestors(site:AdSite):string{
  const valid=site.allowed_origins.filter(value=>{
    try{const url=new URL(value);return url.protocol==="https:"&&url.origin===value;}catch{return false;}
  });
  return ["'self'",...valid].join(" ");
}
export function cleanOrigin(value:string|null):string{
 if(!value)return "";
 try{const url=new URL(value);return url.origin===value?url.origin:"";}catch{return "";}
}
