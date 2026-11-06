import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
const facts="Vedoy Deliver er en pilot for lokale leveringer. Standard er planlagt som betaling per levering, med pris etter avtale. Premium er et planlagt abonnement med månedspris på forespørsel. Mulige Premium-fordeler er prioritert oppfølging, samlet leveringsoversikt og tilpassede integrasjoner. Ingen pris, kapasitet, rabatt eller funksjon er garantert før skriftlig avtale. Bedrifter kan kontakte Vedøy gjennom kontaktskjemaet på /bedrift, som åpner e-postprogrammet. Vedi kan ikke bestille levering eller inngå avtaler.";
export async function POST(req:NextRequest){
 let message="";let history:unknown=[];
 try{const body=await req.json();message=typeof body.message==="string"?body.message.slice(0,1000).trim():"";history=Array.isArray(body.history)?body.history.slice(-8):[];}catch{return NextResponse.json({reply:"Ugyldig forespørsel."},{status:400});}
 if(!message)return NextResponse.json({reply:"Skriv et spørsmål."},{status:400});
 const key=process.env.OPENROUTER_API_KEY;
 if(!key)return NextResponse.json({reply:"Vedi-chatten er ikke aktivert ennå. Du kan sende en melding via kontaktskjemaet på denne siden. Standard og Premium er foreløpige løsninger, og priser avtales individuelt."});
 try{
 const safeHistory=(history as Array<{role?:string;text?:string}>).filter(m=>["user","assistant"].includes(m.role||"")&&typeof m.text==="string").map(m=>({role:m.role,content:m.text!.slice(0,1000)}));
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",signal:controller.signal,headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.VEDI_MODEL||"openai/gpt-4o-mini",max_tokens:280,messages:[{role:"system",content:"Du er Vedi, Vedoy Delivers norske bedriftsassistent. Svar kort, vennlig og presist. Ikke finn på priser, avtaler eller aktive funksjoner. Ikke be om personlige eller sensitive data. Fakta: "+facts},...safeHistory,{role:"user",content:message}]})});if(!response.ok)throw new Error("AI unavailable");const data=await response.json();const reply=data?.choices?.[0]?.message?.content;return NextResponse.json({reply:typeof reply==="string"?reply.slice(0,2500):"Jeg kan ikke svare akkurat nå."});}finally{clearTimeout(timeout);}
 }catch{return NextResponse.json({reply:"Vedi er midlertidig utilgjengelig. Bruk kontaktskjemaet for å nå Vedøy."});}
}