import { requireSession } from "@/lib/auth";
import { PayConsole } from "./pay-console";
import { getPayOverview, requirePayUserId } from "@/lib/vedoy-pay/server";
import "./pay.css";

export const dynamic="force-dynamic";
export const metadata={title:"Vedoy Pay · Vedøy Studio",robots:{index:false,follow:false}};
export default async function PayPage() {
  const session=await requireSession();
  if(!requirePayUserId(session))return <main className="pay">
    <p className="pay-eyebrow">VEDOY STUDIO / VEDOY PAY</p>
    <h1>Vedoy Pay</h1>
    <section className="pay-panel"><h2>Bekreftet Vedøy ID kreves</h2>
      <p>Logg inn med Vedøy ID på nytt. Ingen konto- eller saldoinformasjon vises uten verifisert identitet.</p>
    </section>
  </main>;
  try {return <PayConsole initial={await getPayOverview(session)}/>;}
  catch {return <main className="pay"><p className="pay-eyebrow">VEDOY STUDIO / VEDOY PAY</p>
    <h1>Vedoy Pay</h1><section className="pay-panel"><h2>Databasen er ikke klargjort</h2>
      <p>Kjør migreringen først. Vi viser ingen fiktive kontoer, kort eller lojalitetssaldoer.</p>
    </section></main>;}
}
