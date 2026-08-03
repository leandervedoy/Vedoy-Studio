"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#produkter", label: "Produkter" },
  { href: "/domains", label: "Domener" },
  { href: "/booking", label: "Booking" },
  { href: "/pricing", label: "Priser" },
  { href: "/docs", label: "Utviklere" }
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="public-header">
      <div className="container public-header__inner">
        <Brand />
        <nav className={cn("public-nav", open && "is-open")} aria-label="Hovedmeny">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(pathname === link.href && "is-active")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="public-header__actions">
          <Link className="button button--ghost hide-mobile" href="/login">Logg inn</Link>
          <Link className="button button--dark" href="/login">Åpne Studio <span aria-hidden>↗</span></Link>
          <button
            className="menu-button"
            type="button"
            aria-label="Åpne meny"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
