import Link from "next/link";
import "@/packages/forma/styles.css";
import "./forma-docs.css";
export default function FormaLayout({children}:{children:React.ReactNode}){
 return <div className="vf-site">
  <header className="vf-site-header">
   <Link href="/developers/forma"><span className="vf-brand-mark">F.</span>Vedoy Forma</Link>
   <nav aria-label="Produktnavigasjon">
    <Link href="/developers">Developers</Link>
    <Link href="/developers/forma">Om Forma</Link>
    <Link href="/developers/forma/components">Komponenter</Link>
    <Link href="/developers/forge">Forge ↗</Link>
   </nav>
  </header>
  {children}
  <footer className="vf-site-footer"><span>Vedoy Forma · Design og struktur for web</span><span>En del av <Link href="/developers">Vedoy Developers</Link> · Utviklet av Vedoy Studio</span></footer>
 </div>;
}
