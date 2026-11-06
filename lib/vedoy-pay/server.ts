import "server-only";
import { getSql } from "@/lib/db";
import type { SessionPayload } from "@/lib/types";
import { allowLinkedPartner, payIdentityIsVerified } from "@/lib/vedoy-pay/validation.mjs";

export type PayDesign = {color:string;pattern:string;label:string};
export type Provider = "wallester"|"aera";
export type PayOverview = {
  configured:boolean; design:PayDesign|null;
  partners: {provider:Provider;status:"not_connected"|"pending"|"verified"|"suspended";available:boolean}[];
  loyalty:{confirmedPoints:number|null;events:number|null};
};
type PartnerRow = {provider:Provider;status:"pending"|"verified"|"suspended";verified_at:string|null};
export function requirePayUserId(session:SessionPayload|null) {
  return session && payIdentityIsVerified(session.userId) ? session.userId! : null;
}
function partnerAvailability():Record<Provider,boolean> {
  // Readiness requires manual approval in addition to any partner credentials.
  return {
    wallester:process.env.VEDOY_PAY_WALLESTER_APPROVED==="true"&&Boolean(process.env.WALLESTER_API_TOKEN),
    aera:process.env.VEDOY_PAY_AERA_APPROVED==="true"&&Boolean(process.env.AERA_API_TOKEN)
  };
}
export async function getPayOverview(session:SessionPayload):Promise<PayOverview> {
  const id=requirePayUserId(session);
  if(!id)throw new Error("verified_identity_required");
  const db=getSql();
  const availability=partnerAvailability();
  const providers=(["wallester","aera"] as const);
  if(!db)return {configured:false,design:null,
    partners:providers.map(provider=>({provider,status:"not_connected",available:availability[provider]})),
    loyalty:{confirmedPoints:null,events:null}};
  const [draft,links,sums]=await Promise.all([
    db.unsafe("select color,pattern,label from public.vedoy_pay_card_designs where organization_id=$1 and user_id=$2::uuid limit 1",[session.organizationId,id]),
    db.unsafe("select provider,status,verified_at::text from public.vedoy_pay_partner_links where organization_id=$1 and user_id=$2::uuid",[session.organizationId,id]),
    db.unsafe("select coalesce(sum(delta_points),0)::text as total,count(*)::int as events from public.vedoy_pay_loyalty_entries where organization_id=$1 and user_id=$2::uuid",[session.organizationId,id])
  ]);
  const rows=links as PartnerRow[];
  return {configured:true,design:(draft[0] as PayDesign|undefined)??null,
    partners:providers.map(provider=>{
      const link=rows.find(x=>x.provider===provider);
      const status=link?.status==="verified"&&!allowLinkedPartner(link.status,link.verified_at)
        ?"suspended":link?.status??"not_connected";
      return {provider,status,available:availability[provider]};
    }),
    loyalty:{confirmedPoints:Number(sums[0]?.total??0),events:Number(sums[0]?.events??0)}
  };
}
export async function savePayDesign(session:SessionPayload,design:PayDesign) {
  const id=requirePayUserId(session);const db=getSql();
  if(!id)throw new Error("verified_identity_required");
  if(!db)throw new Error("database_unavailable");
  await db.unsafe("insert into public.vedoy_pay_card_designs(organization_id,user_id,color,pattern,label) values($1,$2::uuid,$3,$4,$5) on conflict(organization_id,user_id) do update set color=excluded.color,pattern=excluded.pattern,label=excluded.label,updated_at=now()",
    [session.organizationId,id,design.color,design.pattern,design.label]);
}
export async function deletePayDesign(session:SessionPayload) {
  const id=requirePayUserId(session);const db=getSql();
  if(!id)throw new Error("verified_identity_required");
  if(!db)throw new Error("database_unavailable");
  await db.unsafe("delete from public.vedoy_pay_card_designs where organization_id=$1 and user_id=$2::uuid",[session.organizationId,id]);
}
