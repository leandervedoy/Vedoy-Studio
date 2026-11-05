"use client";

import {useEffect,useRef,useState} from "react";
import type {Mode,TaskState} from "@/lib/policy";

type Coordinates={latitude:number;longitude:number;accuracy:number};
type Props={
 pickupAddress?:string|null;
 dropoffAddress?:string|null;
 phase?:"claimed"|"picked_up";
 transport?:Mode|"any";
 preview?:boolean;
};
const validCoordinate=(p:Coordinates)=>Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)
 &&p.latitude>=-90&&p.latitude<=90&&p.longitude>=-180&&p.longitude<=180;
function mapUrl(location:Coordinates){
 const {latitude:lat,longitude:lon}=location;
 const lonSpan=0.019/Math.max(0.3,Math.cos(lat*Math.PI/180));
 const bbox=[lon-lonSpan,lat-0.012,lon+lonSpan,lat+0.012].map(n=>n.toFixed(6)).join("%2C");
 return "https://www.openstreetmap.org/export/embed.html?bbox="+bbox
  +"&layer=mapnik&marker="+lat.toFixed(6)+"%2C"+lon.toFixed(6);
}
function directionsUrl(address:string,transport:Props["transport"]){
 const travelmode=transport==="walk"?"walking":transport==="bike"?"bicycling":"driving";
 return "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(address)+"&travelmode="+travelmode;
}

/**
 * GPS is deliberately device-only. watchPosition is started only by a click,
 * never writes coordinates to Supabase, and is stopped on close/unmount.
 * Do not expose a customer's delivery address to a public tracking page.
 */
export function DeliveryGpsMap({pickupAddress,dropoffAddress,phase="picked_up",transport="bike",preview=false}:Props){
 const watchId=useRef<number|null>(null);
 const lastMapUpdate=useRef(0);
 const [tracking,setTracking]=useState(false);
 const [position,setPosition]=useState<Coordinates|null>(null);
 const [mapPosition,setMapPosition]=useState<Coordinates|null>(null);
 const [message,setMessage]=useState("GPS er avslått.");
 const target=phase==="claimed"?pickupAddress:dropoffAddress;
 const targetLabel=phase==="claimed"?"hentestedet":"leveringsadressen";
 const stop=()=>{
  if(watchId.current!==null && typeof navigator!=="undefined" && navigator.geolocation){
   navigator.geolocation.clearWatch(watchId.current);
  }
  watchId.current=null;
  lastMapUpdate.current=0;
  setPosition(null);
  setMapPosition(null);
  setTracking(false);
  setMessage("GPS er slått av. Posisjonen er fjernet fra skjermen.");
 };
 useEffect(()=>()=>{
  if(watchId.current!==null && typeof navigator!=="undefined" && navigator.geolocation){
   navigator.geolocation.clearWatch(watchId.current);
   watchId.current=null;
  }
 },[]);
 function start(){
  if(typeof window==="undefined"||!window.isSecureContext){
   setMessage("GPS krever HTTPS og tillatelse i nettleseren.");return;
  }
  if(!navigator.geolocation){setMessage("Nettleseren støtter ikke GPS.");return;}
  if(watchId.current!==null)return;
  setMessage("Ber om tilgang til posisjonen din…");
  setTracking(true);
  watchId.current=navigator.geolocation.watchPosition(
   ({coords})=>{
    const next={latitude:coords.latitude,longitude:coords.longitude,accuracy:coords.accuracy};
    if(!validCoordinate(next)){setMessage("Ugyldige GPS-koordinater.");return;}
    setPosition(next);
    const now=Date.now();
    // Avoid reloading third-party map tiles on every GPS fix.
    if(now-lastMapUpdate.current>=15000){
     lastMapUpdate.current=now;
     setMapPosition(next);
    }
    setMessage("GPS aktiv – posisjonen vises kun på denne enheten.");
   },
   (error)=>{
    if(watchId.current!==null)navigator.geolocation.clearWatch(watchId.current);
    watchId.current=null;setTracking(false);setPosition(null);setMapPosition(null);
    setMessage(error.code===1?"Du avslo posisjonstilgang. Du kan aktivere det i nettleseren.":"Kunne ikke hente posisjon. Sjekk GPS og internett.");
   },
   {enableHighAccuracy:true,maximumAge:5000,timeout:20000}
  );
 }
 return <section className="delivery-gps" aria-label="GPS-kart for levering">
  <div className="delivery-gps-header">
   <div><span className="eyebrow">KART OG NAVIGASJON</span><h3>{preview?"Prøv GPS-kartet":"GPS for aktiv levering"}</h3></div>
   <span className="delivery-gps-badge">{tracking?"GPS på":"GPS av"}</span>
  </div>
  <p className="delivery-gps-lead">{preview?"Dette er en kartdemo uten ekte leveringsdata.":"Du kan se hvor du er under leveringen og åpne navigasjon til neste stopp."}</p>
  <div className="delivery-gps-actions">
   <button type="button" className="primary" onClick={tracking?stop:start}>{tracking?"Stopp GPS":"Aktiver GPS"}</button>
   {target&&<a className="secondary" target="_blank" rel="noreferrer" href={directionsUrl(target,transport)}>Naviger til {targetLabel} ↗</a>}
  </div>
  <div className="delivery-gps-map">
   {mapPosition?
    <iframe title="OpenStreetMap med din GPS-posisjon" src={mapUrl(mapPosition)} loading="lazy" referrerPolicy="no-referrer"/>:
    <div className="delivery-gps-empty"><strong>GPS-kart</strong><p>Trykk «Aktiver GPS» for å se posisjonen din på kartet.</p></div>}
  </div>
  <p className="delivery-gps-status" role="status" aria-live="polite">{message}{position&&tracking?" Nøyaktighet ca. "+Math.round(position.accuracy)+" meter.":""}</p>
  <p className="fineprint">Personvern: Posisjonen lagres ikke hos Vedøy eller deles med kunder i denne versjonen. Når du aktiverer kartet, sendes kartutsnittet og posisjonen din til OpenStreetMap. GPS stopper når du lukker leveringsvisningen, slår den av eller avslutter oppdraget. Navigasjon åpnes hos Google Maps først når du velger det.</p>
 </section>;
}
