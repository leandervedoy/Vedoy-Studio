import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { getBuilderPageBySlug } from "@/lib/page-builder";
import { PageRenderer } from "@/components/page-builder/page-renderer";

export const dynamic = "force-dynamic";

export default async function DynamicBuilderPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  if (isPreview) await requireAdminSession();
  const page = await getBuilderPageBySlug(slug, isPreview);
  if (!page) notFound();
  return <PageRenderer page={page} preview={isPreview} />;
}
