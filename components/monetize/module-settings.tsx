"use client";import {useState} from "react";import Link from "next/link";import styles from "@/app/monetize/monetize.module.css";
type Key="statistics"|"advertize"|"rewards"|"interests"|"commercial";
const defaults:Record<Key,boolean>={statistics:false,advertize:false,rewards:false,interests:false,commercial:false};
const options:{key:Key;title:string;desc:string}[]=[
{key:"statistics",title:"Vedoy Statistics",desc:"Frivillige, aggregerte sidevisninger. Krever samtykke fra hver besøkende."},
{key:"advertize",title:"Vedoy Advertize",desc:"Kontekstuelle annonser. Må godkjennes for nettstedet."},
{key:"rewards",title:"Vedoy Rewards",desc:"Coins for kvalifisert frivillig deltakelse. Ikke aktivt."},
{key:"interests",title:"Interesser",desc:"Valgfrie interessekategorier. Ikke samle inn uten eget samtykke."},
{key:"commercial",title:"Kommersielle grupperapporter",desc:"Bare anonymiserte, store grupper etter separat tillatelse. Ikke aktivt."}
];
export function MonetizeModuleSettings(){const [state,setState]=useState(defaults);const [notice,setNotice]=useState("");return <section aria-label="Monetize module preferences"><div className={styles.grid}>{options.map(o=><article key={o.key} className={styles.card}><label className={styles.switch}><span><strong>{o.title}</strong><small>{o.desc}</small></span><input type="checkbox" checked={state[o.key]} onChange={e=>{setState(s=>({...s,[o.key]:e.target.checked}));setNotice("Ulagrede lokale forhåndsvisningsvalg. Ingen serverfunksjoner er aktivert.");}} aria-label={"Forhåndsvis "+o.title}/></label><Link href={"/monetize/portal/modules/"+o.key}>Details and settings →</Link></article>)}</div><p role="status" className={styles.small}>{notice||"Alle moduler er avslått som standard. Valgene er bare en forhåndsvisning."}</p><button type="button" className={styles.button} onClick={()=>{setState({...defaults});setNotice("Forhåndsvisningen er nullstilt.");}}>Reset preview</button></section>}