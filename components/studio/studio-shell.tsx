"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { NotificationCenter } from "@/components/studio/notification-center";
import { cn } from "@/lib/utils";
import type { SessionPayload } from "@/lib/types";

type NavItem = { href: string; icon: string; label: string; exact?: boolean; adminOnly?: boolean; locked?: boolean; vedoyOwnerOnly?: boolean; keywords?: string };
type NavSection = { label: string; items: NavItem[]; advanced?: boolean };

const sections: NavSection[] = [
  {
    label: "Kom i gang",
    items: [{ href: "/studio", icon: "⌂", label: "Oversikt", exact: true, keywords: "start hjem dashboard" }]
  },
  {
    label: "Kunder og salg",
    items: [
      { href: "/studio/requests", icon: "✦", label: "Henvendelser", keywords: "innboks leads forespørsler" },
      { href: "/studio/customers", icon: "◉", label: "Kunder", keywords: "crm kunderegister" },
      { href: "/studio/booking", icon: "□", label: "Bookinger", keywords: "kalender avtaler" },
      { href: "/studio/support", icon: "☺", label: "Kundeservice", keywords: "assist hjelp" }
    ]
  },
  {
    label: "Prosjekter og drift",
    items: [
      { href: "/studio/projects", icon: "△", label: "Prosjekter", keywords: "hosting deploy GitHub Vercel nettsider" },
      { href: "/studio/domains", icon: "◎", label: "Domener", keywords: "DNS navn" },
      { href: "/studio/canvas", icon: "▤", label: "Canvas", keywords: "arbeidsflate design" },
      { href: "/studio/analytics", icon: "↗", label: "Statistikk", keywords: "traffic analytics besøkende" }
    ]
  },
  {
    label: "Arbeidsverktøy",
    advanced: true,
    items: [
      { href: "/studio/hours", icon: "◷", label: "Timeregistrering", keywords: "arbeidstid" },
      { href: "https://mail.vedoystudio.no", icon: "✉", label: "E-post", keywords: "mail post" },
      { href: "/studio/news", icon: "▤", label: "Nyheter", keywords: "Vedøy News artikler" },
      { href: "/studio/services", icon: "≡", label: "Tjenester", adminOnly: true, locked: true },
      { href: "/studio/builder", icon: "▦", label: "Nettsidebygger", locked: true },
      { href: "/studio/cashback", icon: "◈", label: "Cashback", keywords: "lojalitet" },
      { href: "/studio/advertize", icon: "◉", label: "Annonser", vedoyOwnerOnly: true, keywords: "reklame" }
    ]
  },
  {
    label: "Team og administrasjon",
    advanced: true,
    items: [
      { href: "/studio/team", icon: "◌", label: "Team", keywords: "ansatte" },
      { href: "/studio/companies", icon: "✦", label: "Bedriftsoppsett", adminOnly: true },
      { href: "/studio/roles", icon: "♙", label: "Roller og tilganger", adminOnly: true },
      { href: "/studio/vedoy-manager", icon: "✦", label: "Vedøy Manager", vedoyOwnerOnly: true },
      { href: "/studio/account", icon: "◎", label: "Konto og profil" }
    ]
  },
  {
    label: "Utviklerverktøy",
    advanced: true,
    items: [
      { href: "/studio/apis", icon: "{}", label: "API og nøkler", locked: true },
      { href: "/studio/databases", icon: "◫", label: "Databaser", locked: true },
      { href: "/studio/monitoring", icon: "⌁", label: "Overvåkning", locked: true },
      { href: "/studio/vedi", icon: "✦", label: "Vedi AI", locked: true },
      { href: "/studio/academy", icon: "◇", label: "Academy", locked: true }
    ]
  }
];

function destination(item: NavItem) {
  return item.locked ? `/studio/locked?module=${encodeURIComponent(item.label)}` : item.href;
}


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
  const [showMore, setShowMore] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const allowed = (item: NavItem) => (!item.vedoyOwnerOnly || userRole === "vedoy_owner") && (!item.adminOnly || userRole === "owner" || userRole === "admin" || userRole === "vedoy_owner");
  const searchItems = [
    ...sections.flatMap((section) => section.items.filter(allowed).map((item) => ({ ...item, section: section.label }))),
    { href: "/studio/settings", icon: "⚙", label: "Innstillinger", section: "Konto", keywords: "integrasjoner varsler sikkerhet" }
  ];
  const term = search.trim().toLocaleLowerCase("nb-NO");
  const searchResults = searchItems.filter((item) => `${item.label} ${item.section} ${item.keywords || ""}`.toLocaleLowerCase("nb-NO").includes(term)).slice(0, 7);
  const activeItem = searchItems.find((item) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const currentPage = activeItem?.label || (pathname.startsWith("/studio/locked") ? "Modultilgang" : "Oversikt");
  const activeAdvanced = sections.some((section) => section.advanced && section.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)));
  const expandedNavigation = showMore || activeAdvanced;

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
        setMobileSearchOpen(true);
        window.setTimeout(() => document.getElementById("studio-global-search")?.focus(), 0);
      }
      if (event.key === "Escape") { setSearchOpen(false); setMobileSearchOpen(false); }
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
    setSearch(""); setSearchOpen(false); setMobileSearchOpen(false); setSidebarOpen(false);
    if (href.startsWith("http")) window.location.href = href;
    else router.push(href);
  }

  function renderSection(section: NavSection) {
    const items = section.items.filter(allowed);
    if (!items.length) return null;
    return (
      <div className="studio-nav__section" key={section.label}>
        <small>{section.label}</small>
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={destination(item)} title={item.label} aria-current={active ? "page" : undefined} className={cn(active && "is-active", item.locked && "is-locked")} onClick={() => setSidebarOpen(false)}>
            <i aria-hidden>{item.icon}</i><span>{item.label}</span>{item.locked ? <em aria-label="Modulen er låst">⌑</em> : active && <b />}
          </Link>;
        })}
      </div>
    );
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
          {sections.filter((section) => !section.advanced).map(renderSection)}
          <button className="studio-nav-more" type="button" aria-expanded={expandedNavigation} onClick={() => setShowMore((previous) => !previous)}>
            <span>{expandedNavigation ? "Færre verktøy" : "Flere verktøy"}</span><span aria-hidden>{expandedNavigation ? "−" : "+"}</span>
          </button>
          {expandedNavigation && sections.filter((section) => section.advanced).map(renderSection)}
        </nav>
        <div className="studio-sidebar__footer">
          <Link href="/studio/settings"><i>⚙</i><span>Innstillinger</span></Link>
          <small className="studio-version">Vedøy Growth · v0.1.0 beta</small>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Lukk meny" onClick={() => setSidebarOpen(false)} />}
      <div className="studio-content">
        <header className="studio-topbar">
          <button type="button" className="studio-menu-button" onClick={toggleSidebar} aria-label={compactViewport ? (sidebarOpen ? "Lukk meny" : "Åpne meny") : (sidebarCollapsed ? "Utvid meny" : "Gjør meny smalere")} aria-expanded={compactViewport ? sidebarOpen : !sidebarCollapsed}>☰</button>
          <div className="studio-location"><Link href="/studio">Growth</Link><span aria-hidden>›</span><strong>{currentPage}</strong></div>
          <div className={cn("studio-search-wrap", mobileSearchOpen && "is-search-visible")}>
            <div className="studio-search"><span>⌕</span><input id="studio-global-search" value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Enter" && searchResults[0]) goToResult(searchResults[0].href); }} placeholder="Finn side eller funksjon …" aria-label="Søk etter sider og funksjoner" /><kbd>⌘ K</kbd></div>
            {searchOpen && <div className="studio-search-results" role="listbox">{searchResults.length ? searchResults.map((item) => <button key={item.href} type="button" onClick={() => goToResult(destination(item))}><i>{item.icon}</i><span><strong>{item.label}</strong><small>{item.section}</small></span><b>↵</b></button>) : <p>Ingen treff i Studio.</p>}</div>}
          </div>
          <div className="studio-topbar__actions">
            <button type="button" className="studio-mobile-search" aria-label="Søk etter side" aria-expanded={mobileSearchOpen} onClick={() => { setMobileSearchOpen((open) => !open); setSearchOpen(true); window.setTimeout(() => document.getElementById("studio-global-search")?.focus(), 0); }}>⌕</button>
            <NotificationCenter />
            <div className="account-menu">
              <button type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}>
                <span>EL</span><div><strong>{userName}</strong><small>{userRole === "vedoy_owner" ? "Vedøy Owner" : userRole === "owner" ? "Eier" : userRole === "admin" ? "Administrator" : "Ansatt"}</small></div><i>⌄</i>
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
