import {NextResponse} from "next/server";
import {randomBytes} from "node:crypto";
import {admin,authenticatedUser} from "@/lib/server/admin";
import {startSignicat} from "@/lib/server/signicat";
export const runtime="nodejs";
export async function POST(request:Request){
 try {
  const user=await authenticatedUser(request);
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const db=admin();
  const {data:courier}=await db.from("vdeliver_couriers").select("user_id").eq("user_id",user.id).maybeSingle();
  if(!courier)return NextResponse.json({error:"Courier application required"},{status:403});
  const origin=process.env.DELIVER_PUBLIC_ORIGIN;
  if(!origin||!origin.startsWith("https://"))return NextResponse.json({error:"Verification unavailable"},{status:503});
  const state=randomBytes(32).toString("hex");
  const callback=new URL("/api/identity/callback",origin);
  callback.searchParams.set("state",state);
  const session=await startSignicat(callback.toString());
  const {error}=await db.from("vdeliver_identity_sessions").insert({state,user_id:user.id,session_id:session.id,expires_at:new Date(Date.now()+600000).toISOString()});
  if(error)return NextResponse.json({error:"Verification unavailable"},{status:503});
  const result=NextResponse.json({url:session.url});
  result.cookies.set("vdeliver_identity_state",state,{httpOnly:true,secure:true,sameSite:"lax",maxAge:600,path:"/api/identity"});
  return result;
 }catch{return NextResponse.json({error:"Verification unavailable"},{status:503});}
}
