"use client";
import { useEffect, useState } from "react";
import styles from "./insights-storage-choice.module.css";
export type StorageChoice = "none" | "local" | "cloud";
const KEY = "vedoy-insights-reading-preferences-v1";
type Stored = { storage: "local"; level: string };
export function readLocalPreference(): string | null {
 try {
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  const value = JSON.parse(raw) as Stored;
  return value.storage === "local" && ["standard","beginner","intermediate","advanced"].includes(value.level) ? value.level : null;
 } catch { return null; }
}
export function saveLocalPreference(level:string){
 try { window.localStorage.setItem(KEY,JSON.stringify({storage:"local",level})); return true; } catch { return false; }
}
export function clearLocalPreference(){
 try { window.localStorage.removeItem(KEY); return true; } catch { return false; }
}
export function InsightsStorageChoice({choice,onChange}:{choice:StorageChoice;onChange:(choice:StorageChoice)=>void}){
 const [notice,setNotice]=useState("");
 useEffect(()=>{setNotice("");},[choice]);
 return <section className={styles.panel} aria-label="Personvern for leseinnstillinger">
  <h2>Hvor vil du lagre lesevalgene dine?</h2>
  <p>Du bestemmer. Ingen lagring er standard, og du kan ombestemme deg.</p>
  <div className={styles.options}>
   <label><input type="radio" name="insights-storage" checked={choice==="none"} onChange={()=>{clearLocalPreference();onChange("none");}}/><span><strong>Ikke lagre</strong><small>Valget gjelder bare mens denne siden er åpen.</small></span></label>
   <label><input type="radio" name="insights-storage" checked={choice==="local"} onChange={()=>onChange("local")}/><span><strong>Lagre på enheten</strong><small>Husk lesenivå i denne nettleseren. Sendes ikke til Vedøy.</small></span></label>
   <label className={styles.disabled}><input type="radio" name="insights-storage" disabled checked={choice==="cloud"} onChange={()=>{}}/><span><strong>Lagre i skyen · kommer senere</strong><small>Vil kreve innlogging og eget samtykke. Ikke tilgjengelig nå.</small></span></label>
  </div>
  <button type="button" onClick={()=>{const ok=clearLocalPreference();onChange("none");setNotice(ok?"Lokale lesevalg er slettet.":"Kunne ikke bekrefte sletting i nettleseren.");}}>Slett lagrede lesevalg</button>
  {notice?<p role="status">{notice}</p>:null}
  <p className={styles.privacy}>Dette valget gjelder lesenivået. Eventuell analyse av leseratferd krever en separat vurdering og et eget personvernvalg.</p>
 </section>;
}
export const INSIGHTS_STORAGE_KEY=KEY;
