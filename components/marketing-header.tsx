"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/locale";
import type { SessionPayload } from "@/lib/types";

type Profile = Pick<SessionPayload, "name" | "avatarUrl">;
const links = [
  ["tjenester", "services"], ["plattform", "platform"], ["prosjekter", "projects"],
  ["profilprodukter", "clothing"], ["kontakt", "contact"],
] as const;

export function MarketingHeader({ variant = "editorial", initialProfile }: {
  variant?: "editorial" | "service" | "public";
  initialProfile?: Profile | null;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [languageError, setLanguageError] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile ?? null);
  const [imageFailed, setImageFailed] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialProfile !== undefined) { setProfile(initialProfile); return; }
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal, cache: "no-store" })
      .then(async response => response.ok ? await response.json() : null)
      .then(data => setProfile(data?.authenticated ? data.session : null))
      .catch(() => {});
    return () => controller.abort();
  }, [initialProfile, pathname]);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [open]);

  const name = profile?.name || t("account");
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const avatar = profile?.avatarUrl?.startsWith("https://") ? profile.avatarUrl : null;

  return <header ref={root} className={`marketing-header ${variant === "editorial" ? "editorial-header" : variant === "service" ? "service-detail-header" : "marketing-header--public"}`}>
    <Link href="/" className="editorial-logo" aria-label="Vedøy Studio">
      <Image src="/imgs/Logos/Vedoy_Logo_W.png" width={160} height={62} alt="Vedøy" priority />
    </Link>
    <nav id={menuId} className={`marketing-navigation${open ? " is-open" : ""}`} aria-label={t("navigation")}>
      {links.map(([anchor, key]) => <Link key={anchor} href={`/${"#"}${anchor}`} onClick={() => setOpen(false)}>{t(key)}</Link>)}
    </nav>
    <div className="marketing-header__actions">
      <label className="marketing-language">
        <span className="sr-only">{t("language")}</span>
        <span aria-hidden="true">◎</span>
        <select aria-label={t("language")} value={locale} disabled={pending} onChange={event => {
          const next = event.target.value;
          setLanguageError(false);
          startTransition(async () => {
            try { await setLocale(next); router.refresh(); }
            catch { setLanguageError(true); }
          });
        }}>
          <option value="nb">NO</option><option value="en">EN</option>
        </select>
      </label>
      {languageError ? <span className="marketing-language-error" role="alert">{t("languageError")}</span> : null}
      {profile ? <Link href="/studio" className="marketing-profile" title={name} aria-label={`${t("openStudio")}: ${name}`}>
        <span className="marketing-profile__avatar">
          {avatar && !imageFailed ? <Image src={avatar} alt="" width={36} height={36} unoptimized onError={() => setImageFailed(true)} /> : initials}
        </span><span className="marketing-profile__name">{name}</span><span aria-hidden="true">↗</span>
      </Link> : <Link href="/login?next=/studio" className="marketing-login">{t("login")} <span aria-hidden="true">↗</span></Link>}
      <button ref={menuButton} type="button" className="marketing-menu-toggle" aria-expanded={open} aria-controls={menuId} aria-label={open ? t("closeMenu") : t("openMenu")} onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
    </div>
  </header>;
}
