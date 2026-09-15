"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { NotificationCenter } from "@/components/studio/notification-center";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/types";

type NavItem = { href: string; icon: string; label: string; exact?: boolean; adminOnly?: boolean };
type NavSection = { label: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    label: "Oversikt",
    items: [{ href: "/studio", icon: "⌂", label: "Dashboard", exact: true }, { href: "/studio/team", icon: "◌", label: "Team" }, { href: "/studio/companies", icon: "✦", label: "Bedriftsoppsett", adminOnly: true }]
  },
  {
    label: "Bygg",
    items: [
      { href: "/studio/services", icon: "≡", label: "Tjenester", adminOnly: true },
      { href: "/studio/domains", icon: "◎", label: "Domener" },
      { href: "/studio/projects", icon: "△", label: "Hosting og prosjekter" },
      { href: "/studio/builder", icon: "▦", label: "Nettsidebygger" }
    ]
  },
  {
    label: "Drift",
    items: [
      { href: "/studio/requests", icon: "✦", label: "Henvendelser" },
      { href: "/studio/canvas", icon: "▤", label: "Vedøy Canvas" },
      { href: "/studio/hours", icon: "◷", label: "Timeregistrering" },
      { href: "/studio/booking", icon: "□", label: "Booking" },
      { href: "/studio/customers", icon: "◉", label: "Kunder og CRM" },
      { href: "https://mail.vedoystudio.no", icon: "✉", label: "E-post" },
      { href: "/studio/support", icon: "☺", label: "Vedøy Assist" }
    ]
  },
  {
    label: "Voks",
    items: [
      { href: "/studio/analytics", icon: "↗", label: "Statistics" },
 { href: "/studio/news", icon: "▤", label: "Vedøy News" },
 { href: "/studio/account", icon: "◎", label: "Konto og profil" },
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
  userRole,
  organizationName
}: {
  children: React.ReactNode;
  userName: string;
  userRole: SessionPayload["role"];
  organizationName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactViewport, setCompactViewport] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchItems = sections.flatMap((section) => section.items.filter((item) => !item.adminOnly || userRole === "owner" || userRole === "admin").map((item) => ({ ...item, section: section.label })));
  const searchResults = searchItems.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1050px)");
    const update = () => setCompactViewport(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => document.getElementById("studio-global-search")?.focus(), 0);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const applyAppearance = () => {
      try {
        const value = JSON.parse(localStorage.getItem("vedoy-studio-appearance") || "{}");
        if (value.accent) document.documentElement.style.setProperty("--studio-accent", value.accent);
        if (value.surface) document.documentElement.style.setProperty("--studio-panel", value.surface);
        document.documentElement.classList.toggle("studio-compact", Boolean(value.compact));
      } catch { /* brukerens lokale innstilling er valgfri */ }
    };
    applyAppearance();
    window.addEventListener("vedoy-studio-appearance", applyAppearance);
    return () => window.removeEventListener("vedoy-studio-appearance", applyAppearance);
  }, []);

  function toggleSidebar() {
    if (compactViewport) setSidebarOpen((value) => !value);
    else setSidebarCollapsed((value) => !value);
  }

  function closeSidebar() {
    if (compactViewport) setSidebarOpen(false);
    else setSidebarCollapsed(true);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function goToResult(href: string) {
    setSearch(""); setSearchOpen(false);
    if (href.startsWith("http")) window.location.href = href;
    else router.push(href);
  }

  return (
    <div className={cn("studio-shell", sidebarCollapsed && "is-sidebar-collapsed")}>
      <aside className={cn("studio-sidebar", sidebarOpen && "is-open")}> 
        <div className="studio-sidebar__brand">
          <Brand />
          <button type="button" className="sidebar-close" onClick={closeSidebar} aria-label="Lukk meny">×</button>
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
              {section.items.filter((item) => !item.adminOnly || userRole === "owner" || userRole === "admin").map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} title={item.label} className={cn(active && "is-active")} onClick={() => setSidebarOpen(false)}>
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
          <small className="studio-version">Vedøy Growth · v0.1.0 beta</small>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Lukk meny" onClick={() => setSidebarOpen(false)} />}
      <div className="studio-content">
        <header className="studio-topbar">
          <button type="button" className="studio-menu-button" onClick={toggleSidebar} aria-label={compactViewport ? (sidebarOpen ? "Lukk meny" : "Åpne meny") : (sidebarCollapsed ? "Utvid meny" : "Gjør meny smalere")} aria-expanded={compactViewport ? sidebarOpen : !sidebarCollapsed}>☰</button>
          <div className="studio-search-wrap">
            <div className="studio-search"><span>⌕</span><input id="studio-global-search" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Enter" && searchResults[0]) goToResult(searchResults[0].href); }} placeholder="Søk i Studio …" aria-label="Søk i Studio" /><kbd>⌘ K</kbd></div>
            {searchOpen && <div className="studio-search-results" role="listbox">{searchResults.length ? searchResults.map((item) => <button key={item.href} type="button" onClick={() => goToResult(item.href)}><i>{item.icon}</i><span><strong>{item.label}</strong><small>{item.section}</small></span><b>↵</b></button>) : <p>Ingen treff i Studio.</p>}</div>}
          </div>
          <div className="studio-topbar__actions">
            <NotificationCenter />
            <div className="account-menu">
              <button type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}>
                <span>EL</span><div><strong>{userName}</strong><small>{userRole === "owner" ? "Eier" : userRole === "admin" ? "Administrator" : "Medlem"}</small></div><i>⌄</i>
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
