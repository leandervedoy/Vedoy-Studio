"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./news-experience.module.css";

type Comment={id:string;username:string;body:string;createdAt:string};
export function NewsComments({slug}:{slug:string}){
  const [comments,setComments]=useState<Comment[]>([]);
  const [text,setText]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [unavailable,setUnavailable]=useState(false);
  async function refresh(){
    try{
      const response=await fetch("/api/news/community?slug="+encodeURIComponent(slug),{cache:"no-store"});
      if(!response.ok){setUnavailable(true);return;}
      const result=await response.json();
      setComments(Array.isArray(result.comments)?result.comments:[]);
      setUnavailable(false);
    }catch{setUnavailable(true);}
  }
  useEffect(()=>{void refresh();},[slug]);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/news/community",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug,body:text})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||"Kunne ikke sende kommentaren.");
      setMessage(result.message);setText("");await refresh();
    }catch(error){setMessage(error instanceof Error?error.message:"Kunne ikke sende.");}
    finally{setBusy(false);}
  }
  return <section className={styles.discussion} aria-label="Kommentarer">
    <div className={styles.discussionHead}><h2>Diskusjon</h2><span>{comments.length} synlige kommentarer</span></div>
    <p>Del erfaringer og still spørsmål. Vedoy Shield kan holde igjen kommentarer som bryter med reglene, for menneskelig gjennomgang.</p>
    {unavailable?<p role="status">Kommentarfeltet er ikke aktivert ennå.</p>:null}
    <form onSubmit={submit} className={styles.commentForm}>
      <label htmlFor="news-comment">Din kommentar</label>
      <textarea id="news-comment" value={text} maxLength={1200} minLength={3} required rows={4} onChange={event=>setText(event.target.value)} placeholder="Hold deg til saken og respekter andre."></textarea>
      <div className={styles.commentActions}>
        <small>{text.length}/1200 · <Link href={"/login?next="+encodeURIComponent("/news/"+slug)}>Logg inn med Vedøy</Link></small>
        <button type="submit" disabled={busy||text.trim().length<3||unavailable}>{busy?"Sender …":"Publiser kommentar"}</button>
      </div>
      {message?<p role="status">{message}</p>:null}
    </form>
    <div className={styles.comments}>
      {comments.map(comment=><article key={comment.id} className={styles.comment}>
        <div><strong>{comment.username}</strong><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString("nb-NO")}</time></div>
        <p>{comment.body}</p>
      </article>)}
      {!comments.length&&!unavailable?<p>Ingen kommentarer ennå. Start samtalen!</p>:null}
    </div>
  </section>;
}
