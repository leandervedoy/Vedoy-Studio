import Link from "next/link";
import { ModuleHeader } from "@/components/studio/module-header";
import { requireSession } from "@/lib/auth";
import { listNewsPosts } from "@/lib/repository";
import { NewsManager } from "@/components/studio/news-manager";
export const dynamic = "force-dynamic";
export default async function StudioNewsPage() { const session = await requireSession(); const posts = await listNewsPosts(false); return <><ModuleHeader eyebrow="VEDØY NEWS" title="Newsroom" description="Skriv oppdateringer som kladd. Bare administrator og eier kan publisere." badge="DRAFT FIRST" /><p style={{margin:"0 0 24px"}}><Link href="/studio/news/shield" className="button button--dark">Vedoy Shield &amp; Advertisement →</Link></p><NewsManager initialPosts={posts} authorName={session.name} authorAvatarUrl={session.avatarUrl} canPublish={["admin", "owner", "vedoy_owner"].includes(session.role)} /></>; }
