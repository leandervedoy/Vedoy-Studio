import { notFound } from "next/navigation";
import { StaffArticleView } from "@/components/studio/staff-article-view";
import { getStaffArticle, isStaffArea } from "@/lib/staff-knowledge";

export default async function StaffArticlePage({ params }: { params: Promise<{ area: string; slug: string }> }) {
  const { area, slug } = await params;
  if (!isStaffArea(area)) notFound();
  const article = getStaffArticle(area, slug);
  if (!article) notFound();
  return <StaffArticleView article={article} />;
}
