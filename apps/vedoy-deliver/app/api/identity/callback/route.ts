import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {admin} from "@/lib/server/admin";
import {ageFromBirthdate,bandForAge,signicatSession} from "@/lib/server/signicat";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const back=new URL("/?identity=failed",request.url);
 const response=(status:string)=>{back.searchParams.set("identity",status);const r=NextResponse.redirect(back);r.cookies.delete("vdeliver_identity_state");return r;};
 try{
  const state=request.nextUrl.searchParams.get("state");
  const cookie=request.cookies.get("vdeliver_identity_state")?.value;
  if(!state||!cookie||state!==cookie||!/^[a-f0-9]{64}$/.test(state))return response("failed");
  if(request.nextUrl.searchParams.get("result")!=="success")return response("cancelled");
  const db=admin();
  const {data:record,error}=await db.from("vdeliver_identity_sessions").select("state,user_id,session_id,expires_at,used_at").eq("state",state).maybeSingle();
  if(error||!record||record.used_at||new Date(record.expires_at).getTime()<Date.now())return response("expired");
  const session=await signicatSession(record.session_id);
  if(session.status!=="SUCCESS"||session.provider!=="nbid"||!session.subject?.id||!session.subject.dateOfBirth)return response("failed");
  const age=ageFromBirthdate(session.subject.dateOfBirth);
  const band=age===null?null:bandForAge(age);
  if(!band)return response("age");
  const {data:courier}=await db.from("vdeliver_couriers").select("age_band").eq("user_id",record.user_id).maybeSingle();
  if(!courier||courier.age_band!==band)return response("age");
  const {data:claimed,error:claimError}=await db.from("vdeliver_identity_sessions")
    .update({used_at:new Date().toISOString()}).eq("state",state).is("used_at",null).select("state").maybeSingle();
  if(claimError||!claimed)return response("expired");
  // Never persist date of birth, national ID number or full BankID response.
  const subjectHash=createHash("sha256").update("vdeliver:"+session.subject.id+":"+process.env.DELIVER_IDENTITY_PEPPER).digest("hex");
  const {error:writeError}=await db.from("vdeliver_identity_verifications").upsert({
   user_id:record.user_id,provider:"nbid",subject_hash:subjectHash,age_band:band,verified_at:new Date().toISOString()
  },{onConflict:"user_id"});
  if(writeError)return response("failed");
  return response("verified");
 }catch{return response("failed");}
}
