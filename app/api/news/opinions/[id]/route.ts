import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { editAndResubmit, authorRequestChanges, publishOpinion } from "@/lib/news-opinions";
import { newsUserId } from "@/lib/news-community";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("resubmit"),title:z.string().trim().min(10).max(160),excerpt:z.string().trim().min(20).max(500),body:z.string().trim().min(300).max(20000)}),
 z.object({action:z.literal("approve-and-publish")}),
 z.object({action:z.literal("request-another-revision")})
]);
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOriginWrite(request))return NextResponse.json({error:"Ugyldig opphav."},{status:403,headers});
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Logg inn."},{status:401,headers});
  const {id}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Ugyldig innlegg."},{status:400,headers});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Kontroller innholdet."},{status:400,headers});
  try{
    if(parsed.data.action==="resubmit"){
      await editAndResubmit(session,id,parsed.data);
      return NextResponse.json({ok:true,message:"Oppdatert innlegg venter nå på gjennomgang."},{headers});
    }
    if(parsed.data.action==="request-another-revision"){
      await authorRequestChanges(session,id);
      return NextResponse.json({ok:true,message:"Du kan nå redigere innlegget og sende på nytt."},{headers});
    }
    const slug=await publishOpinion(id,newsUserId(session),"author");
    revalidatePath("/news");
    revalidatePath("/news/"+slug);
    revalidatePath("/");
    return NextResponse.json({ok:true,slug,message:"Din godkjente mening er publisert."},{headers});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Handlingen kunne ikke gjennomføres."},{status:409,headers});
  }
}
