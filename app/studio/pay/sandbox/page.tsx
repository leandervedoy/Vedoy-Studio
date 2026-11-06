import { requireSession } from "@/lib/auth";
import { requirePayUserId } from "@/lib/vedoy-pay/server";
import { PaySandbox } from "./sandbox-console";
import "../pay.css";
import "./sandbox.css";

export const dynamic="force-dynamic";
export const metadata={title:"Vedoy Pay Sandbox · Vedøy Studio",robots:{index:false,follow:false}};
export default async function PaySandboxPage() {
  const session=await requireSession();
  if (!requirePayUserId(session)) return <main className="pay"><h1>Vedoy Pay Sandbox</h1>
    <p>Logg inn med verifisert Vedøy ID før du tester løsningen.</p></main>;
  return <PaySandbox/>;
}
