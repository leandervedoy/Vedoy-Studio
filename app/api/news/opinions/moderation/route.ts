import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession, isAdminSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { newsUserId } from "@/lib/news-community";
import { getOpinionQueue, editorDecision, publishOpinion } from "@/lib/news-opinions";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("reject"),id:z.string().uuid(),feedback:z.string().trim().min(5).max(1500)}),
 z.object({action:z.literal("request_changes"),id:z.string().uuid(),feedback:z.string().trim().min(5).max(1500)}),
 z.object({action:z.literal("propose"),id:z.string().uuid(),feedback:z.string().trim().min(5).max(1500),
   title:z.string().trim().min(10).max(160),excerpt:z.string().trim().min(20).max(500),body:z.string().trim().min(300).max(20000)}),
 z.object({action:z.literal("publish_original"),id:z.string().uuid()})
]);
function deny(){return NextResponse.json({error:"Ikke tillatt."},{status:403,headers});}
export async function GET(){
  const session=await getSession();
  if(!isAdminSession(session))return deny();
  try{return NextResponse.json({opinions:await getOpinionQueue()},{headers});}
  catch{return NextResponse.json({error:"Meninger må migreres i databasen før moderering kan brukes."},{status:503,headers});}
}
export async function POST(request:Request){
  if(!sameOriginWrite(request))return deny();
  const session=await getSession();
  if(!isAdminSession(session))return deny();
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Kontroller begrunnelsen og eventuelt redigert versjon."},{status:400,headers});
  const data=parsed.data;
  try{
    if(data.action==="publish_original"){
      const slug=await publishOpinion(data.id,newsUserId(session),"editor");
      revalidatePath("/news");revalidatePath("/news/"+slug);revalidatePath("/");
      return NextResponse.json({ok:true,slug,message:"Originalinnlegget er publisert."},{headers});
    }
    await editorDecision(data.id,newsUserId(session),data.action,data);
    return NextResponse.json({ok:true,message:data.action==="propose"?"Endringsforslaget er sendt til forfatteren.":"Redaksjonens svar er lagret."},{headers});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Kunne ikke behandle innlegget."},{status:409,headers});
  }
}
