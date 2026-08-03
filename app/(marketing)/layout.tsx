import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell">
      <div className="announcement"><span>●</span> Vedøy Studio er i tidlig utvikling — bli med og form plattformen.</div>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
