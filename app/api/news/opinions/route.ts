import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { getMyOpinions, submitOpinion } from "@/lib/news-opinions";

export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
const schema=z.object({
  title:z.string().trim().min(10).max(160),
  excerpt:z.string().trim().min(20).max(500),
  body:z.string().trim().min(300).max(20000),
  licenseConfirmed:z.literal(true)
});
export async function GET(){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Logg inn med Vedøy."},{status:401,headers});
  try{return NextResponse.json({opinions:await getMyOpinions(session)},{headers});}
  catch{return NextResponse.json({error:"Meninger er ikke tilgjengelig før databasen er konfigurert."},{status:503,headers});}
}
export async function POST(request:Request){
  if(!sameOriginWrite(request))return NextResponse.json({error:"Ugyldig opphav."},{status:403,headers});
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Logg inn for å skrive en mening."},{status:401,headers});
  const length=Number(request.headers.get("content-length")||0);
  if(length>25000)return NextResponse.json({error:"Teksten er for lang."},{status:413,headers});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Fyll inn tittel, ingress og minst 300 tegn. Bekreft publiseringsretten."},{status:400,headers});
  try{
    const opinion=await submitOpinion(session,parsed.data);
    return NextResponse.json({opinion,message:"Innlegget er sendt og venter på gjennomgang."},{status:201,headers});
  }catch(error){
    const message=error instanceof Error?error.message:"Kunne ikke sende inn.";
    return NextResponse.json({error:message},{status:message.includes("Maksimalt")?429:503,headers});
  }
}
