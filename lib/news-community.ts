import { createHash, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import type { SessionPayload } from "@/lib/types";
import { evaluatePublicMessage } from "@/lib/shield-policy.mjs";

function db() {
  const client = getSql();
  if (!client) throw new Error("DATABASE_URL mangler.");
  return client;
}
export function newsUserId(session: SessionPayload): string {
  const salt = process.env.SESSION_SECRET;
  if (!salt || salt.length < 32) throw new Error("SESSION_SECRET mangler.");
  return "vnews_" + createHash("sha256").update("news:" + salt + ":" + session.email.toLowerCase()).digest("hex").slice(0, 24);
}
export async function publicComments(postId: string) {
  const sql = db();
  const rows = await sql<{id:string;username:string;body:string;createdAt:Date}[]>`select id,username,body,created_at as "createdAt" from vedoy_news_comments where post_id=${postId} and status='approved' order by created_at asc limit 200`;
  return rows.map(row=>({...row,createdAt:new Date(row.createdAt).toISOString()}));
}
export async function submitComment(postId:string, session:SessionPayload, body:string) {
  const sql=db(); const uid=newsUserId(session);
  const bans=await sql`select user_id from vedoy_news_shield_bans where user_id=${uid} and expires_at>now() limit 1`;
  if(bans.length) return {status:"banned" as const};
  const rate=await sql<{hits:number}[]>`insert into vedoy_news_shield_rate(id,period_start,hits) values(${"comment:"+uid},now(),1)
    on conflict(id) do update set hits=case when vedoy_news_shield_rate.period_start<now()-interval '60 seconds' then 1 else vedoy_news_shield_rate.hits+1 end,
    period_start=case when vedoy_news_shield_rate.period_start<now()-interval '60 seconds' then now() else vedoy_news_shield_rate.period_start end returning hits`;
  if(Number(rate[0]?.hits)>4) return {status:"limited" as const};
  const terms=await sql<{phrase:string}[]>`select phrase from vedoy_news_shield_terms where active=true`;
  const check=evaluatePublicMessage(body,terms.map(term=>term.phrase));
  const status=check.flagged?"flagged":"approved";
  const id=randomUUID(), username=(session.name.trim()||"Vedoy-bruker").slice(0,80);
  await sql`insert into vedoy_news_comments(id,post_id,user_id,username,body,status,flagged_reason)
    values(${id},${postId},${uid},${username},${body},${status},${check.reason})`;
  return {status:check.flagged?"review" as const:"published" as const};
}
export async function moderationOverview(){
  const sql=db();
  const [flagged,bans,terms,ads]=await Promise.all([
    sql`select id,post_id as "postId",user_id as "userId",username,body,flagged_reason as "reason",created_at as "createdAt" from vedoy_news_comments where status='flagged' order by created_at desc limit 100`,
    sql`select user_id as "userId",username,expires_at as "expiresAt",reason from vedoy_news_shield_bans where expires_at>now() order by expires_at desc limit 100`,
    sql`select id,phrase,active from vedoy_news_shield_terms order by phrase`,
    sql`select id,sponsor,headline,body,destination_url as "destinationUrl",placement,status from vedoy_news_advertisements order by created_at desc limit 100`
  ]);
  return {flagged,bans,terms,ads};
}
async function audit(actor:string,action:string,subject:string){
  const sql=db();await sql`insert into vedoy_news_shield_audit(id,actor_id,action,subject_id) values(${randomUUID()},${actor},${action},${subject})`;
}
export async function moderateComment(id:string, mode:"approve"|"remove",actor:string){
  const sql=db(),status=mode==="approve"?"approved":"removed";
  const rows=await sql`update vedoy_news_comments set status=${status},updated_at=now() where id=${id} and status='flagged' returning id`;
  if(!rows.length)throw new Error("Kommentaren ble ikke funnet i køen.");
  await audit(actor,mode,id);
}
export async function banCommenter(uid:string,hours:number,reason:string,actor:string){
  const sql=db();
  const rows=await sql<{username:string}[]>`select username from vedoy_news_comments where user_id=${uid} order by created_at desc limit 1`;
  if(!rows.length)throw new Error("Brukeren ble ikke funnet.");
  const expires=new Date(Date.now()+hours*3600000).toISOString();
  await sql`insert into vedoy_news_shield_bans(user_id,username,expires_at,reason,moderator_id)
    values(${uid},${rows[0].username},${expires},${reason},${actor})
    on conflict(user_id) do update set expires_at=excluded.expires_at,reason=excluded.reason,moderator_id=excluded.moderator_id`;
  await audit(actor,"ban:"+hours,uid);
}
export async function unbanCommenter(uid:string,actor:string){
  const sql=db();await sql`delete from vedoy_news_shield_bans where user_id=${uid}`;await audit(actor,"unban",uid);
}
export async function setShieldPhrase(phrase:string,actor:string){
  const sql=db();await sql`insert into vedoy_news_shield_terms(id,phrase) values(${randomUUID()},${phrase.toLowerCase()}) on conflict(phrase) do update set active=true`;
  await audit(actor,"phrase:add",phrase);
}
export async function toggleShieldPhrase(id:string,active:boolean,actor:string){
  const sql=db();await sql`update vedoy_news_shield_terms set active=${active} where id=${id}`;await audit(actor,"phrase:toggle",id);
}
export async function activeSponsors(placement:"index"|"article"){
  const sql=getSql();if(!sql)return [];
  return sql<{id:string;sponsor:string;headline:string;body:string;destinationUrl:string}[]>`select id,sponsor,headline,body,destination_url as "destinationUrl"
  from vedoy_news_advertisements where status='active' and (placement=${placement} or placement='all') order by created_at desc limit 2`;
}
export async function createSponsor(input:{sponsor:string;headline:string;body:string;destinationUrl:string;placement:"index"|"article"|"all"},actor:string){
  const sql=db();const url=new URL(input.destinationUrl);
  if(url.protocol!=="https:")throw new Error("Annonser krever HTTPS.");
  const id=randomUUID();
  await sql`insert into vedoy_news_advertisements(id,sponsor,headline,body,destination_url,placement)
    values(${id},${input.sponsor},${input.headline},${input.body},${url.toString()},${input.placement})`;
  await audit(actor,"ad:create",id);
}
export async function sponsorStatus(id:string,status:"active"|"paused",actor:string){
  const sql=db();const rows=await sql`update vedoy_news_advertisements set status=${status},updated_at=now() where id=${id} returning id`;
  if(!rows.length)throw new Error("Annonsen ble ikke funnet.");
  await audit(actor,"ad:"+status,id);
}
