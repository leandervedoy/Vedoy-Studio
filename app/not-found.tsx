import Link from "next/link";

export default function NotFound() {
  return <main className="legal-page"><div className="container"><p className="eyebrow">404</p><h1>Denne siden fant ikke veien hjem.</h1><p>Lenken kan være gammel, eller modulen kan ha flyttet inn et annet sted i Studio.</p><Link className="button button--dark" href="/">Til forsiden</Link></div></main>;
}
