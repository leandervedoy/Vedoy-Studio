"use client";
import {useEffect,useState} from "react";
type InstallPrompt = Event & {
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
};
export function InstallWebApp(){
 const [promptEvent,setPromptEvent]=useState<InstallPrompt|null>(null);
 const [installed,setInstalled]=useState(false);
 const [status,setStatus]=useState("");
 useEffect(()=>{
  const checkInstalled=()=>window.matchMedia("(display-mode: standalone)").matches||Boolean((navigator as Navigator & {standalone?:boolean}).standalone);
  setInstalled(checkInstalled());
  const onPrompt=(event:Event)=>{
   event.preventDefault();
   setPromptEvent(event as InstallPrompt);
  };
  const onInstalled=()=>{
   setInstalled(true);
   setPromptEvent(null);
   setStatus("Appen er nå lagt til på enheten.");
  };
  window.addEventListener("beforeinstallprompt",onPrompt);
  window.addEventListener("appinstalled",onInstalled);
  return ()=>{window.removeEventListener("beforeinstallprompt",onPrompt);window.removeEventListener("appinstalled",onInstalled);};
 },[]);
 async function install(){
  if(!promptEvent)return;
  try{
   await promptEvent.prompt();
   const choice=await promptEvent.userChoice;
   setPromptEvent(null);
   setStatus(choice.outcome==="accepted"?"Installasjonen er startet.":"Du kan installere appen via nettlesermenyen senere.");
  }catch{
   setStatus("Bruk Installér app / Legg til på startskjermen i nettlesermenyen.");
  }
 }
 if(installed)return <div className="app-install-state" role="status">✓ Vedoy Deliver er installert på denne enheten.</div>;
 return <div className="app-install-widget">
  {promptEvent?<button type="button" className="app-install-primary" onClick={()=>void install()}>Installer Vedoy Deliver ↗</button>:
  <div className="app-install-state">Bruk nettlesermenyen for å installere appen på denne enheten.</div>}
  {status&&<p role="status">{status}</p>}
 </div>;
}
