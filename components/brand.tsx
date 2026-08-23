
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link href="/" className={cn("brand", compact && "brand--compact", inverse && "brand--inverse")} aria-label="Vedøy Studio forside">
      <span className="brand__logo-frame" aria-hidden="true"><img src={inverse ? "/imgs/Logos/Vedoy_Logo_W.png" : "/imgs/Logos/Vedoy_Logo_B.png"} alt="" /></span>
      <span className="brand__wordmark">
        <strong>VEDØY</strong>
        {!compact && <span>STUDIO</span>}
      </span>
    </Link>
  );
}
