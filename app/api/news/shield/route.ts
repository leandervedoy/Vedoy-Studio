import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { newsUserId,moderationOverview,moderateComment,banCommenter,unbanCommenter,setShieldPhrase,toggleShieldPhrase,createSponsor,sponsorStatus } from "@/lib/news-community";

export const dynamic="force-dynamic";
const action=z.discriminatedUnion("action",[
  z.object({action:z.literal("approve"),id:z.string().uuid()}),
  z.object({action:z.literal("remove"),id:z.string().uuid()}),
  z.object({action:z.literal("ban"),userId:z.string().regex(/^vnews_[a-f0-9]{24}$/),hours:z.union([z.literal(1),z.literal(24),z.literal(168),z.literal(720)]),reason:z.string().trim().min(3).max(240)}),
  z.object({action:z.literal("unban"),userId:z.string().regex(/^vnews_[a-f0-9]{24}$/)}),
  z.object({action:z.literal("phrase"),phrase:z.string().trim().min(3).max(80)}),
  z.object({action:z.literal("phrase-toggle"),id:z.string().trim().min(3).max(120),active:z.boolean()}),
  z.object({action:z.literal("ad-create"),sponsor:z.string().trim().min(2).max(100),headline:z.string().trim().min(3).max(140),body:z.string().trim().min(5).max(400),destinationUrl:z.string().url().max(1500),placement:z.enum(["index","article","all"])}),
  z.object({action:z.literal("ad-status"),id:z.string().uuid(),status:z.enum(["active","paused"])})
]);
function deny(){return NextResponse.json({error:"Ikke tillatt."},{status:403,headers:{"Cache-Control":"no-store"}});}
export async function GET(){
  const session=await getSession();
  if(!isAdminSession(session))return deny();
  try{return NextResponse.json(await moderationOverview(),{headers:{"Cache-Control":"no-store"}});}
  catch{return NextResponse.json({error:"Kjør databasemigrering for Vedoy News Shield."},{status:503});}
}
export async function POST(request:Request){
  if(!sameOriginWrite(request))return deny();
  const session=await getSession();
  if(!isAdminSession(session))return deny();
  const parsed=action.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Ugyldig handling."},{status:400});
  const data=parsed.data,actor=newsUserId(session);
  try{
    switch(data.action){
      case "approve":case "remove":await moderateComment(data.id,data.action,actor);break;
      case "ban":await banCommenter(data.userId,data.hours,data.reason,actor);break;
      case "unban":await unbanCommenter(data.userId,actor);break;
      case "phrase":await setShieldPhrase(data.phrase,actor);break;
      case "phrase-toggle":await toggleShieldPhrase(data.id,data.active,actor);break;
      case "ad-create":await createSponsor(data,actor);break;
      case "ad-status":await sponsorStatus(data.id,data.status,actor);break;
    }
    return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Kunne ikke gjennomføre handlingen."},{status:400});}
}
