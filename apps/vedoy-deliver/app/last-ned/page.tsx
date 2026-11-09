import type {Metadata} from "next";
import Link from "next/link";
import {InstallWebApp} from "@/components/install-web-app";

export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"Last ned og installer Vedoy Deliver",
 description:"Installer Vedoy Deliver på Android, iPhone eller PC. Webappen kan installeres direkte fra nettleseren; Android-APK kommer som testversjon.",
 alternates:{canonical:"/last-ned"},
 openGraph:{title:"Installer Vedoy Deliver",description:"Installer Vedoy Deliver som webapp på telefonen eller PC-en."}
};
const assetName="vedoy-deliver-test.apk";
type Apk={url:string;size:number;digest:string|null};
async function availableApk():Promise<Apk|null>{
 try{
  const response=await fetch("https://api.github.com/repos/leandervedoy/Vedoy-Studio/releases/tags/vedoy-deliver-android-test",{
   next:{revalidate:600},
   headers:{"Accept":"application/vnd.github+json","User-Agent":"Vedoy-Deliver"}
  });
  if(!response.ok)return null;
  const release=await response.json() as {draft?:boolean;assets?:Array<{name?:string;size?:number;state?:string;browser_download_url?:string;digest?:string}>};
  if(release.draft)return null;
  const asset=release.assets?.find(x=>x.name===assetName&&x.state==="uploaded"&&(x.size||0)>1024*1024);
  const expected="https://github.com/leandervedoy/Vedoy-Studio/releases/download/vedoy-deliver-android-test/"+assetName;
  if(!asset||asset.browser_download_url!==expected)return null;
  return {url:expected,size:asset.size||0,digest:asset.digest||null};
 }catch{return null;}
}
export default async function InstallPage(){
 const apk=await availableApk();
 return <main className="install-page">
  <header className="install-header">
   <Link href="/" className="install-wordmark"><img src="/vedoy-deliver-icon.png" width={48} height={48} alt=""/> <span>vedoy<strong>deliver</strong></span></Link>
   <Link href="/" className="install-back">← Til forsiden</Link>
  </header>
  <section className="install-hero">
   <p className="install-kicker">VEDOY DELIVER · APP</p>
   <h1>Levering i lomma.</h1>
   <p>Bruk Vedoy Deliver som en app med eget ikon på startskjermen. Velg en installeringsmetode nedenfor.</p>
   <div className="install-preview" aria-hidden="true"><img src="/vedoy-deliver-icon.png" width={180} height={180} alt=""/></div>
  </section>
  <section className="install-options" aria-label="Installeringsalternativer">
   <article className="install-card install-card-featured">
    <span className="install-tag">ANBEFALT · TILGJENGELIG NÅ</span>
    <h2>Installer som webapp</h2>
    <p>Ingen APK eller appbutikk nødvendig. Brukes i eget appvindu med Vedoy Deliver-ikon på Android, iPhone og støttede datamaskiner.</p>
    <InstallWebApp/>
    <div className="install-howto">
     <h3>Finner du ikke installeringsknappen?</h3>
     <ol><li><strong>Android (Chrome):</strong> Trykk på menyen ⋮ og velg «Installer app» eller «Legg til på startskjermen».</li>
      <li><strong>iPhone (Safari):</strong> Trykk Del og velg «Legg til på Hjem-skjerm».</li>
      <li><strong>PC (Chrome/Edge):</strong> Bruk installeringsikonet i adressefeltet eller «Installer app» i menyen.</li></ol>
    </div>
   </article>
   <article className="install-card">
    <span className="install-tag">ANDROID · TESTVERSJON</span>
    <h2>Android APK</h2>
    <p>En separat Capacitor-testapp for Android er under utvikling. Den viser nettjenesten via en nettvisning og krever internett.</p>
    {apk?<><a className="app-install-primary" href={apk.url} rel="noopener noreferrer" download>Last ned test-APK ↗</a>
      <p className="install-footnote">Filstørrelse: {(apk.size/1024/1024).toFixed(1)} MB · Kun for testing. Android kan kreve at du tillater installasjon fra nettleseren. Installer bare APK-er fra en kilde du stoler på.</p>
      {apk.digest?.startsWith("sha256:")&&<p className="install-footnote">SHA-256: <code>{apk.digest.slice(7)}</code></p>}
      <p className="install-footnote">Debug-signerte oppdateringer kan kreve at forrige testversjon avinstalleres.</p>
    </>:<div className="install-unavailable" role="status">APK-en er ikke publisert ennå. Bygging og testing gjenstår. Installer webappen over i mellomtiden.</div>}
   </article>
  </section>
  <section className="install-trust"><h2>Hva kan jeg bruke appen til?</h2><p>Se demonstrasjoner av lokale leveringsoppdrag, send inn søknad eller bedriftsforespørsel og prøv GPS-kartet. Ekte leveringer, automatisk betaling og lønnsutbetaling er ikke åpnet i pilotversjonen.</p><p>Det brukes en sikker HTTPS-tilkobling. Les <Link href="/personvern">personvern</Link> og <Link href="/vilkar">pilotvilkår</Link> før du registrerer deg.</p></section>
 </main>;
}
