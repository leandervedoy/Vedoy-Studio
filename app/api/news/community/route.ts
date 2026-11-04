import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { getNewsPost } from "@/lib/repository";
import { publicComments, submitComment } from "@/lib/news-community";

export const dynamic = "force-dynamic";
const input=z.object({slug:z.string().min(1).max(150),body:z.string().trim().min(3).max(1200)});
const headers={"Cache-Control":"no-store"};
export async function GET(request:Request){
  const slug=new URL(request.url).searchParams.get("slug")||"";
  if(!/^[a-z0-9-]{2,150}$/.test(slug))return NextResponse.json({error:"Ugyldig artikkel."},{status:400,headers});
  const article=await getNewsPost(slug);
  if(!article)return NextResponse.json({error:"Artikkelen finnes ikke."},{status:404,headers});
  try{return NextResponse.json({comments:await publicComments(article.id)},{headers});}
  catch{return NextResponse.json({comments:[],error:"Kommentarer er midlertidig utilgjengelige."},{status:503,headers});}
}
export async function POST(request:Request){
  if(!sameOriginWrite(request))return NextResponse.json({error:"Ugyldig opphav."},{status:403,headers});
  if(Number(request.headers.get("content-length")||0)>5000)return NextResponse.json({error:"For mye innhold."},{status:413,headers});
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Logg inn med Vedøy for å kommentere."},{status:401,headers});
  const parsed=input.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Kontroller kommentaren."},{status:400,headers});
  const article=await getNewsPost(parsed.data.slug);
  if(!article)return NextResponse.json({error:"Artikkelen finnes ikke."},{status:404,headers});
  try {
    const result=await submitComment(article.id,session,parsed.data.body);
    if(result.status==="banned")return NextResponse.json({error:"Kontoen din er midlertidig utestengt fra kommentarer."},{status:403,headers});
    if(result.status==="limited")return NextResponse.json({error:"For mange kommentarer. Prøv igjen om ett minutt."},{status:429,headers:{"Retry-After":"60",...headers}});
    return NextResponse.json({status:result.status,message:result.status==="review"?"Kommentaren er sendt til moderering.":"Kommentaren er publisert."},{status:201,headers});
  }catch{return NextResponse.json({error:"Kommentarfeltet er ikke tilgjengelig."},{status:503,headers});}
}
