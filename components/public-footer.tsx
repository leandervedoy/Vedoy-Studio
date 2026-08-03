import Link from "next/link";
import { Brand } from "@/components/brand";

const columns = [
  {
    title: "Bygg",
    links: [["Domener", "/domains"], ["Hosting", "/#hosting"], ["Nettsider", "/#builder"], ["Booking", "/booking"]]
  },
  {
    title: "Drift og vekst",
    links: [["Vedøy Assist", "/#support"], ["Statistics", "/#analytics"], ["Vedi AI", "/#vedi"], ["Academy", "/#academy"]]
  },
  {
    title: "Utviklere",
    links: [["Dokumentasjon", "/docs"], ["API", "/docs#api"], ["Status", "/status"], ["GitHub-oppsett", "/docs#deploy"]]
  },
  {
    title: "Vedøy",
    links: [["Om oss", "/#about"], ["Priser", "/pricing"], ["Kontakt", "/#contact"], ["Personvern", "/privacy"]]
  }
];

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container public-footer__grid">
        <div className="public-footer__intro">
          <Brand inverse />
          <p>Digital infrastruktur med skandinavisk enkelhet og personlig oppfølging fra Haugesund.</p>
          <span className="status-pill"><i /> Systemdemo tilgjengelig</span>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.links.map(([label, href]) => (
                <li key={label}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container public-footer__bottom">
        <p>© {new Date().getFullYear()} Vedøy. Org.nr. 937 024 622.</p>
        <p>Bygget for små virksomheter med store planer.</p>
      </div>
    </footer>
  );
}
