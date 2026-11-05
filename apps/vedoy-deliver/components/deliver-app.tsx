"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import type {User} from "@supabase/supabase-js";
import {backendConfigured,supabase} from "@/lib/supabase";
import {AGE_LABELS,MODE_LABELS,eligibleForTask,money,nextTaskState,taskStateLabel,type AgeBand,type Mode} from "@/lib/policy";
import {YOUTH_RATES,type YouthAgeTier,calculateCompensation} from "@/lib/compensation";
import {DEMO_TASKS,type BusinessRequest,type Courier,type Task,type TaskPrivate} from "@/lib/types";
import {DeliveryGpsMap} from "@/components/delivery-gps-map";

type Tab="jobs"|"account"|"business"|"earnings";
const initialCourier={name:"",age_band:"18_20" as AgeBand,city:"Haugesund",mode:"bike" as Mode,motivation:"",availability:""};
const initialBusiness={company_name:"",org_number:"",contact_name:"",city:"Haugesund",note:""};
function dateLabel(iso:string){return new Date(iso).toLocaleString("nb-NO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});}
function SectionHeader({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}){return <div className="section-head"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p></div>;}

export function DeliverApp(){
 const [tab,setTab]=useState<Tab>("jobs");
 const [payTier,setPayTier]=useState<YouthAgeTier>("17");
 const [payHours,setPayHours]=useState(3);
 const [payDeliveries,setPayDeliveries]=useState(6);
 const [payPhotos,setPayPhotos]=useState(4);
 const [user,setUser]=useState<User|null>(null);
 const [email,setEmail]=useState("");
 const [courier,setCourier]=useState<Courier|null>(null);
 const [business,setBusiness]=useState<BusinessRequest|null>(null);
 const [jobs,setJobs]=useState<Task[]>([]);
 const [privateJob,setPrivateJob]=useState<TaskPrivate|null>(null);
 const [selected,setSelected]=useState<Task|null>(null);
 const [apply,setApply]=useState(initialCourier);
 const [merchant,setMerchant]=useState(initialBusiness);
 const [working,setWorking]=useState(false);
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState("");
 const [modeFilter,setModeFilter]=useState<"all"|Mode>("all");
 const [demoOnly,setDemoOnly]=useState(true);
 const configured=backendConfigured();
 const refresh=useCallback(async(current?:User|null)=>{
  const api=supabase();
  if(!api){setCourier(null);setBusiness(null);setJobs([]);setLoading(false);setDemoOnly(true);return;}
  const next=current===undefined?(await api.auth.getUser()).data.user:current;
  setUser(next||null);
  if(!next){setCourier(null);setBusiness(null);setJobs([]);setDemoOnly(false);setLoading(false);return;}
  const [c,b,j]=await Promise.all([
    api.from("vdeliver_couriers").select("*").eq("user_id",next.id).maybeSingle(),
    api.from("vdeliver_business_requests").select("*").eq("owner_id",next.id).maybeSingle(),
    api.from("vdeliver_tasks").select("*").order("scheduled_at",{ascending:true}).limit(100)
  ]);
  setCourier(c.data as Courier|null);
  setBusiness(b.data as BusinessRequest|null);
  setJobs((j.data||[]) as Task[]);
  setDemoOnly(Boolean(j.error));
  if(c.error||b.error||j.error)setNotice("Databasen er ikke klargjort for Vedoy Deliver. Visningen er foreløpig en demonstrasjon.");
  setLoading(false);
 },[]);
 useEffect(()=>{
  const api=supabase();
  if(!api){setLoading(false);return;}
  let live=true;
  void api.auth.getUser().then(({data})=>{if(live)void refresh(data.user);});
  const {data}=api.auth.onAuthStateChange((event,session)=>{
   if(!live)return;
   if(event==="SIGNED_IN"||event==="SIGNED_OUT")setTimeout(()=>{if(live)void refresh(session?.user||null);},0);
  });
  return ()=>{live=false;data.subscription.unsubscribe();};
 },[refresh]);
 const sample=!configured||demoOnly;
 const available=useMemo(()=>((sample?DEMO_TASKS:jobs).filter(t=>t.status==="open"&&(modeFilter==="all"||t.transport==="any"||t.transport===modeFilter))).sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at)),[jobs,sample,modeFilter]);
 const myJobs=useMemo(()=>jobs.filter(t=>t.courier_id===user?.id).sort((a,b)=>b.scheduled_at.localeCompare(a.scheduled_at)),[jobs,user]);
 const earned=myJobs.filter(t=>t.status==="verified").reduce((a,b)=>a+b.reward_ore,0);
 const awaiting=myJobs.filter(t=>t.status==="delivered").reduce((a,b)=>a+b.reward_ore,0);

 async function login(){
  const api=supabase();
  if(!api){setNotice("Innlogging aktiveres når Supabase er koblet til.");return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setNotice("Skriv inn en gyldig e-postadresse.");return;}
  setWorking(true);setNotice("");
  const {error}=await api.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
  setNotice(error?"Kunne ikke sende innloggingslenke. Prøv igjen.":"Sjekk e-posten din for innloggingslenken.");
  setWorking(false);
 }
 async function verifyIdentity(){
  const api=supabase();if(!api||!user)return;
  setWorking(true);setNotice("");
  try{
   const {data}=await api.auth.getSession();
   const token=data.session?.access_token;
   if(!token)throw new Error("Not logged in");
   const result=await fetch("/api/identity/start",{method:"POST",headers:{Authorization:"Bearer "+token}});
   const body=await result.json();
   if(!result.ok||!body.url)throw new Error("Verification unavailable");
   window.location.assign(body.url);
  }catch{setNotice("BankID-verifisering er ikke tilgjengelig før Signicat er konfigurert.");setWorking(false);}
 }
 async function logout(){
  const api=supabase();if(!api)return;
  await api.auth.signOut();setNotice("Du er logget ut.");setSelected(null);setPrivateJob(null);
 }
 async function registerCourier(){
  const api=supabase();if(!api||!user)return;
  if(apply.name.trim().length<2||apply.motivation.trim().length<20||apply.availability.trim().length<5){setNotice("Fyll ut navn, motivasjon (minst 20 tegn) og tilgjengelighet.");return;}
  if(apply.age_band==="15_17"&&apply.mode==="car"){setNotice("Biloppdrag er ikke tilgjengelige for 15–17-åringer.");return;}
  setWorking(true);setNotice("");
  const row={user_id:user.id,name:apply.name.trim().slice(0,90),age_band:apply.age_band,city:apply.city.trim().slice(0,80),mode:apply.mode,
    motivation:apply.motivation.trim().slice(0,1000),availability:apply.availability.trim().slice(0,300),status:"pending",minor_checked:false};
  const {error}=await api.from("vdeliver_couriers").insert(row);
  if(error)setNotice("Kunne ikke sende søknaden. Kontroller feltene og prøv igjen.");
  else{setNotice("Søknaden er sendt. Vedøy kontrollerer alder, opplæring og vilkår før godkjenning.");await refresh(user);}
  setWorking(false);
 }
 async function registerBusiness(){
  const api=supabase();if(!api||!user)return;
  if(!/^\d{9}$/.test(merchant.org_number)||merchant.company_name.trim().length<2||merchant.note.trim().length<15){
    setNotice("Oppgi foretaksnavn, organisasjonsnummer (9 sifre) og beskriv leveringsbehovet.");return;
  }
  setWorking(true);setNotice("");
  const row={owner_id:user.id,company_name:merchant.company_name.trim().slice(0,110),org_number:merchant.org_number,
    contact_name:merchant.contact_name.trim().slice(0,90),city:merchant.city.trim().slice(0,80),note:merchant.note.trim().slice(0,1400),status:"pending"};
  const {error}=await api.from("vdeliver_business_requests").insert(row);
  if(error)setNotice("Kunne ikke sende bedriftsforespørselen. Kontroller feltene og prøv igjen.");
  else{setNotice("Forespørselen er registrert. Dette er ikke en leveringsbestilling.");await refresh(user);}
  setWorking(false);
 }
 async function showJob(task:Task){
  setSelected(task);setPrivateJob(null);
  const api=supabase();
  if(!api||task.demo||task.courier_id!==user?.id||!["claimed","picked_up","delivered"].includes(task.status))return;
  const {data}=await api.from("vdeliver_task_private").select("*").eq("task_id",task.id).maybeSingle();
  setPrivateJob(data as TaskPrivate|null);
 }
 async function claim(task:Task){
  const api=supabase();
  if(!api||!user||!courier||task.demo)return;
  if(!eligibleForTask(courier,task)){setNotice("Dette oppdraget er ikke tilgjengelig for din godkjente profil.");return;}
  setWorking(true);setNotice("");
  const {data,error}=await api.from("vdeliver_tasks")
   .update({status:"claimed",courier_id:user.id,claimed_at:new Date().toISOString()})
   .eq("id",task.id).eq("status","open").is("courier_id",null).select("*").maybeSingle();
  if(error||!data)setNotice("Oppdraget ble ikke tildelt. Det kan være reservert av noen andre.");
  else{setNotice("Du har fått oppdraget! Hente- og leveringsdetaljer er nå tilgjengelige.");await refresh(user);await showJob({...data,courier_id:user.id} as Task);}
  setWorking(false);
 }
 async function progress(task:Task){
  const api=supabase();if(!api||!user||task.demo)return;
  const next=nextTaskState(task.status);if(!next)return;
  setWorking(true);setNotice("");
  const {data,error}=await api.from("vdeliver_tasks")
   .update({status:next}).eq("id",task.id).eq("courier_id",user.id).eq("status",task.status).select("*").maybeSingle();
  if(error||!data)setNotice("Kunne ikke oppdatere oppdraget. Oppdater oversikten og prøv igjen.");
  else{setNotice(next==="delivered"?"Leveringen er sendt til kontroll. Beløpet blir ikke utbetalt automatisk.":"Oppdraget er oppdatert.");setSelected({...data} as Task);await refresh(user);}
  setWorking(false);
 }
 const active=myJobs.find(t=>t.status==="claimed"||t.status==="picked_up");
 const eligible=selected&&courier?eligibleForTask(courier,selected):false;
 function taskCard(task:Task){
  const isMine=task.courier_id===user?.id&&!task.demo;
  const canClaim=!task.demo&&courier&&eligibleForTask(courier,task);
  return <article className="job-card" key={task.id}>
   <div className="job-head"><span className="merchant-avatar">↗</span><div><strong>{task.merchant_name}</strong><small>{task.demo?"ILLUSTRASJON · IKKE ET EKTE OPPDRAG":taskStateLabel(task.status)}</small></div><span className="task-pay">{money(task.reward_ore)}</span></div>
   <h3>{task.pickup_area} <span>→</span> {task.dropoff_area}</h3>
   <div className="pills"><span>◷ {task.estimated_minutes} min estimert</span><span>⌖ {task.distance_km.toLocaleString("nb-NO")} km</span><span>{task.transport==="any"?"Flere transportmåter":MODE_LABELS[task.transport]}</span><span>{task.min_age}+</span></div>
   <div className="job-bottom"><small>{dateLabel(task.scheduled_at)} · Godtgjørelse per oppdrag</small><button className="small-btn" onClick={()=>void showJob(task)}>{isMine?"Åpne oppdrag":"Se detaljer"} ↗</button></div>
   {canClaim&&<span className="sr-only">Du kan søke om å ta dette oppdraget.</span>}
  </article>;
 }
 return <div className="deliver-shell">
  <header className="topbar"><a className="brand" href="/" aria-label="Vedoy Deliver forside"><span className="logo"><img src="/vedoy-deliver-icon.png" alt="" width={44} height={44}/></span><span>vedoy<strong>deliver</strong></span></a>
   <nav aria-label="Hovednavigasjon">{([{id:"jobs",name:"Oppdrag"},{id:"earnings",name:"Min opptjening"},{id:"business",name:"For bedrifter"},{id:"account",name:"Min konto"}] as const).map(item=>
    <button key={item.id} className={tab===item.id?"nav-item active":"nav-item"} onClick={()=>{setTab(item.id);setNotice("");}}>{item.name}</button>)}</nav>
   <button className="top-cta" onClick={()=>setTab(user?"jobs":"account")}>{user?"Finn leveringer":"Bli bud"} ↗</button></header>
  <main>
   {tab==="jobs"&&<><section className="hero"><div className="hero-content"><span className="hero-badge">FLEKSIBEL LEVERING · HAUGALANDET</span><h1>Din tid.<br/><em>Ditt oppdrag.</em></h1><p>Bli med i Vedoy Deliver. Velg leveringer som passer hverdagen din og se betalingen før du takker ja.</p><div className="hero-actions"><button className="primary" onClick={()=>document.getElementById("jobs")?.scrollIntoView({behavior:"smooth"})}>Se ledige leveringer ↗</button><button className="secondary" onClick={()=>setTab("account")}>Søk om å bli bud</button></div><div className="hero-notes"><span>✓ Du velger tilgjengelige oppdrag</span><span>✓ Betaling vises på forhånd</span><span>✓ Opplæring og godkjenning</span></div></div><div className="hero-graphic" aria-hidden="true"><div className="big-circle"><span>↗</span></div><div className="floating-pill upper">Fra butikk til dør</div><div className="floating-pill lower">Tryggere lokale leveringer</div></div></section>
    {active&&<section className="active-strip"><div><small>PÅGÅENDE OPPDRAG</small><strong>{active.merchant_name} · {taskStateLabel(active.status)}</strong></div><button className="small-btn" onClick={()=>void showJob(active)}>Fortsett ↗</button></section>}
    <section className="main-section" id="jobs"><SectionHeader eyebrow="LEVERINGER" title="Oppdrag du kan velge." copy="Godtgjørelsen og forventet tidsbruk står på hvert kort. Kun godkjente bud kan akseptere ekte oppdrag."/>
      <div className="filters" aria-label="Filtrer etter transportmåte">{([{id:"all",label:"Alle"},{id:"walk",label:"Til fots"},{id:"bike",label:"Sykkel"},{id:"car",label:"Bil"}] as const).map(f=><button key={f.id} className={modeFilter===f.id?"filter selected":"filter"} onClick={()=>setModeFilter(f.id)}>{f.label}</button>)}</div>
      {(sample||!user||courier?.status!=="approved")&&<div className="notice-bar">{sample?"Demooppdrag – ingen av disse kan bestilles eller gi opptjening.":!user?"Logg inn og søk om medlemskap for å se ekte leveringer.":courier?.status==="pending"?"Søknaden din behandles. Du kan ikke ta oppdrag ennå.":"Bare godkjente bud kan ta leveringsoppdrag."}</div>}
      <div className="cards">{available.length?available.map(taskCard):<div className="empty"><h3>Ingen åpne leveringer akkurat nå</h3><p>Registrer deg for å være klar når oppdrag blir tilgjengelige.</p></div>}</div>
    </section>
    <section className="steps"><SectionHeader eyebrow="SLIK FUNGERER DET" title="Tre enkle steg." copy="Vi tar sikkerhet, godkjenning og arbeidsvilkår på alvor."/><div className="step-grid">{[["01","Søk medlemskap","Oppgi aldergruppe, by og ønsket transportmåte."],["02","Bli godkjent","Vedøy gjennomgår kvalifikasjoner, trygghet og avtale."],["03","Ta leveringer","Se betaling og oppdragsdetaljer, og velg når du kan jobbe."]].map(s=><div className="step" key={s[0]}><span>{s[0]}</span><h3>{s[1]}</h3><p>{s[2]}</p></div>)}</div></section></>}
   {tab==="account"&&<section className="interior"><SectionHeader eyebrow="KURIERPORTAL" title={user?"Din budprofil.":"Bli en del av Vedoy Deliver."} copy="Søknad er gratis. Du blir ikke ansatt eller lovet oppdrag ved å sende den."/>
    {!configured&&<div className="notice-bar">Demo – databasen og innlogging er ikke koblet til ennå.</div>}
    {!user?<div className="panel narrow"><h3>Logg inn med e-post</h3><p>Du får en sikker innloggingslenke. Alders- og identitetskontroll skjer før du kan jobbe.</p><form onSubmit={e=>{e.preventDefault();void login();}} className="form"><label>E-post<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="navn@eksempel.no"/></label><button className="primary" disabled={working||!configured}>Send innloggingslenke ↗</button><small>Les <a href="/personvern">hvordan vi behandler personopplysninger</a> før du registrerer deg.</small></form></div>:
     courier?<div className="panel"><div className="row-between"><div><h3>{courier.name}</h3><p>{AGE_LABELS[courier.age_band]} · {courier.city} · {MODE_LABELS[courier.mode]}</p></div><span className="status-tag">{({pending:"Under vurdering",approved:"Godkjent",declined:"Avslått",suspended:"Midlertidig stengt"})[courier.status]}</span></div><p className="fineprint">Medlemskap gir tilgang til å søke leveringer, ikke automatisk ansettelse eller rett til et bestemt antall oppdrag. Avtale, lønn, forsikring og opplæring må være på plass før arbeid.</p><div className="identity-box"><strong>Identitetskontroll med BankID</strong><p>Identitet og alder må verifiseres gjennom Signicat før du kan bli godkjent som bud. Dette godkjenner ikke søknaden automatisk.</p><button className="secondary" disabled={working} onClick={()=>void verifyIdentity()}>Verifiser med BankID ↗</button></div><button className="secondary" onClick={()=>void logout()}>Logg ut</button></div>:
     <div className="panel"><h3>Søk om medlemskap</h3><form className="form two-col" onSubmit={e=>{e.preventDefault();void registerCourier();}}>
      <label>Fullt navn<input required minLength={2} maxLength={90} value={apply.name} onChange={e=>setApply(p=>({...p,name:e.target.value}))}/></label>
      <label>Aldersgruppe<select value={apply.age_band} onChange={e=>setApply(p=>({...p,age_band:e.target.value as AgeBand,mode:e.target.value==="15_17"&&p.mode==="car"?"bike":p.mode}))}>{Object.entries(AGE_LABELS).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
      <label>By<input required minLength={2} maxLength={80} value={apply.city} onChange={e=>setApply(p=>({...p,city:e.target.value}))}/></label>
      <label>Transport<select value={apply.mode} onChange={e=>setApply(p=>({...p,mode:e.target.value as Mode}))}>{Object.entries(MODE_LABELS).filter(([v])=>apply.age_band!=="15_17"||v!=="car").map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
      <label className="full">Hvorfor vil du være bud?<textarea required minLength={20} maxLength={1000} rows={4} value={apply.motivation} onChange={e=>setApply(p=>({...p,motivation:e.target.value}))} placeholder="Fortell litt om deg selv og hvorfor du vil levere..."/></label>
      <label className="full">Når er du tilgjengelig?<textarea required minLength={5} maxLength={300} rows={2} value={apply.availability} onChange={e=>setApply(p=>({...p,availability:e.target.value}))} placeholder="For eksempel hverdager etter kl. 16..."/></label>
      <p className="fineprint full">For 15–17-åringer kreves særskilt vurdering av arbeidstid og ruter, tilrettelegging og eventuell foresattes involvering. Bilkjøring er ikke mulig i denne gruppen. Før aktiv levering må Vedøy avklare ansettelsesform, lønn, forsikring og HMS.</p>
      <button className="primary full" type="submit" disabled={working}>Send søknad ↗</button></form></div>}
   </section>}
   {tab==="earnings"&&<section className="interior"><SectionHeader eyebrow="DINE LEVERINGER" title="Oversikt over opptjening." copy="Inntekt vises kun for leveringer som Vedøy har kontrollert og godkjent. Utbetaling skjer utenfor piloten."/>
    <div className="panel"><h3>Foreslått lønn og Vedoy Coins</h3><p>Grunnlønn per betalt time og bonuspoeng etter godkjente oppdrag. Dette er en beregner, ikke registrert lønn eller utstedte coins.</p><div className="form two-col"><label>Aldersgruppe<select value={payTier} onChange={e=>setPayTier(e.target.value as YouthAgeTier)}><option value="15_16">15–16 år</option><option value="17">17 år</option><option value="18_plus">18 år og eldre</option></select></label><label>Timer<input type="number" min="0" max="24" step="0.5" value={payHours} onChange={e=>setPayHours(Math.max(0,Number(e.target.value)||0))}/></label><label>Godkjente leveringer<input type="number" min="0" step="1" value={payDeliveries} onChange={e=>setPayDeliveries(Math.max(0,Math.floor(Number(e.target.value)||0)))}/></label><label>Godkjente reklamebilder<input type="number" min="0" step="1" value={payPhotos} onChange={e=>setPayPhotos(Math.max(0,Math.floor(Number(e.target.value)||0)))}/></label></div><div className="stat-grid"><div className="stat"><small>Timelønn</small><strong>{YOUTH_RATES[payTier].hourlyNok} kr/t</strong></div><div className="stat"><small>Bruttolønn (eksempel)</small><strong>{calculateCompensation(payTier,payHours*60,payDeliveries,payPhotos).grossWageNok.toLocaleString("nb-NO")} kr</strong></div><div className="stat"><small>Vedoy Coins (eksempel)</small><strong>{calculateCompensation(payTier,payHours*60,payDeliveries,payPhotos).coins} coins</strong></div></div><p className="fineprint">Bonus: {YOUTH_RATES[payTier].deliveryCoins} coins per godkjent levering og {YOUTH_RATES[payTier].mailboxPhotoCoins} coins per godkjent reklamebilde. Reklameutdeling krever lovlig oppdrag og personvernkontroll. Coins har foreløpig ingen fastsatt kroneverdi.</p></div><div className="stat-grid"><div className="stat"><small>Godkjent opptjening</small><strong>{money(earned)}</strong><p>Ikke automatisk utbetalt</p></div><div className="stat"><small>Avventer kontroll</small><strong>{money(awaiting)}</strong><p>Utførte oppdrag</p></div><div className="stat"><small>Dine leveringer</small><strong>{myJobs.length}</strong><p>Totalt antall tildelte</p></div></div>
    {!user?<div className="panel"><p>Logg inn for å se dine faktiske leveringer.</p><button className="secondary" onClick={()=>setTab("account")}>Logg inn ↗</button></div>:<div className="panel"><h3>Oppdragshistorikk</h3>{myJobs.length?myJobs.map(j=><button className="history" key={j.id} onClick={()=>void showJob(j)}><span>{j.merchant_name}<small>{dateLabel(j.scheduled_at)} · {taskStateLabel(j.status)}</small></span><strong>{money(j.reward_ore)}</strong></button>):<p>Du har ingen registrerte leveringer ennå.</p>}</div>}</section>}
   {tab==="business"&&<section className="interior"><SectionHeader eyebrow="FOR BEDRIFTER" title="Lever lokalt. Enklere." copy="La Vedoy Deliver organisere bud for din butikk eller restaurant når vi åpner tjenesten."/>
    <div className="merchant-hero"><div><h3>En fremtidig leveringspartner for lokale bedrifter.</h3><p>Forespørselen er uforpliktende. Vi må først bekrefte kapasitet, priser og leveringsområde. Wolt Drive er kun en mulig reserve, ikke en aktiv integrasjon.</p></div><span className="merchant-symbol">↗</span></div>
    {!user?<div className="panel"><h3>Meld din bedrift</h3><p>Logg inn for å sende interesse.</p><button className="primary" onClick={()=>setTab("account")}>Logg inn ↗</button></div>:
     business?<div className="panel"><h3>{business.company_name}</h3><p>Forespørsel registrert · {({pending:"Venter på gjennomgang",approved:"Godkjent for dialog",rejected:"Ikke godkjent"})[business.status]}</p></div>:
     <div className="panel"><h3>Meld interesse</h3><form className="form two-col" onSubmit={e=>{e.preventDefault();void registerBusiness();}}>
      <label>Bedriftsnavn<input required minLength={2} maxLength={110} value={merchant.company_name} onChange={e=>setMerchant(p=>({...p,company_name:e.target.value}))}/></label>
      <label>Organisasjonsnummer<input required pattern="[0-9]{9}" inputMode="numeric" value={merchant.org_number} onChange={e=>setMerchant(p=>({...p,org_number:e.target.value}))}/></label>
      <label>Kontaktperson<input required minLength={2} maxLength={90} value={merchant.contact_name} onChange={e=>setMerchant(p=>({...p,contact_name:e.target.value}))}/></label>
      <label>By<input required minLength={2} maxLength={80} value={merchant.city} onChange={e=>setMerchant(p=>({...p,city:e.target.value}))}/></label>
      <label className="full">Beskriv leveringsbehovet<textarea required minLength={15} maxLength={1400} rows={4} value={merchant.note} onChange={e=>setMerchant(p=>({...p,note:e.target.value}))} placeholder="Hvor ofte ønsker du levering, og hvilken type varer?"/></label>
      <button className="primary full" disabled={working||!configured}>Send forespørsel ↗</button></form></div>}
   </section>}
  </main>
  <footer className="footer"><div><a className="brand" href="/"><span className="logo"><img src="/vedoy-deliver-icon.png" alt="" width={44} height={44}/></span><span>vedoy<strong>deliver</strong></span></a><p>Lokale leveringer. Nye muligheter.</p></div><div><strong>Vedoy</strong><a href="https://vedoystudio.no" target="_blank" rel="noreferrer">Vedoy Studio ↗</a><a href="https://vedoystudio.no/projects/deliver" target="_blank" rel="noreferrer">Om konseptet ↗</a></div><p className="footer-note">Pilot under utvikling. Ingen levende oppdrag, bestillinger, lønnsutbetalinger eller Wolt-integrasjon er aktivert. <a href="/levering">Prøv GPS-kartet</a> · <a href="/bedrift">For bedrifter</a> · <a href="/personvern">Personvern</a> · <a href="/vilkar">Pilotvilkår</a></p></footer>
  <nav className="mobile-nav" aria-label="Mobilnavigasjon">{([{id:"jobs",text:"Oppdrag",icon:"⌂"},{id:"earnings",text:"Opptjening",icon:"◷"},{id:"business",text:"Bedrifter",icon:"▤"},{id:"account",text:"Profil",icon:"◉"}] as const).map(i=><button key={i.id} className={tab===i.id?"selected":""} onClick={()=>{setTab(i.id);setNotice("");}}><span>{i.icon}</span>{i.text}</button>)}</nav>
  {notice&&<div className="toast" role="status"><span>{notice}</span><button aria-label="Lukk melding" onClick={()=>setNotice("")}>×</button></div>}
  {selected&&<div className="overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget){setSelected(null);setPrivateJob(null);}}}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="job-detail"><button className="close" aria-label="Lukk" onClick={()=>{setSelected(null);setPrivateJob(null);}}>×</button>
   <span className="eyebrow">{selected.demo?"DEMONSTRASJON":"LEVERINGSOPPDRAG"}</span><h2 id="job-detail">{selected.merchant_name}</h2>
   <div className="route"><div><span className="route-dot start"/><div><small>HENTEOMRÅDE</small><strong>{selected.pickup_area}</strong>{privateJob&&<p>{privateJob.pickup_address}</p>}</div></div><div><span className="route-dot end"/><div><small>LEVERINGSOMRÅDE</small><strong>{selected.dropoff_area}</strong>{privateJob&&<p>{privateJob.dropoff_address}</p>}</div></div></div>
   {privateJob&&<div className="private-details"><strong>Mottakeropplysninger</strong><p>{privateJob.recipient_name}{privateJob.recipient_phone?" · "+privateJob.recipient_phone:""}</p>{privateJob.delivery_note&&<p>{privateJob.delivery_note}</p>}</div>}
   {selected.courier_id===user?.id&&!selected.demo&&(selected.status==="claimed"||selected.status==="picked_up")&&privateJob&&<DeliveryGpsMap key={selected.id+"-"+selected.status} pickupAddress={privateJob.pickup_address} dropoffAddress={privateJob.dropoff_address} phase={selected.status} transport={selected.transport}/>}
   <div className="dialog-facts"><span>{money(selected.reward_ore)} per levering</span><span>Ca. {selected.estimated_minutes} minutter</span><span>{selected.distance_km} km</span><span>{selected.min_age}+</span></div>
   <p className="fineprint">Beløpet er oppdragsgodtgjørelse før endelig oppgjør. Lovbestemte lønns- og arbeidsvilkår gjelder. Kun admin kan kontrollere fullføring og registrere godkjent opptjening.</p>
   {selected.demo?<div className="notice-bar">Dette er kun et illustrert oppdrag. Det kan ikke aksepteres.</div>:selected.status==="open"?courier?.status==="approved"?<button className="primary block" disabled={!eligible||working} onClick={()=>void claim(selected)}>{eligible?"Ta leveringen ↗":"Ikke tilgjengelig for din profil"}</button>:<button className="secondary block" onClick={()=>{setSelected(null);setTab("account");}}>Søk om medlemskap først ↗</button>:
    selected.courier_id===user?.id&&nextTaskState(selected.status)?<button className="primary block" disabled={working} onClick={()=>void progress(selected)}>{selected.status==="claimed"?"Jeg har hentet pakken ↗":"Jeg har levert pakken ↗"}</button>:<div className="notice-bar">Status: {taskStateLabel(selected.status)}</div>}
  </section></div>}
 </div>;
}
