import type {InsightArticle} from "@/lib/types";
const API="https://vedoystudio.no/api/public/news?topic=unge-i-arbeidslivet&limit=3";
export async function getInsightArticles():Promise<InsightArticle[]>{
 try{
  const response=await fetch(API,{next:{revalidate:300},signal:AbortSignal.timeout(4000)});
  if(!response.ok)return [];
  const data:unknown=await response.json();
  if(!data||typeof data!=="object"||!("posts" in data)||!Array.isArray(data.posts))return [];
  return data.posts.filter((p:unknown)=>{
   if(!p||typeof p!=="object")return false;
   const x=p as Record<string,unknown>;
   return typeof x.title==="string"&&typeof x.excerpt==="string"&&typeof x.id==="string"&&
    typeof x.url==="string"&&x.url.startsWith("https://vedoystudio.no/news/")&&x.category==="unge-i-arbeidslivet";
  }).slice(0,3).map((p:Record<string,unknown>)=>({
   id:String(p.id),title:String(p.title),excerpt:String(p.excerpt),url:String(p.url),
   categoryLabel:String(p.categoryLabel||"Unge i arbeidslivet"),publishedAt:String(p.publishedAt||"")
  }));
 }catch{return [];}
}
