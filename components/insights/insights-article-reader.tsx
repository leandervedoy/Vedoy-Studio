"use client";
import { useState } from "react";
import { InsightsLevelSlider } from "./insights-level-slider";
import { INSIGHT_LEVEL_CONTENT, type ReaderLevel } from "@/lib/insights-levels";
import styles from "@/app/insights/insights.module.css";
type Section = { heading: string; paragraphs: readonly string[] };
export function InsightsArticleReader({slug,sections}:{slug:string;sections:readonly Section[]}){
 const [level,setLevel]=useState<ReaderLevel>("standard");
 const variants=INSIGHT_LEVEL_CONTENT[slug];
 const selected=level==="standard"?sections:variants?.[level] ?? sections;
 return <>
  <InsightsLevelSlider level={level} onChange={setLevel}/>
  <div className={styles.articleBody}>
   {selected.map((section,index)=><section key={section.heading}>
    <div className={styles.chapterNumber}>{String(index+1).padStart(2,"0")}</div>
    <h2>{section.heading}</h2>
    {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
   </section>)}
  </div>
 </>;
}
