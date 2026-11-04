import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { newsUserId } from "@/lib/news-community";
import type { SessionPayload } from "@/lib/types";

export type OpinionStatus = "pending_review" | "changes_requested" | "author_approval" | "rejected" | "published";
export type Opinion = {
 id:string; authorId:string; authorName:string; title:string; excerpt:string; body:string;
 status:OpinionStatus; feedback:string|null; proposedTitle:string|null; proposedExcerpt:string|null;
 proposedBody:string|null; approvedPostId:string|null; createdAt:string; updatedAt:string;
};
const ORG="org_vedoy";
const fields=String.raw`id, author_id as "authorId", author_name as "authorName", title, excerpt, body,
 status, feedback, proposed_title as "proposedTitle", proposed_excerpt as "proposedExcerpt",
 proposed_body as "proposedBody", approved_post_id as "approvedPostId",
 created_at as "createdAt", updated_at as "updatedAt"`;
function db(){const sql=getSql();if(!sql)throw new Error("Databasen er ikke konfigurert.");return sql;}
function mapRow(row:Opinion):Opinion {
 return {...row,createdAt:new Date(row.createdAt).toISOString(),updatedAt:new Date(row.updatedAt).toISOString()};
}
function slugify(s:string){return s.normalize("NFKD").toLowerCase().replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,75)||"mening";}
export async function submitOpinion(session:SessionPayload,input:{title:string;excerpt:string;body:string}):Promise<Opinion>{
 const sql=db(),authorId=newsUserId(session),id=randomUUID();
 // Daily creation cap to discourage spam; moderation is always mandatory.
 const count=await sql<{count:number}[]>`select count(*)::int as count from vedoy_news_opinions
 where author_id=${authorId} and created_at > now()-interval '24 hours'`;
 if(Number(count[0]?.count)>=5)throw new Error("Maksimalt fem nye meningsinnlegg per døgn.");
 const authorName=(session.name||"Vedoy-bruker").trim().slice(0,90);
 const rows=await sql<Opinion[]>`insert into vedoy_news_opinions
 (id,author_id,author_name,title,excerpt,body,author_license_confirmed)
 values(${id},${authorId},${authorName},${input.title},${input.excerpt},${input.body},true)
 returning id,author_id as "authorId",author_name as "authorName",title,excerpt,body,status,
 feedback,proposed_title as "proposedTitle",proposed_excerpt as "proposedExcerpt",proposed_body as "proposedBody",
 approved_post_id as "approvedPostId",created_at as "createdAt",updated_at as "updatedAt"`;
 await sql`insert into vedoy_news_opinion_events(id,opinion_id,actor_id,event)
 values(${randomUUID()},${id},${authorId},'submitted')`;
 return mapRow(rows[0]);
}
export async function getMyOpinions(session:SessionPayload):Promise<Opinion[]> {
 const sql=db(),uid=newsUserId(session);
 const rows=await sql<Opinion[]>`select id,author_id as "authorId",author_name as "authorName",title,excerpt,body,status,
 feedback,proposed_title as "proposedTitle",proposed_excerpt as "proposedExcerpt",proposed_body as "proposedBody",
 approved_post_id as "approvedPostId",created_at as "createdAt",updated_at as "updatedAt"
 from vedoy_news_opinions where author_id=${uid} order by created_at desc limit 100`;
 return rows.map(mapRow);
}
export async function getOpinionQueue():Promise<Opinion[]>{
 const sql=db();const rows=await sql<Opinion[]>`select id,author_id as "authorId",author_name as "authorName",title,excerpt,body,status,
 feedback,proposed_title as "proposedTitle",proposed_excerpt as "proposedExcerpt",proposed_body as "proposedBody",
 approved_post_id as "approvedPostId",created_at as "createdAt",updated_at as "updatedAt"
 from vedoy_news_opinions where status in ('pending_review','author_approval','changes_requested')
 order by created_at asc limit 100`;
 return rows.map(mapRow);
}
export async function getPublishedOpinion(postId:string):Promise<{authorName:string}|null>{
 const sql=getSql();if(!sql)return null;
 const rows=await sql<{authorName:string}[]>`select author_name as "authorName" from vedoy_news_opinions
 where approved_post_id=${postId} and status='published' limit 1`;
 return rows[0]??null;
}
export async function editAndResubmit(session:SessionPayload,id:string,input:{title:string;excerpt:string;body:string}){
 const sql=db(),uid=newsUserId(session);
 const rows=await sql`update vedoy_news_opinions set title=${input.title},excerpt=${input.excerpt},
 body=${input.body}, status='pending_review', feedback=null,
 proposed_title=null,proposed_excerpt=null,proposed_body=null,updated_at=now()
 where id=${id} and author_id=${uid} and status='changes_requested' returning id`;
 if(!rows.length)throw new Error("Innlegget kan ikke redigeres i denne fasen.");
 await sql`insert into vedoy_news_opinion_events(id,opinion_id,actor_id,event)
 values(${randomUUID()},${id},${uid},'resubmitted')`;
}
export async function authorRequestChanges(session:SessionPayload,id:string){
 const sql=db(),uid=newsUserId(session);
 const rows=await sql`update vedoy_news_opinions set status='changes_requested',
 proposed_title=null,proposed_excerpt=null,proposed_body=null,updated_at=now()
 where id=${id} and author_id=${uid} and status='author_approval' returning id`;
 if(!rows.length)throw new Error("Forslaget er ikke lenger tilgjengelig.");
 await sql`insert into vedoy_news_opinion_events(id,opinion_id,actor_id,event)
 values(${randomUUID()},${id},${uid},'requested_another_revision')`;
}
export async function editorDecision(id:string,actor:string,action:"reject"|"request_changes"|"propose",input:{feedback:string;title?:string;excerpt?:string;body?:string}){
 const sql=db();
 const status=action==="reject"?"rejected":action==="propose"?"author_approval":"changes_requested";
 const rows=await sql`update vedoy_news_opinions set
 status=${status}, feedback=${input.feedback},
 proposed_title=${action==="propose"?input.title:null},
 proposed_excerpt=${action==="propose"?input.excerpt:null},
 proposed_body=${action==="propose"?input.body:null}, updated_at=now()
 where id=${id} and status='pending_review' returning id`;
 if(!rows.length)throw new Error("Saken er allerede behandlet eller venter på forfatter.");
 await sql`insert into vedoy_news_opinion_events(id,opinion_id,actor_id,event,note)
 values(${randomUUID()},${id},${actor},${action},${input.feedback})`;
}
export async function publishOpinion(id:string,actor:string,approvedBy:"editor"|"author"){
 const sql=db();
 // Lock the individual submission while publishing. A second approval can never create a duplicate post.
 const result=await sql.begin(async tx=>{
   const rows=await tx<{id:string;authorId:string;authorName:string;title:string;excerpt:string;body:string;proposedTitle:string|null;proposedExcerpt:string|null;proposedBody:string|null;status:OpinionStatus}[]>`select id, author_id as "authorId",author_name as "authorName",title,excerpt,body,
     proposed_title as "proposedTitle",proposed_excerpt as "proposedExcerpt",proposed_body as "proposedBody",status
     from vedoy_news_opinions where id=${id} for update`;
   const item=rows[0];
   if(!item)throw new Error("Innlegget ble ikke funnet.");
   if(approvedBy==="editor"&&item.status!=="pending_review")throw new Error("Kun originale innsendte artikler kan godkjennes direkte.");
   if(approvedBy==="author"&&item.status!=="author_approval")throw new Error("Dette endringsforslaget er ikke lenger tilgjengelig.");
   if(approvedBy==="author"&&actor!==item.authorId)throw new Error("Kun forfatteren kan godkjenne endringsforslaget.");
   const title=approvedBy==="author"?item.proposedTitle:item.title;
   const excerpt=approvedBy==="author"?item.proposedExcerpt:item.excerpt;
   const body=approvedBy==="author"?item.proposedBody:item.body;
   if(!title||!excerpt||!body)throw new Error("Publiserbart innhold mangler.");
   const postId="news_"+randomUUID(),slug=slugify(title)+"-"+postId.slice(-8);
   await tx`insert into vedoy_news_posts(id,organization_id,slug,title,excerpt,content,category,status,author_type,author_name,sort_order,published_at)
    values(${postId},${ORG},${slug},${title},${excerpt},${body},'vedoy:meninger','published','user',${item.authorName},0,now())`;
   await tx`update vedoy_news_opinions set status='published', approved_post_id=${postId},
    title=${title},excerpt=${excerpt},body=${body},updated_at=now(),published_at=now() where id=${id}`;
   await tx`insert into vedoy_news_opinion_events(id,opinion_id,actor_id,event)
    values(${randomUUID()},${id},${actor},${approvedBy==="author"?"author_approved_and_published":"editor_published_original"})`;
   return slug;
 });
 return result;
}
