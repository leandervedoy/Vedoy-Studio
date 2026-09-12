import { requireAdminSession } from "@/lib/auth";
import { listBuilderPages } from "@/lib/page-builder";
import { PageBuilderApp } from "@/components/page-builder/page-builder-app";
import "./builder.css";

export const dynamic = "force-dynamic";

export default async function PageBuilderPage() {
  await requireAdminSession();
  const pages = await listBuilderPages();
  return <PageBuilderApp initialPages={pages} />;
}
