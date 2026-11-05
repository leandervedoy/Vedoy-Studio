import { NextResponse } from "next/server";
import { cleanOrigin, STAT_GROUPS, STAT_METRICS } from "@/lib/advertize";
import { privilegedSupabase } from "@/lib/vedoy-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request){
  const origin=cleanOrigin(request.headers.get("origin"));
  if(!origin)return NextResponse.json({error:"Origin required"},{status:403});
  if(Number(request.headers.get("content-length")||0)>1024)return new NextResponse(null,{status:413});
  try{
   const body=await request.json();
   const site=typeof body?.site==="string"?body.site:"";
   const group=typeof body?.group==="string"?body.group:"";
   const metric=typeof body?.metric==="string"?body.metric:"";
   if(!STAT_GROUPS.includes(group as typeof STAT_GROUPS[number])||
      !STAT_METRICS.includes(metric as typeof STAT_METRICS[number]))
      return NextResponse.json({error:"Invalid metric"},{status:400});
   const client=privilegedSupabase();
   const {data:siteRow,error}=await client.from("advertize_sites").select("allowed_origins,enabled").eq("slug",site).maybeSingle();
   if(error||!siteRow?.enabled||!siteRow.allowed_origins?.includes(origin))return new NextResponse(null,{status:403});
   // This is only an opt-in signal from a client. A forged client could send false
   // consent=true. Treat totals as unverified analytics, not as billing or user proof.
   if(body.consent!==true)return new NextResponse(null,{status:204});
   const {error:saveError}=await client.rpc("statistics_record_voluntary",{p_site:site,p_group:group,p_metric:metric});
   if(saveError)return new NextResponse(null,{status:503});
   return new NextResponse(null,{status:204});
  }catch{return new NextResponse(null,{status:400});}
}
