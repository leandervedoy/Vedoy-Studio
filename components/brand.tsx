import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link href="/" className={cn("brand", compact && "brand--compact", inverse && "brand--inverse")} aria-label="Vedøy Studio forside">
      <Image src="/vedoy-mark.svg" alt="" width={34} height={34} priority />
      <span className="brand__wordmark">
        <strong>VEDØY</strong>
        {!compact && <span>STUDIO</span>}
      </span>
    </Link>
  );
}
