"use client";
import {useCallback,useDeferredValue,useEffect,useMemo,useState} from "react";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {getSupabase,isBackendConfigured} from "@/lib/supabase";
import {ACCENTS,CATEGORIES,CONDITIONS,DEMO_LISTINGS,LISTING_TYPES,categoryName,formatPrice,formatRelative,type MarketCategory,type MarketCondition,type MarketListing,type ListingType,type MarketProfile,type MarketThread,type MarketMessage} from "@/lib/market";

type Section="discover"|"saved"|"sell"|"inbox"|"profile";
type FilterType="all"|ListingType;
type SortKey="new"|"price_asc"|"price_desc";
const firstForm={title:"",description:"",category:"electronics" as MarketCategory,condition:"good" as MarketCondition,listing_type:"sell" as ListingType,price:"",city:"Haugesund"};
const labels=[{id:"discover",name:"Utforsk",glyph:"⌂"},{id:"saved",name:"Lagret",glyph:"♡"},{id:"inbox",name:"Meldinger",glyph:"✉"},{id:"profile",name:"Profil",glyph:"◉"}] as const;
export function Market(){
 const [section,setSection]=useState<Section>("discover");
 const [user,setUser]=useState<User|null>(null);
 const [profile,setProfile]=useState<MarketProfile|null>(null);
 const [email,setEmail]=useState("");
 const [displayName,setDisplayName]=useState("");
 const [city,setCity]=useState("Haugesund");
 const [query,setQuery]=useState("");
 const deferredQuery=useDeferredValue(query);
 const [category,setCategory]=useState<"all"|MarketCategory>("all");
 const [kind,setKind]=useState<FilterType>("all");
 const [sort,setSort]=useState<SortKey>("new");
 const [maxPrice,setMaxPrice]=useState("");
 const [region,setRegion]=useState("");
 const [favorites,setFavorites]=useState<string[]>([]);
 const [listings,setListings]=useState<MarketListing[]>([]);
 const [mine,setMine]=useState<MarketListing[]>([]);
 const [threads,setThreads]=useState<MarketThread[]>([]);
 const [messages,setMessages]=useState<MarketMessage[]>([]);
 const [activeThread,setActiveThread]=useState<string|null>(null);
 const [messageDraft,setMessageDraft]=useState("");
 const [preview,setPreview]=useState<MarketListing|null>(null);
 const [form,setForm]=useState(firstForm);
 const [step,setStep]=useState(0);
 const [working,setWorking]=useState(false);
 const [loading,setLoading]=useState(true);
 const [status,setStatus]=useState("");
 const [demoFavorites,setDemoFavorites]=useState<string[]>([]);
 const supabase=getSupabase(),configured=isBackendConfigured();
 const refresh=useCallback(async(current?:User|null)=>{
   const client=getSupabase();if(!client){setLoading(false);return;}
   const [publicResult,sessionResult]=await Promise.all([
     client.from("vmarket_listings").select("*").eq("status","active").order("created_at",{ascending:false}).limit(200),
     current===undefined?client.auth.getUser().then(r=>r.data.user):Promise.resolve(current)
   ]);
   const active=sessionResult||null;
   setUser(active);setListings(publicResult.error?[]:(publicResult.data||[]) as MarketListing[]);
   if(publicResult.error)setStatus("Annonsene er ikke koblet til Supabase ennå. Viser eksempler.");
   if(active){
    const [p,f,m,t]=await Promise.all([
     client.from("vmarket_profiles").select("*").eq("user_id",active.id).maybeSingle(),
     client.from("vmarket_favorites").select("listing_id").eq("user_id",active.id),
     client.from("vmarket_listings").select("*").eq("owner_id",active.id).order("created_at",{ascending:false}),
     client.from("vmarket_threads").select("*").order("created_at",{ascending:false}).limit(100)
    ]);
    setProfile(p.data as MarketProfile|null);
    setFavorites((f.data||[]).map(x=>x.listing_id as string));
    setMine((m.data||[]) as MarketListing[]);
    setThreads((t.data||[]) as MarketThread[]);
   }else{setProfile(null);setFavorites([]);setMine([]);setThreads([]);}
   setLoading(false);
 },[]);
 useEffect(()=>{
  const client=getSupabase();
  if(!client){setLoading(false);return;}
  let alive=true;
  void refresh();
  const subscription=client.auth.onAuthStateChange((_event,session)=>{
    if(!alive)return;
    const next=session?.user||null;setUser(next);
    if(_event==="SIGNED_IN"||_event==="SIGNED_OUT")setTimeout(()=>{if(alive)void refresh(next);},0);
  });
  return ()=>{alive=false;subscription.data.subscription.unsubscribe();};
 },[refresh]);
 useEffect(()=>{
  if(!supabase||!user||!activeThread){setMessages([]);return;}
  let alive=true;
  void supabase.from("vmarket_messages").select("*").eq("thread_id",activeThread).order("created_at",{ascending:true}).limit(150).then(({data})=>{if(alive)setMessages((data||[]) as MarketMessage[]);});
  return ()=>{alive=false;};
 },[activeThread,user,supabase]);
 const demonstration=!configured||(!listings.length&&!loading);
 const allListings=demonstration?DEMO_LISTINGS:listings;
 const visible=useMemo(()=>{
  const needle=deferredQuery.toLocaleLowerCase("nb-NO").trim();
  const price=Number(maxPrice);
  const list=allListings.filter(l=>
   (category==="all"||l.category===category)&&
   (kind==="all"||l.listing_type===kind)&&
   (!needle||[l.title,l.description,l.city,l.seller_name].join(" ").toLocaleLowerCase("nb-NO").includes(needle))&&
   (!region||l.city.toLocaleLowerCase("nb-NO").includes(region.toLocaleLowerCase("nb-NO").trim()))&&
   (!maxPrice||!Number.isFinite(price)||l.price_ore<=price*100)
  );
  return [...list].sort((a,b)=>sort==="new"?new Date(b.created_at).getTime()-new Date(a.created_at).getTime():sort==="price_asc"?a.price_ore-b.price_ore:b.price_ore-a.price_ore);
 },[allListings,category,kind,deferredQuery,maxPrice,region,sort]);
 const savedIds=demonstration?demoFavorites:favorites;
 const openSection=(next:Section)=>{setSection(next);setPreview(null);setStatus("");window.scrollTo({top:0,behavior:"smooth"});};
 const requireAccount=(target:Section)=>{setPreview(null);setSection(target);setStatus("Logg inn eller opprett en profil for å fortsette.");};
 const toggleFavorite=async(l:MarketListing)=>{
  if(l.demo){setDemoFavorites(current=>current.includes(l.id)?current.filter(id=>id!==l.id):[...current,l.id]);return;}
  if(!user||!supabase){requireAccount("profile");return;}
  const exists=favorites.includes(l.id);
  setFavorites(v=>exists?v.filter(id=>id!==l.id):[...v,l.id]);
  const {error}=exists?await supabase.from("vmarket_favorites").delete().eq("user_id",user.id).eq("listing_id",l.id)
    :await supabase.from("vmarket_favorites").insert({user_id:user.id,listing_id:l.id});
  if(error){setFavorites(v=>exists?[...v,l.id]:v.filter(id=>id!==l.id));setStatus("Kunne ikke lagre favoritten. Prøv igjen.");}
 };
 const sendOtp=async()=>{
  if(!supabase)return setStatus("Innlogging er ikke aktivert før Supabase er konfigurert.");
  setWorking(true);
  const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
  setStatus(error?"Kunne ikke sende innloggingslenke: "+error.message:"Vi har sendt deg en sikker innloggingslenke på e-post.");
  setWorking(false);
 };
 const saveProfile=async()=>{
  if(!supabase||!user)return;
  if(displayName.trim().length<2||city.trim().length<1){setStatus("Skriv inn navn og sted.");return;}
  setWorking(true);
  const {error}=await supabase.from("vmarket_profiles").insert({user_id:user.id,display_name:displayName.trim().slice(0,80),city:city.trim().slice(0,80)});
  if(error)setStatus("Kunne ikke opprette profil: "+error.message);else{setStatus("Profilen er opprettet!");await refresh(user);}
  setWorking(false);
 };
 const post=async()=>{
  if(!supabase||!user||!profile){requireAccount("profile");return;}
  if(form.title.trim().length<5||form.description.trim().length<20||!form.city.trim()){setStatus("Fyll ut tittel, en beskrivelse på minst 20 tegn og sted.");return;}
  const price=Number(form.price);
  if(form.listing_type!=="give"&&(!Number.isFinite(price)||price<0||price>999999999)){setStatus("Legg inn en gyldig pris.");return;}
  setWorking(true);
  const record={owner_id:user.id,seller_name:profile.display_name,title:form.title.trim().slice(0,120),description:form.description.trim().slice(0,4000),category:form.category,condition:form.condition,listing_type:form.listing_type,price_ore:form.listing_type==="give"?0:Math.round(price*100),city:form.city.trim().slice(0,80),photos:[],status:"pending_review"};
  const {error}=await supabase.from("vmarket_listings").insert(record);
  if(error)setStatus("Kunne ikke lagre annonse: "+error.message);
  else{setStatus("Annonsen er sendt til kontroll. Den publiseres først etter godkjenning.");setForm(firstForm);setStep(0);setSection("profile");await refresh(user);}
  setWorking(false);
 };
 const contact=async(l:MarketListing)=>{
  if(l.demo){setStatus("Dette er en demoannonse – selgeren finnes ikke.");return;}
  if(!supabase||!user||!profile){requireAccount("profile");return;}
  if(l.owner_id===user.id){setStatus("Du kan ikke sende melding til deg selv.");return;}
  setWorking(true);
  let existing=threads.find(t=>t.listing_id===l.id&&t.buyer_id===user.id);
  if(!existing){
   const result=await supabase.from("vmarket_threads").insert({listing_id:l.id,buyer_id:user.id,seller_id:l.owner_id}).select("id,listing_id,buyer_id,seller_id,created_at").single();
   if(result.error){
    const fallback=await supabase.from("vmarket_threads").select("*").eq("listing_id",l.id).eq("buyer_id",user.id).maybeSingle();
    existing=fallback.data as MarketThread|undefined;
    if(!existing){setStatus("Kunne ikke starte samtalen: "+result.error.message);setWorking(false);return;}
   }else existing=result.data as MarketThread;
  }
  setActiveThread(existing.id);setPreview(null);setSection("inbox");setWorking(false);await refresh(user);
 };
 const sendMessage=async()=>{
  if(!supabase||!user||!activeThread||!messageDraft.trim())return;
  setWorking(true);
  const value=messageDraft.trim().slice(0,2000);
  const {data,error}=await supabase.from("vmarket_messages").insert({thread_id:activeThread,sender_id:user.id,body:value}).select("*").single();
  if(error)setStatus("Meldingen kunne ikke sendes: "+error.message);
  else{setMessages(v=>[...v,data as MarketMessage]);setMessageDraft("");}
  setWorking(false);
 };
 const relevantThreads=threads.filter(t=>t.buyer_id===user?.id||t.seller_id===user?.id);
 const threadListing=(id:string)=>[...listings,...mine].find(l=>l.id===id);
 return <div className="market-shell">
  <header className="market-nav">
   <Link href="/" className="market-logo" onClick={()=>setSection("discover")}><span className="logo-glyph">v.</span><span>vedoy<span className="logo-last">marked</span></span></Link>
   <div className="top-search"><span className="search-symbol">⌕</span><input aria-label="Søk i hele markedet" placeholder="Hva leter du etter?" value={query} onChange={e=>{setQuery(e.target.value);setSection("discover");}}/><span className="search-shortcut">SØK</span></div>
   <nav aria-label="Hovedmeny" className="top-links">{labels.map(l=><button key={l.id} className={section===l.id?"top-link active":"top-link"} onClick={()=>openSection(l.id)}><span>{l.glyph}</span>{l.name}</button>)}</nav>
   <button className="nav-cta" onClick={()=>openSection("sell")}>＋ <span>Ny annonse</span></button>
  </header>
  <main>
   {section==="discover"&&<>
    <section className="market-hero">
     <div className="market-hero-inner"><div><span className="hero-kicker"><span className="pulse-dot"/> ET ENKLERE BRUKTMARKED</span><h1>Finn noe fint.<br/><em>Gi noe nytt liv.</em></h1><p>Det du trenger, og det du ikke visste du lette etter. En behagelig markedsplass for folk, ting og muligheter.</p><div className="hero-buttons"><button className="m-primary" onClick={()=>document.getElementById("feed")?.scrollIntoView({behavior:"smooth"})}>Utforsk markedet <span>↗</span></button><button className="m-ghost" onClick={()=>openSection("sell")}>Legg ut annonse</button></div><span className="hero-small">✺ Mindre støy. Mer å oppdage.</span></div>
     <div className="editorial-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-tag art-tag-one">Ta vare på det fine ✳</div><div className="art-object"><div className="art-object-circle"/><div className="art-object-stem"/></div><div className="art-tag art-tag-two">Brukt er bra. ♡</div></div></div>
    </section>
    <section className="market-categories"><div className="section-heading compact"><div><span className="section-kicker">HVOR VIL DU BEGYNNE?</span><h2>Utforsk etter interesse</h2></div></div><div className="category-grid">{CATEGORIES.filter(c=>c.id!=="all").map(c=><button key={c.id} className={category===c.id?"category-tile selected":"category-tile"} onClick={()=>{setCategory(c.id);document.getElementById("feed")?.scrollIntoView({behavior:"smooth"});}}><span className="tile-symbol" style={{background:ACCENTS[c.id].bg,color:ACCENTS[c.id].fg}}>{c.icon}</span><span>{c.label}</span><span className="cat-arrow">↗</span></button>)}<Link href="/oppdrag" className="category-tile"><span className="tile-symbol" style={{background:"#e1e9ce",color:"#5b7352"}}>⚡</span><span>Jobber og oppdrag</span><span className="cat-arrow">↗</span></Link></div></section>
    <section className="feed-section" id="feed"><div className="section-heading"><div><span className="section-kicker">UTFORSK MARKEDET</span><h2>Små funn, store gleder<span className="accent-period">.</span></h2><p>Fra noen som har det, til noen som trenger det.</p></div><span className="result-count">{visible.length} {demonstration?"eksempelannonser":"annonser"}</span></div>
    {demonstration&&<div className="market-demo-note"><span>✳</span><div><strong>Du ser en forhåndsvisning.</strong> Annonsene er illustrasjoner og kan ikke kjøpes. Virkelige annonser vises først når databasen og modereringen er klare.</div></div>}
    <div className="market-filterbar"><div className="filter-pills">{CATEGORIES.map(c=><button key={c.id} className={category===c.id?"filter-pill picked":"filter-pill"} onClick={()=>setCategory(c.id)}>{c.label}</button>)}</div><button className="reset-filters" onClick={()=>{setCategory("all");setKind("all");setMaxPrice("");setRegion("");setSort("new");setQuery("");}}>Nullstill ↺</button></div>
    <div className="filter-secondary"><label>Type <select value={kind} onChange={e=>setKind(e.target.value as FilterType)}><option value="all">Alle typer</option>{Object.entries(LISTING_TYPES).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label>Sted <input aria-label="Filtrer på sted" placeholder="Hele Norge" value={region} onChange={e=>setRegion(e.target.value)}/></label><label>Makspris <input aria-label="Maksimal pris i kroner" type="number" min="0" max="999999999" placeholder="Ingen grense" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></label><label>Sorter <select value={sort} onChange={e=>setSort(e.target.value as SortKey)}><option value="new">Nyeste først</option><option value="price_asc">Lavest pris</option><option value="price_desc">Høyest pris</option></select></label></div>
    {loading?<div className="card-layout">{Array.from({length:8}).map((_,i)=><div className="skeleton-card" key={i}/>)}</div>:visible.length?<div className="card-layout">{visible.map((l,i)=><ListingCard key={l.id} listing={l} index={i} saved={savedIds.includes(l.id)} onOpen={()=>setPreview(l)} onSave={()=>void toggleFavorite(l)}/>)}</div>:<div className="no-results"><span>⌕</span><h3>Ingen treff denne gangen</h3><p>Prøv et annet søk eller juster filtrene – det kommer stadig nye muligheter.</p><button className="m-outline" onClick={()=>{setCategory("all");setKind("all");setMaxPrice("");setRegion("");setQuery("");}}>Vis alle annonser</button></div>}
    </section>
    <section className="mission-strip"><div><span className="section-kicker">BRUKT. BEDRE.</span><h2>En ny begynnelse<br/>for fine ting.</h2><p>En markedsplass bør gjøre det like hyggelig å gi noe videre som å finne noe nytt.</p><button onClick={()=>openSection("sell")}>Gi noe nytt liv <span>↗</span></button></div><div className="mission-art" aria-hidden="true"><span>v.</span><div>GODE TING<br/>FORTJENER<br/>FLERE LIV.</div></div></section>
   </>}
   {section==="saved"&&<section className="internal-page"><div className="internal-header"><span className="section-kicker">DINE FAVORITTER</span><h1>Det du liker<span className="accent-period">.</span></h1><p>Samle fine funn på ett sted og kom tilbake når det passer.</p></div>{savedIds.length?<div className="card-layout">{allListings.filter(l=>savedIds.includes(l.id)).map((l,i)=><ListingCard key={l.id} listing={l} index={i} saved onOpen={()=>setPreview(l)} onSave={()=>void toggleFavorite(l)}/>)}</div>:<div className="no-results"><span>♡</span><h3>Her er det god plass</h3><p>Trykk på hjertet ved en annonse for å lagre den.</p><button className="m-outline" onClick={()=>openSection("discover")}>Utforsk annonser ↗</button></div>}</section>}
   {section==="sell"&&<section className="internal-page wizard-page"><div className="internal-header"><span className="section-kicker">GI NOE VIDERE</span><h1>Lag en annonse<span className="accent-period">.</span></h1><p>Det skal være enkelt å legge ut noe fint. Vi tar det i tre små steg.</p></div>{!configured||!user||!profile?<div className="signin-gate"><span className="gate-symbol">◉</span><h2>Først trenger vi en profil</h2><p>Logg inn for å legge ut en annonse. Du kan utforske markedet uten konto.</p><button className="m-primary" onClick={()=>openSection("profile")}>Logg inn / opprett profil ↗</button></div>:<div className="wizard-layout"><div className="wizard-main"><div className="step-bar">{["Hva skal videre?","Fortell mer","Se over"].map((s,i)=><div className={step===i?"step active":step>i?"step done":"step"} key={s}><span>{step>i?"✓":i+1}</span><small>{s}</small></div>)}</div>
      {step===0&&<div className="wizard-content"><span className="section-kicker">STEG 01 / 03</span><h2>Hva vil du legge ut?</h2><p>Velg det som beskriver annonsen best.</p><div className="type-selector">{(Object.entries(LISTING_TYPES) as [ListingType,string][]).map(([key,value])=><button key={key} className={form.listing_type===key?"type-option chosen":"type-option"} onClick={()=>setForm(v=>({...v,listing_type:key,price:key==="give"?"0":v.price}))}><span>{key==="sell"?"✦":key==="give"?"♡":key==="wanted"?"⌕":"✧"}</span>{value}</button>)}</div><label className="field-label">Kategori<select value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value as MarketCategory,condition:e.target.value==="services"?"not_applicable":v.condition}))}>{CATEGORIES.filter(c=>c.id!=="all").map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><div className="wizard-actions"><button className="m-primary" onClick={()=>setStep(1)}>Fortsett <span>↗</span></button></div></div>}
      {step===1&&<div className="wizard-content"><span className="section-kicker">STEG 02 / 03</span><h2>Fortell litt mer.</h2><p>Gode beskrivelser gjør det lettere for andre å ta kontakt.</p><label className="field-label">Overskrift<input maxLength={120} placeholder="F.eks. Pent brukt kaffemaskin" value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))}/></label><label className="field-label">Beskrivelse<textarea rows={5} maxLength={4000} placeholder="Beskriv tilstanden, det som følger med og eventuelle feil." value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></label><div className="field-grid-two"><label className="field-label">Tilstand<select value={form.condition} onChange={e=>setForm(v=>({...v,condition:e.target.value as MarketCondition}))}>{Object.entries(CONDITIONS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label className="field-label">Sted<input maxLength={80} value={form.city} onChange={e=>setForm(v=>({...v,city:e.target.value}))}/></label></div><label className="field-label">Pris i kroner{form.listing_type==="give"?" (gratis)":""}<input type="number" min={0} max={999999999} disabled={form.listing_type==="give"} value={form.listing_type==="give"?"0":form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))} placeholder="F.eks. 450"/></label><div className="upload-placeholder"><span>▧</span><div><strong>Bilder legges til i neste versjon</strong><small>Vi lagrer ikke bildefiler før sikker lagring, personvern og moderering er konfigurert.</small></div></div><div className="wizard-actions"><button className="m-outline" onClick={()=>setStep(0)}>← Tilbake</button><button className="m-primary" onClick={()=>{if(form.title.trim().length<5||form.description.trim().length<20||!form.city.trim()||(form.listing_type!=="give"&&!form.price.trim()))setStatus("Fyll inn overskrift, beskrivelse, sted og pris.");else setStep(2);}}>Se over ↗</button></div></div>}
      {step===2&&<div className="wizard-content"><span className="section-kicker">STEG 03 / 03</span><h2>Nesten i mål.</h2><p>Kontroller at alt stemmer før du sender annonsen til gjennomgang.</p><div className="review-box"><span className="review-symbol">{ACCENTS[form.category].icon}</span><div><span className="section-kicker">{categoryName(form.category)} · {CONDITIONS[form.condition]}</span><h3>{form.title}</h3><p>{form.description}</p><strong>{formatPrice(form.listing_type==="give"?0:Math.round(Number(form.price)*100),form.listing_type)}</strong><small>⌖ {form.city}</small></div></div><div className="market-demo-note"><span>✓</span> Annonsen blir ikke synlig før Vedøy har godkjent den. Ingen betaling håndteres i denne versjonen.</div><div className="wizard-actions"><button className="m-outline" onClick={()=>setStep(1)}>← Endre</button><button className="m-primary" disabled={working} onClick={()=>void post()}>{working?"Sender …":"Send til vurdering ↗"}</button></div></div>}</div><aside className="wizard-aside"><span>✳</span><h3>Et godt tips</h3><p>En ærlig beskrivelse, tydelig pris og gode bilder gjør handel tryggere og enklere for alle.</p><div className="wizard-rule"/><small>Du kan gå tilbake og endre før innsending. Kun moderator kan godkjenne annonsen.</small></aside></div>}</section>}
   {section==="profile"&&<section className="internal-page"><div className="internal-header"><span className="section-kicker">DIN KONTO</span><h1>Hei, {profile?.display_name||"du"}<span className="accent-period">.</span></h1><p>Et rolig sted for annonsene dine og alt du har lagret.</p></div><div className="account-layout"><div className="account-panel">{!configured?<><span className="section-kicker">DEMODRIFT</span><h2>Innlogging kommer</h2><p>Supabase må konfigureres før ekte kontoer kan brukes. Ingen opplysninger lagres i denne demoen.</p></>:!user?<><span className="section-kicker">ENKEL INNLOGGING</span><h2>Logg inn uten passord.</h2><p>Vi sender deg en sikker engangslenke. Ikke noe passord å huske.</p><form onSubmit={e=>{e.preventDefault();void sendOtp();}} className="account-form"><label className="field-label">E-post<input type="email" required autoComplete="email" placeholder="navn@eksempel.no" value={email} onChange={e=>setEmail(e.target.value)}/></label><button className="m-primary" disabled={working}>Send innloggingslenke ↗</button></form></>:!profile?<><span className="section-kicker">OPPRETT PROFIL</span><h2>Velkommen til Vedoy.</h2><p>Fortell oss hva du ønsker å kalles og hvor du holder til.</p><form className="account-form" onSubmit={e=>{e.preventDefault();void saveProfile();}}><label className="field-label">Visningsnavn<input required minLength={2} maxLength={80} value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label><label className="field-label">Sted<input required maxLength={80} value={city} onChange={e=>setCity(e.target.value)}/></label><button disabled={working} className="m-primary">Opprett profil ↗</button></form></>:<><span className="avatar-big">{profile.display_name.charAt(0).toUpperCase()}</span><h2>{profile.display_name}</h2><p>⌖ {profile.city}</p><button className="m-outline" onClick={()=>void supabase?.auth.signOut()}>Logg ut</button></>}</div><div className="account-panel"><h2>Mine annonser</h2>{mine.length?mine.map(l=><div className="my-row" key={l.id}><div><strong>{l.title}</strong><small>{l.status==="pending_review"?"Til vurdering":l.status==="active"?"Aktiv":l.status==="sold"?"Solgt":l.status==="reserved"?"Reservert":"Ikke godkjent"}</small></div><strong>{formatPrice(l.price_ore,l.listing_type)}</strong></div>):<div className="account-empty"><span>✦</span><p>Du har ikke opprettet annonser ennå.</p></div>}<button className="m-inline" onClick={()=>openSection("sell")}>Lag din første annonse ↗</button></div></div></section>}
   {section==="inbox"&&<section className="internal-page"><div className="internal-header"><span className="section-kicker">DINE SAMTALER</span><h1>En god dialog<span className="accent-period">.</span></h1><p>Spør, avtal og bli enige – alt samlet på ett sted.</p></div>{!configured||!user||!profile?<div className="signin-gate"><span className="gate-symbol">✉</span><h2>Meldingene dine bor her</h2><p>Logg inn for å kontakte selgere og se samtalene dine.</p><button className="m-primary" onClick={()=>openSection("profile")}>Gå til innlogging ↗</button></div>:<div className="inbox-layout"><div className="thread-list"><h3>Samtaler</h3>{relevantThreads.length?relevantThreads.map(t=><button key={t.id} className={activeThread===t.id?"thread-link selected":"thread-link"} onClick={()=>setActiveThread(t.id)}><span className="thread-avatar">✉</span><span><strong>{threadListing(t.listing_id)?.title||"Annonse"}</strong><small>{new Date(t.created_at).toLocaleDateString("nb-NO")}</small></span><span>↗</span></button>):<p className="muted">Ingen samtaler ennå. Du kan kontakte en selger fra en annonse.</p>}</div><div className="message-pane">{activeThread?<><div className="message-header"><strong>{threadListing(relevantThreads.find(t=>t.id===activeThread)?.listing_id||"")?.title||"Samtale"}</strong><span>Direktemeldinger</span></div><div className="message-list">{messages.map(m=><div key={m.id} className={m.sender_id===user.id?"message-bubble my":"message-bubble"}>{m.body}<small>{new Date(m.created_at).toLocaleTimeString("nb-NO",{hour:"2-digit",minute:"2-digit"})}</small></div>)}{!messages.length&&<p className="muted">Start samtalen med et hyggelig spørsmål.</p>}</div><form className="message-form" onSubmit={e=>{e.preventDefault();void sendMessage();}}><input aria-label="Skriv en melding" maxLength={2000} required placeholder="Skriv en melding..." value={messageDraft} onChange={e=>setMessageDraft(e.target.value)}/><button className="m-primary" disabled={working||!messageDraft.trim()}>Send ↗</button></form></>:<div className="no-conversation"><span>✉</span><h3>Velg en samtale</h3><p>Her kan du avtale henting, stille spørsmål og holde kontakten.</p></div>}</div></div>}</section>}
  </main>
  <footer className="market-footer"><div><Link href="/" className="market-logo"><span className="logo-glyph">v.</span><span>vedoy<span className="logo-last">marked</span></span></Link><p>Et roligere sted å finne det fine i det du allerede har.</p></div><div><span className="section-kicker">UTFORSK</span><button onClick={()=>openSection("discover")}>Markedsplassen</button><button onClick={()=>openSection("sell")}>Legg ut annonse</button><Link href="/oppdrag">Jobber og oppdrag</Link></div><div><span className="section-kicker">OM VEDOY</span><a href="https://vedoystudio.no" target="_blank" rel="noreferrer">Vedoy Studio ↗</a><small>Under utvikling · Ingen betalinger i appen ennå.</small></div></footer>
  <nav className="mobile-tabs" aria-label="Mobilmeny">{labels.map(l=><button key={l.id} className={section===l.id?"mobile-tab selected":"mobile-tab"} onClick={()=>openSection(l.id)}><span>{l.glyph}</span>{l.name}</button>)}<button className={section==="sell"?"mobile-tab selected":"mobile-tab"} onClick={()=>openSection("sell")}><span>＋</span>Selg</button></nav>
  {status&&<div role="status" className="market-toast"><span>{status}</span><button onClick={()=>setStatus("")} aria-label="Lukk varsel">×</button></div>}
  {preview&&<div className="market-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(null);}}><div className="listing-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-heading"><button className="dialog-close" onClick={()=>setPreview(null)} aria-label="Lukk annonse">×</button><div className="detail-visual" style={{background:ACCENTS[preview.category].bg,color:ACCENTS[preview.category].fg}}><span>{ACCENTS[preview.category].icon}</span><small>{preview.demo?"Illustrasjon":"Annonsebilde kommer"}</small></div><div className="detail-info"><span className="section-kicker">{categoryName(preview.category)} · {CONDITIONS[preview.condition]}</span><h2 id="detail-heading">{preview.title}</h2><strong className="detail-price">{formatPrice(preview.price_ore,preview.listing_type)}</strong><div className="detail-meta"><span>⌖ {preview.city}</span><span>◷ {formatRelative(preview.created_at)}</span></div><p>{preview.description}</p><div className="seller-info"><span className="small-avatar">{preview.seller_name.charAt(0)}</span><div><strong>{preview.seller_name}</strong><small>{preview.demo?"Eksempelselger":"Registrert bruker"}</small></div></div>{preview.demo&&<div className="market-demo-note"><span>✳</span> Dette er kun en illustrasjon, ikke en ekte annonse.</div>}<div className="detail-buttons"><button className="m-primary" disabled={working||preview.demo} onClick={()=>void contact(preview)}>Send melding <span>↗</span></button><button className="m-outline" onClick={()=>void toggleFavorite(preview)}>{savedIds.includes(preview.id)?"♥ Lagret":"♡ Lagre"}</button></div><p className="safety-hint">Avtal sikkert, sjekk varen og del aldri betalingskoder. Vedoy håndterer ikke betaling i piloten.</p></div></div></div>}
 </div>;
}
function ListingCard({listing,index,saved,onOpen,onSave}:{listing:MarketListing;index:number;saved:boolean;onOpen:()=>void;onSave:()=>void}){
 const accent=ACCENTS[listing.category];
 return <article className="market-card" style={{animationDelay:Math.min(index,9)*45+"ms"}}><button className="listing-image" type="button" onClick={onOpen} aria-label={"Se "+listing.title} style={{background:accent.bg,color:accent.fg}}>{listing.photos.length?<span className="listing-image-fallback">{accent.icon}</span>:<><span className="listing-image-glyph">{accent.icon}</span><span className="listing-image-watermark">vedoy.</span></>}{listing.demo&&<span className="image-demo">EKSEMPEL</span>}</button><button className={saved?"heart-button saved":"heart-button"} onClick={onSave} aria-label={saved?"Fjern fra lagrede":"Lagre annonse"} aria-pressed={saved}>{saved?"♥":"♡"}</button><button className="listing-body" onClick={onOpen} type="button"><span className="listing-category">{categoryName(listing.category)} · {CONDITIONS[listing.condition]}</span><h3>{listing.title}</h3><strong>{formatPrice(listing.price_ore,listing.listing_type)}</strong><div className="listing-details"><span>⌖ {listing.city}</span><span>{formatRelative(listing.created_at)}</span></div></button></article>;
}
