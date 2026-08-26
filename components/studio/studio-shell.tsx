"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Oversikt",
    items: [{ href: "/studio", icon: "⌂", label: "Dashboard", exact: true }]
  },
  {
    label: "Bygg",
    items: [
      { href: "/studio/domains", icon: "◎", label: "Domener" },
      { href: "/studio/projects", icon: "△", label: "Hosting og prosjekter" },
      { href: "/studio/builder", icon: "▦", label: "Nettsidebygger" }
    ]
  },
  {
    label: "Drift",
    items: [
      { href: "/studio/requests", icon: "✦", label: "Henvendelser" },
      { href: "/studio/notes", icon: "▤", label: "Notater" },
      { href: "/studio/hours", icon: "◷", label: "Timeregistrering" },
      { href: "/studio/booking", icon: "□", label: "Booking" },
      { href: "/studio/customers", icon: "◉", label: "Kunder og CRM" },
      { href: "/studio/email", icon: "✉", label: "E-post" },
      { href: "/studio/support", icon: "☺", label: "Vedøy Assist" }
    ]
  },
  {
    label: "Voks",
    items: [
      { href: "/studio/analytics", icon: "↗", label: "Statistics" },
      { href: "/studio/vedi", icon: "✦", label: "Vedi AI" },
      { href: "/studio/academy", icon: "◇", label: "Academy" }
    ]
  },
  {
    label: "Utvikle",
    items: [
      { href: "/studio/apis", icon: "{}", label: "API og nøkler" },
      { href: "/studio/databases", icon: "◫", label: "Databaser" },
      { href: "/studio/monitoring", icon: "⌁", label: "Overvåkning" }
    ]
  }
];

export function StudioShell({
  children,
  userName,
  organizationName
}: {
  children: React.ReactNode;
  userName: string;
  organizationName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="studio-shell">
      <aside className={cn("studio-sidebar", sidebarOpen && "is-open")}> 
        <div className="studio-sidebar__brand">
          <Brand />
          <button type="button" className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Lukk meny">×</button>
        </div>
        <div className="organization-switcher">
          <span className="organization-switcher__mark">VØ</span>
          <div><strong>{organizationName}</strong><small>Vedøy Growth</small></div>
          <span aria-hidden>⌄</span>
        </div>
        <nav className="studio-nav" aria-label="Studio-meny">
          {sections.map((section) => (
            <div className="studio-nav__section" key={section.label}>
              <small>{section.label}</small>
              {section.items.map((item) => {
                const active = ("exact" in item && item.exact) ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className={cn(active && "is-active")} onClick={() => setSidebarOpen(false)}>
                    <i>{item.icon}</i><span>{item.label}</span>{active && <b />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="studio-sidebar__footer">
          <Link href="/studio/settings"><i>⚙</i><span>Innstillinger</span></Link>
          <div className="usage-meter">
            <div><span>Studio-kapasitet</span><strong>34%</strong></div>
            <i><b style={{ width: "34%" }} /></i>
            <small>34 210 av 100 000 API-kall</small>
          </div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Lukk meny" onClick={() => setSidebarOpen(false)} />}
      <div className="studio-content">
        <header className="studio-topbar">
          <button type="button" className="studio-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Åpne meny">☰</button>
          <div className="studio-search"><span>⌕</span><input placeholder="Søk i Studio …" aria-label="Søk i Studio" /><kbd>⌘ K</kbd></div>
          <div className="studio-topbar__actions">
            <Link className="button button--small button--ghost" href="/booking" target="_blank">Se kundeside ↗</Link>
            <button className="notification-button" type="button" aria-label="Varsler">◌<i /></button>
            <div className="account-menu">
              <button type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}>
                <span>EL</span><div><strong>{userName}</strong><small>Eier</small></div><i>⌄</i>
              </button>
              {accountOpen && (
                <div className="account-popover">
                  <Link href="/studio/settings" onClick={() => setAccountOpen(false)}>Kontoinnstillinger</Link>
                  <Link href="/docs" onClick={() => setAccountOpen(false)}>Dokumentasjon</Link>
                  <button type="button" onClick={logout}>Logg ut</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="studio-main">{children}</main>
      </div>
    </div>
  );
}
