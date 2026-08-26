"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GrowthNotification } from "@/lib/types";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<GrowthNotification[]>([]);

  async function load(markRead = false) {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setItems(data.notifications || []);
    if (markRead) { await fetch("/api/notifications", { method: "PATCH" }); setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))); }
  }

  useEffect(() => { void load(); }, []);
  const unread = items.filter((item) => !item.readAt).length;
  return <div className="notification-center"><button className="notification-button" type="button" aria-label="Varsler" aria-expanded={open} onClick={() => { const next = !open; setOpen(next); if (next) void load(true); }}>
    ◌{unread > 0 && <i />}
  </button>{open && <div className="notifications-popover"><header><div><small>VEDØY GROWTH</small><strong>Varsler</strong></div><Link href="/studio/settings" onClick={() => setOpen(false)}>Innstillinger</Link></header><div>{items.length ? items.slice(0, 6).map((item) => <Link key={item.id} href={item.href || "/studio"} onClick={() => setOpen(false)} className={!item.readAt ? "is-unread" : ""}><span>{item.type === "lead" ? "✦" : item.type === "booking" ? "□" : "◌"}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(item.createdAt))}</small></div></Link>) : <p className="notifications-empty">Ingen nye varsler. Alt er rolig.</p>}</div></div>}</div>;
}
