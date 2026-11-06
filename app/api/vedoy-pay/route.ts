import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sameOriginWrite } from "@/lib/vedoy-manager";
import { deletePayDesign,getPayOverview,requirePayUserId,savePayDesign } from "@/lib/vedoy-pay/server";
import { validatePayDesign } from "@/lib/vedoy-pay/validation.mjs";

export const dynamic="force-dynamic";
const HEADERS={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const error=(status:number,message:string)=>NextResponse.json({error:message},{status,headers:HEADERS});

export async function GET() {
  const session=await getSession();
  if(!session)return error(401,"Logg inn med Vedøy ID.");
  if(!requirePayUserId(session))return error(403,"Verifisert Vedøy ID er nødvendig.");
  try{return NextResponse.json(await getPayOverview(session),{headers:HEADERS});}
  catch{return error(503,"Vedoy Pay data er ikke tilgjengelig. Ingen saldo vises.");}
}

export async function PUT(request:Request) {
  const session=await getSession();
  if(!session)return error(401,"Logg inn med Vedøy ID.");
  if(!requirePayUserId(session))return error(403,"Verifisert Vedøy ID er nødvendig.");
  if(!sameOriginWrite(request))return error(403,"Ugyldig opprinnelse.");
  if(Number(request.headers.get("content-length")||0)>1024)return error(413,"For stor forespørsel.");
  let design;
  try {
    const text=await request.text();
    if(text.length>1024)return error(413,"For stor forespørsel.");
    design=validatePayDesign(JSON.parse(text));
  }catch{return error(400,"Ugyldig design. Ikke send kortnumre eller CVC.");}
  try {
    await savePayDesign(session,design);
    return NextResponse.json({ok:true,design},{headers:HEADERS});
  }catch{return error(503,"Lagring er utilgjengelig. Kontroller databasemigrering.");}
}

export async function DELETE(request:Request) {
  const session=await getSession();
  if(!session)return error(401,"Logg inn med Vedøy ID.");
  if(!requirePayUserId(session))return error(403,"Verifisert Vedøy ID er nødvendig.");
  if(!sameOriginWrite(request))return error(403,"Ugyldig opprinnelse.");
  try {
    await deletePayDesign(session);
    return NextResponse.json({ok:true},{headers:HEADERS});
  }catch{return error(503,"Kunne ikke slette kortutkastet.");}
}
