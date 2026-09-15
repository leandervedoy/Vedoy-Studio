import { ModuleHeader } from "@/components/studio/module-header";
import { requireSession } from "@/lib/auth";
import { listNewsPosts } from "@/lib/repository";
import { NewsManager } from "@/components/studio/news-manager";
export const dynamic = "force-dynamic";
export default async function StudioNewsPage() { const session = await requireSession(); const posts = await listNewsPosts(false); return <><ModuleHeader eyebrow="VEDØY NEWS" title="Newsroom" description="Skriv oppdateringer som kladd. Bare Admin eller Administrator kan publisere." badge="DRAFT FIRST" /><NewsManager initialPosts={posts} authorName={session.name} authorAvatarUrl={session.avatarUrl} canPublish={session.role === "admin" || session.role === "owner"} /></>; }
