import { notFound } from "next/navigation";
import { StaffHub } from "@/components/studio/staff-hub";
import { isStaffArea } from "@/lib/staff-knowledge";

export default async function StaffAreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  if (!isStaffArea(area)) notFound();
  return <StaffHub area={area} />;
}
