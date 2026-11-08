"use client";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isBackendConfigured } from "@/lib/supabase";
import { AGE_BANDS,CATEGORY_AGE,CATEGORY_ICONS,CATEGORY_LABELS,EXAMPLES,eligibleToExpressInterest,formatNok,type AgeBand,type Category,type Job } from "@/lib/jobs";

type Profile={user_id:string;display_name:string;account_type:"worker"|"business";age_band:AgeBand;city:string};
type Application={id:string;job_id:string;status:string;created_at:string;message:string};
type Page="browse"|"employer"|"account";
const modes:{id:Page;label:string}[]=[{id:"browse",label:"Finn oppdrag"},{id:"employer",label:"For bedrifter"},{id:"account",label:"Min side"}];
const categories=Object.entries(CATEGORY_LABELS) as [Category,string][];
const initialJob={title:"",description:"",category:"writing" as Category,city:"Haugesund",pay_ore:"",estimated_minutes:"60",min_age:"18",employer_name:"",backup_enabled:false};
export function Marketplace(){
 const [page,setPage]=useState<Page>("browse");
 const [category,setCategory]=useState<"all"|Category>("all");
 const [search,setSearch]=useState("");
 const [user,setUser]=useState<User|null>(null);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [jobs,setJobs]=useState<Job[]>([]);
 const [applications,setApplications]=useState<Application[]>([]);
 const [myJobs,setMyJobs]=useState<Job[]>([]);
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState("");
 const [email,setEmail]=useState("");
 const [signupName,setSignupName]=useState("");
 const [signupRole,setSignupRole]=useState<"worker"|"business">("worker");
 const [signupAge,setSignupAge]=useState<AgeBand>("");
 const [signupCity,setSignupCity]=useState("Haugesund");
 const [working,setWorking]=useState(false);
 const [selected,setSelected]=useState<Job|null>(null);
 const [applicationText,setApplicationText]=useState("");
 const [jobForm,setJobForm]=useState(initialJob);
 const backend=isBackendConfigured();
 const supabase=getSupabase();
 async function refresh(activeUser?:User|null){
  const active=activeUser===undefined?user:activeUser;
  if(!supabase){setJobs([]);setApplications([]);setMyJobs([]);setProfile(null);setLoading(false);return;}
  if(!active){
    const {data,error}=await supabase.from("vjobs_jobs").select("id,title,description,category,city,pay_ore,estimated_minutes,min_age,employer_name,backup_enabled,status,created_at").eq("status","open").order("created_at",{ascending:false}).limit(100);
    setJobs((data||[]) as Job[]);if(error)setNotice("Kunne ikke hente offentlige oppdrag.");setProfile(null);setApplications([]);setMyJobs([]);setLoading(false);return;
  }
  const [p,j,a,o]=await Promise.all([
    supabase.from("vjobs_profiles").select("*").eq("user_id",active.id).maybeSingle(),
    supabase.from("vjobs_jobs").select("*").eq("status","open").order("created_at",{ascending:false}).limit(100),
    supabase.from("vjobs_applications").select("id,job_id,status,created_at,message").eq("applicant_id",active.id).order("created_at",{ascending:false}),
    supabase.from("vjobs_jobs").select("*").eq("owner_id",active.id).order("created_at",{ascending:false})
  ]);
  if(p.error||j.error||a.error||o.error){
    setNotice("Oppdrag er ikke koblet til databasen ennå. Administrator må kjøre oppsettet.");
  }else{
    setProfile(p.data as Profile|null);
    setJobs((j.data||[]) as Job[]);
    setApplications((a.data||[]) as Application[]);
    setMyJobs((o.data||[]) as Job[]);
  }
  setLoading(false);
 }
 useEffect(()=>{
  const client=getSupabase();
  if(!client){setLoading(false);return;}
  let mounted=true;
  void client.auth.getUser().then(({data})=>{if(!mounted)return;const next=data.user||null;setUser(next);void refresh(next);});
  const subscription=client.auth.onAuthStateChange((_event,session)=>{
    const next=session?.user||null;
    if(mounted){setUser(next);setTimeout(()=>{if(mounted)void refresh(next);},0);}
  });
  return ()=>{mounted=false;subscription.data.subscription.unsubscribe();};
 // Intentional: refresh is called only on auth changes and manual actions, not every render.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const sampleMode=!backend||(!jobs.length&&!loading);
 const visibleJobs=useMemo(()=>{
  const base=sampleMode?EXAMPLES:jobs;
  const needle=search.toLocaleLowerCase("nb-NO").trim();
  return base.filter(job=>(category==="all"||job.category===category)&&(!needle||[job.title,job.description,job.city,job.employer_name].join(" ").toLocaleLowerCase("nb-NO").includes(needle)));
 },[jobs,category,search,sampleMode]);
 async function signIn(){
  if(!supabase){setNotice("Innlogging aktiveres når Supabase er koblet til.");return;}
  setWorking(true);setNotice("");
  const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
  setNotice(error?"Kunne ikke sende innloggingslenke: "+error.message:"Sjekk e-posten din for en sikker innloggingslenke.");
  setWorking(false);
 }
 async function registerProfile(){
  if(!supabase||!user)return;
  if(signupName.trim().length<2){setNotice("Skriv inn et visningsnavn.");return;}
  if(!signupAge){setNotice("Velg aldersgruppe før du fortsetter.");return;}
  if(signupRole==="business"&&signupAge==="15_17"){setNotice("Bedriftskontoer i piloten krever at du er minst 18 år.");return;}
  setWorking(true);setNotice("");
  const row={user_id:user.id,display_name:signupName.trim().slice(0,90),account_type:signupRole,age_band:signupAge,city:signupCity.trim().slice(0,80)};
  const {error}=await supabase.from("vjobs_profiles").insert(row);
  if(error)setNotice("Kunne ikke opprette profil: "+error.message);
  else{setNotice("Profilen er opprettet.");await refresh();}
  setWorking(false);
 }
 async function apply(){
  if(!supabase||!user||!selected)return;
  if(selected.demo){setNotice("Dette er et illustrert eksempel, ikke en reell utlysning.");return;}
  if(!profile||profile.account_type!=="worker"){setNotice("Opprett en arbeidssøkerprofil først.");setPage("account");setSelected(null);return;}
  if(!eligibleToExpressInterest(selected,profile.age_band)){setNotice("Dette oppdraget er ikke tilgjengelig for din valgte aldersgruppe.");return;}
  if(applicationText.trim().length<10){setNotice("Skriv minst 10 tegn om hvorfor du ønsker oppdraget.");return;}
  setWorking(true);
  const {error}=await supabase.from("vjobs_applications").insert({job_id:selected.id,applicant_id:user.id,message:applicationText.trim(),status:"pending"});
  if(error)setNotice(error.code==="23505"?"Du har allerede søkt på dette oppdraget.":"Kunne ikke sende interesse: "+error.message);
  else{setNotice("Interessen er sendt til bedriften. Dette er ikke en ansettelse eller en betalingsgaranti.");setSelected(null);setApplicationText("");await refresh();}
  setWorking(false);
 }
 async function postJob(){
  if(!supabase||!user||profile?.account_type!=="business"){setNotice("Logg inn med en bedriftskonto før du legger inn oppdrag.");return;}
  const amount=Number(jobForm.pay_ore);
  const minutes=Number(jobForm.estimated_minutes);
  if(!Number.isFinite(amount)||amount<10||amount>200000||!Number.isInteger(minutes)||minutes<15||minutes>480){setNotice("Kontroller honorar og estimert tidsbruk.");return;}
  if(jobForm.title.trim().length<8||jobForm.description.trim().length<30){setNotice("Skriv en tydelig tittel og en oppdragsbeskrivelse på minst 30 tegn.");return;}
  setWorking(true);setNotice("");
  const record={owner_id:user.id,title:jobForm.title.trim(),description:jobForm.description.trim(),category:jobForm.category,city:jobForm.city.trim()||"Haugesund",pay_ore:Math.round(amount*100),estimated_minutes:minutes,min_age:CATEGORY_AGE[jobForm.category],employer_name:profile.display_name,backup_enabled:jobForm.category==="delivery"&&jobForm.backup_enabled,status:"pending_review"};
  const {error}=await supabase.from("vjobs_jobs").insert(record);
  if(error)setNotice("Kunne ikke sende oppdraget: "+error.message);
  else{setNotice("Oppdraget venter på godkjenning fra Vedøy før noen kan søke.");setJobForm(initialJob);await refresh();}
  setWorking(false);
 }
 async function signOut(){if(supabase)await supabase.auth.signOut();setUser(null);setProfile(null);setPage("browse");}
 return <div className="app-shell">
  <header className="nav">
   <a href="/" className="brand"><span className="brand-mark">V.</span><span>VEDOY<span className="brand-green">JOBS</span></span></a>
   <nav aria-label="Hovedmeny" className="main-nav">{modes.map(mode=><button type="button" key={mode.id} className={page===mode.id?"nav-link active":"nav-link"} onClick={()=>setPage(mode.id)}>{mode.label}</button>)}</nav>
   <button type="button" className="account-btn" onClick={()=>setPage("account")}>{user?(profile?.display_name||"Opprett profil"):"Kom i gang"} <span>↗</span></button>
  </header>
  <main>
   {page==="browse"&&<>
    <section className="hero">
     <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> FLEKSIBLE OPPDRAG · LAGET FOR NORGE</span><h1>Din tid.<br/><em>Dine muligheter.</em></h1><p>Finn betalte oppdrag som passer hverdagen din. Skriv, skap, hjelp bedrifter eller lever lokalt – når du har tid.</p>
      <div className="hero-actions"><button className="primary" onClick={()=>document.getElementById("oppdrag")?.scrollIntoView({behavior:"smooth"})}>Se oppdrag <span>↗</span></button><button className="outline" onClick={()=>setPage("employer")}>For bedrifter</button></div>
      <div className="hero-facts"><span>◉ Fra 15 år i utvalgte oppdrag</span><span>◉ Velg selv når du søker</span><span>◉ Tydelig honorar</span></div>
     </div>
     <div className="hero-visual" aria-label="Eksempel på oppdrag">
      <div className="floating-card fc-top"><span className="tiny-label">FLEKSIBEL INNTEKT</span><strong>Små jobber.<br/>Store muligheter.</strong><div className="card-shapes"><span>✍</span><span>⌘</span><span>↗</span></div></div>
      <div className="floating-card fc-bottom"><span className="tiny-label">OPPDRAG · EKSEMPEL</span><div><span className="job-bubble">✍</span><strong>Skriv en teknologiguide</strong></div><span className="sample-pay">300 kr <small>Eksempelbeløp</small></span></div>
     </div>
    </section>
    <section className="browse-section" id="oppdrag">
     <div className="section-intro"><div><span className="eyebrow">UTFORSK</span><h2>Finn noe som <em>passer deg.</em></h2></div><span className="counter">{visibleJobs.length} {sampleMode?"eksempeloppdrag":"tilgjengelige oppdrag"}</span></div>
     {sampleMode&&<div className="demo-note"><strong>Demovisning</strong> – kortene nedenfor er illustrative eksempler, ikke ekte betalte oppdrag. Nye oppdrag åpnes først når bedrifter og Vedøy har godkjent dem.</div>}
     <div className="search-row"><label className="search-box"><span>⌕</span><input aria-label="Søk oppdrag" placeholder="Søk etter oppdrag eller sted..." value={search} onChange={e=>setSearch(e.target.value)}/></label><button type="button" className="filter-badge" onClick={()=>{setSearch("");setCategory("all");}}>Nullstill filtre ↺</button></div>
     <div className="categories" aria-label="Filtrer etter kategori"><button className={category==="all"?"pill chosen":"pill"} onClick={()=>setCategory("all")}>Alle oppdrag</button>{categories.map(([id,label])=><button key={id} className={category===id?"pill chosen":"pill"} onClick={()=>setCategory(id)}>{CATEGORY_ICONS[id]} {label}</button>)}</div>
     <div className="job-grid">{visibleJobs.map(job=><article key={job.id} className="job-card">
       <div className="job-head"><span className="category-icon">{CATEGORY_ICONS[job.category]}</span><span className="tag">{job.min_age}+ år {job.demo?"· Eksempel":""}</span></div>
       <p className="card-category">{CATEGORY_LABELS[job.category]}</p><h3>{job.title}</h3><p className="job-description">{job.description}</p>
       <div className="job-metadata"><span>⌖ {job.city}</span><span>◷ Ca. {job.estimated_minutes} min</span>{job.backup_enabled&&<span>↗ Reservelevering kan forespørres</span>}</div>
       <div className="job-bottom"><div><strong>{formatNok(job.pay_ore)}</strong><small>Avtalt honorar, før skatt</small></div><button type="button" onClick={()=>{setSelected(job);setApplicationText("");setNotice("");}}>Se detaljer ↗</button></div>
      </article>)}
      {!visibleJobs.length&&<div className="empty"><h3>Ingen treff akkurat nå</h3><p>Prøv en annen kategori, eller kom tilbake når nye oppdrag er godkjent.</p></div>}</div>
    </section>
    <section className="how-section"><div><span className="eyebrow">SLIK FUNGERER DET</span><h2>Tre steg til <em>nye muligheter.</em></h2></div><div className="step-grid"><div><span>01 / OPPDAG</span><h3>Finn oppdraget</h3><p>Se sted, betaling, tidsbruk og alderskrav før du søker.</p></div><div><span>02 / AVTAL</span><h3>Bli enige</h3><p>Bedriften vurderer interessen og avklarer arbeidsform, vilkår og sikkerhet.</p></div><div><span>03 / LEVER</span><h3>Gjør jobben</h3><p>Jobb først når avtale og betaling er bekreftet utenfor piloten.</p></div></div></section>
   </>}
   {page==="employer"&&<section className="dashboard-page"><div className="dashboard-head"><span className="eyebrow">FOR BEDRIFTER</span><h1>Få småjobben <em>gjort.</em></h1><p>Publiser fleksible oppdrag med tydelig honorar. Vedøy vurderer alle oppdrag før de vises offentlig.</p></div>
    <div className="two-col"><div className="panel"><h2>Legg inn oppdrag</h2><p>Det er gratis å lage et utkast i piloten. Ingen oppdrag åpnes uten Vedøys gjennomgang.</p>
    {!backend?<div className="demo-note">Databasen er ikke koblet til ennå. Skjemaet viser hvilke opplysninger bedriften trenger.</div>:!user?<div className="demo-note">Logg inn for å sende et oppdrag til vurdering. <button className="text-button" onClick={()=>setPage("account")}>Gå til innlogging ↗</button></div>:profile?.account_type!=="business"?<div className="demo-note">Bruk en bedriftsprofil for å publisere. <button className="text-button" onClick={()=>setPage("account")}>Min profil ↗</button></div>:null}
    <form onSubmit={e=>{e.preventDefault();void postJob();}} className="field-grid">
     <label>Tittel<input required minLength={8} maxLength={120} value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} placeholder="F.eks. Skriv en kort guide"/></label>
     <label>Beskrivelse<textarea required rows={5} minLength={30} maxLength={3000} value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} placeholder="Hva skal gjøres, når, og hva kreves?"/></label>
     <div className="split"><label>Kategori<select value={jobForm.category} onChange={e=>setJobForm({...jobForm,category:e.target.value as Category,backup_enabled:false})}>{categories.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Sted<input maxLength={80} value={jobForm.city} onChange={e=>setJobForm({...jobForm,city:e.target.value})}/></label></div>
     <div className="split"><label>Honorar (NOK)<input required type="number" min={10} max={200000} value={jobForm.pay_ore} onChange={e=>setJobForm({...jobForm,pay_ore:e.target.value})} placeholder="300"/></label><label>Estimert tid (min)<input required type="number" min={15} max={480} value={jobForm.estimated_minutes} onChange={e=>setJobForm({...jobForm,estimated_minutes:e.target.value})}/></label></div>
     <div className="info-row"><strong>Minste alder: {CATEGORY_AGE[jobForm.category]} år</strong><span>{jobForm.category==="writing"||jobForm.category==="digital"?"Alle mindreårige oppdrag må vurderes særskilt før publisering.":"Pilotkrav: minst 18 år."}</span></div>
     {jobForm.category==="delivery"&&<label className="check"><input type="checkbox" checked={jobForm.backup_enabled} onChange={e=>setJobForm({...jobForm,backup_enabled:e.target.checked})}/> Tillat at bedriften senere får tilbud om Wolt Drive som reserve, etter ny prisforespørsel og godkjenning. Ingen automatisk bestilling.</label>}
     <button className="primary block" disabled={working||!backend||!user||profile?.account_type!=="business"} type="submit">Send til Vedøy for vurdering ↗</button>
    </form></div>
    <aside className="side-stack"><div className="highlight-panel"><span className="eyebrow">VEDOY DELIVER</span><h2>Levering som ikke stopper opp.</h2><p>Vedoy-bud kan ta godkjente leveringsoppdrag. Når ingen er tilgjengelige, kan Wolt Drive forespørres separat.</p><div className="mini-flow"><span>1. Vedoy-bud</span><span>→</span><span>2. Tilby reserve</span></div><small>Integrasjon og reelle pristilbud krever Wolt-avtale og API-tilgang.</small></div><div className="panel"><h3>Sikkerhet først</h3><p>Telefonoppdrag, transport og oppdrag med fysisk risiko er satt til 18+ i piloten. Vedøy gjennomgår virksomhet, oppdrag og relevante forsikrings- og arbeidsvilkår.</p></div></aside>
    </div>
    {profile?.account_type==="business"&&<section className="panel listing"><h2>Mine oppdrag</h2>{myJobs.map(job=><div className="submission-row" key={job.id}><div><strong>{job.title}</strong><span>{job.status==="pending_review"?"Venter på Vedøys vurdering":job.status==="open"?"Publisert":job.status==="closed"?"Avsluttet":"Ikke godkjent"}</span></div><strong>{formatNok(job.pay_ore)}</strong></div>)}{!myJobs.length&&<p>Ingen registrerte oppdrag ennå.</p>}</section>}
   </section>}
   {page==="account"&&<section className="dashboard-page"><div className="dashboard-head"><span className="eyebrow">MIN VEDOY JOBS</span><h1>Din <em>arbeidsprofil.</em></h1><p>Ingen CV nødvendig. Velg hva du vil bidra med og følg dine henvendelser på ett sted.</p></div>
    <div className="two-col"><div className="panel"><h2>{user?"Profil og tilgang":"Logg inn med e-post"}</h2>
      {!backend?<div className="demo-note">Demo: Supabase må konfigureres før kontoer og oppdrag kan opprettes. Ikke oppgi personopplysninger i denne demoen.</div>:!user?<form className="field-grid" onSubmit={e=>{e.preventDefault();void signIn();}}><label>E-post<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="deg@eksempel.no"/></label><button className="primary" disabled={working} type="submit">Send sikker innloggingslenke ↗</button><p className="fineprint">Du må bekrefte e-posten din. Kontoer er ikke tilgjengelige uten Supabase.</p></form>:!profile?<form className="field-grid" onSubmit={e=>{e.preventDefault();void registerProfile();}}>
        <label>Visningsnavn<input required minLength={2} maxLength={90} value={signupName} onChange={e=>setSignupName(e.target.value)} placeholder="Fornavn eller navn"/></label><label>Jeg ønsker å<select value={signupRole} onChange={e=>setSignupRole(e.target.value as "worker"|"business")}><option value="worker">Finne oppdrag</option><option value="business">Legge ut oppdrag som bedrift</option></select></label>
        <label>Aldersgruppe<select required value={signupAge} onChange={e=>setSignupAge(e.target.value as AgeBand)}><option value="">Velg aldersgruppe</option>{Object.entries(AGE_BANDS).map(([key])=><option key={key} value={key}>{key.replace("_","–")}{key==="26_plus"?" år eller eldre":" år"}</option>)}</select></label>
        <label>By<input value={signupCity} maxLength={80} onChange={e=>setSignupCity(e.target.value)}/></label>
        <p className="fineprint">For 15–17-åringer begrenses interesseskjemaet til trygge digitale skriveoppdrag. Alder og arbeidsvilkår må kontrolleres før betalt arbeid starter.</p>
        <button type="submit" disabled={working||!signupAge||signupRole==="business"&&signupAge==="15_17"} className="primary">Opprett profil ↗</button>
       </form>:<div className="profile"><span className="avatar">{profile.display_name.slice(0,1).toUpperCase()}</span><h3>{profile.display_name}</h3><p>{profile.account_type==="worker"?"Oppdragstaker":"Bedrift"} · {profile.city}</p><p>Aldersgruppe: {profile.age_band.replace("_","–")}</p><button className="outline" onClick={()=>void signOut()}>Logg ut</button></div>}
    </div><div className="panel"><h2>Mine søknader</h2>{applications.map(a=><div className="submission-row" key={a.id}><div><strong>{jobs.find(job=>job.id===a.job_id)?.title||"Oppdrag"}</strong><span>{a.status==="pending"?"Avventer svar":a.status==="shortlisted"?"Aktuell kandidat":a.status==="accepted"?"Akseptert":a.status==="rejected"?"Avslått":a.status}</span></div><small>{new Date(a.created_at).toLocaleDateString("nb-NO")}</small></div>)}{!applications.length&&<p className="muted">Du har ikke sendt inn noen interesseskjemaer ennå.</p>}<button className="text-button" onClick={()=>setPage("browse")}>Utforsk oppdrag ↗</button></div></div>
   </section>}
  </main>
  <footer className="footer"><a href="/" className="brand">V.<span className="brand-green">JOBS</span></a><p>Fleksible oppdrag, tydelige vilkår. Pilot under utvikling. Vedøy tar ikke betaling og inngår ingen arbeidsavtaler gjennom denne MVP-en.</p><a href="https://vedoystudio.no" target="_blank" rel="noreferrer">Bygget av Vedøy Studio ↗</a></footer>
  {notice&&<div role="status" className="toast"><span>{notice}</span><button aria-label="Lukk melding" onClick={()=>setNotice("")}>×</button></div>}
  {selected&&<div role="presentation" className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><section role="dialog" aria-modal="true" aria-labelledby="job-modal-title" className="job-dialog">
    <div className="modal-top"><span className="tag">{CATEGORY_LABELS[selected.category]}</span><button className="close-btn" onClick={()=>setSelected(null)} aria-label="Lukk oppdrag">×</button></div><h2 id="job-modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-details"><span>⌖ {selected.city}</span><span>◷ {selected.estimated_minutes} minutter</span><span>♙ {selected.min_age}+ år</span><strong>{formatNok(selected.pay_ore)}</strong></div>
    {selected.demo?<div className="demo-note">Dette er et eksempeloppdrag. Du kan ikke søke eller tjene penger på denne oppføringen.</div>:!user?<div className="demo-note">Logg inn og opprett en profil for å melde interesse.<button className="text-button" onClick={()=>{setSelected(null);setPage("account");}}>Opprett profil ↗</button></div>:profile?.account_type!=="worker"?<div className="demo-note">Du trenger en oppdragstakerprofil for å søke.</div>:!eligibleToExpressInterest(selected,profile.age_band)?<div className="demo-note">Dette oppdraget er ikke tilgjengelig for din valgte aldersgruppe.</div>:applications.some(a=>a.job_id===selected.id)?<div className="demo-note">Du har allerede sendt interesse for dette oppdraget.</div>:<form className="field-grid" onSubmit={e=>{e.preventDefault();void apply();}}><label>Kort melding til bedriften<textarea required rows={4} maxLength={1000} minLength={10} value={applicationText} onChange={e=>setApplicationText(e.target.value)} placeholder="Hva kan du bidra med, og når passer det?"/></label><button type="submit" className="primary block" disabled={working}>Send interesse ↗</button><span className="fineprint">Søknad er ikke en arbeidsavtale. Bedriften må avtale honorar og arbeidsvilkår før oppstart.</span></form>}
  </section></div>}
 </div>;
}
