"use client";
import { useState } from "react";
import type { ReaderLevel } from "@/lib/insights-levels";
import styles from "./insights-level-slider.module.css";
const levels: ReaderLevel[] = ["standard", "beginner", "intermediate", "advanced"];
const labels = ["Standard", "Helt ny", "Grunnleggende", "Avansert"];
export function InsightsLevelSlider({level,onChange}:{level:ReaderLevel;onChange:(next:ReaderLevel)=>void}){
 const index=levels.indexOf(level);
 return <div className={styles.readerLevel} aria-label="Tilpass artikkelens faglige nivå">
  <div className={styles.heading}><strong>Tilpass lesingen</strong><span>{index+1} av 4 · {labels[index]}</span></div>
  <p className={styles.hint}>Velg hvor mye forklaring og teknisk dybde du ønsker. Standard viser den korte artikkelen.</p>
  <input className={styles.range} type="range" min={0} max={3} step={1} value={index} aria-label="Lesenivå" aria-valuetext={labels[index]} onChange={e=>onChange(levels[Number(e.target.value)])}/>
  <div className={styles.steps}>{labels.map((label,i)=><span key={label} className={index===i?styles.active:undefined}>{i+1}. {label}</span>)}</div>
 </div>;
}
