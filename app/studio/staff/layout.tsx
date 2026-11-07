import type { Metadata } from "next";
import { requireVedoyStaff } from "@/lib/staff-access";
import "./staff.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ansattportal | Vedoy Studio", robots: { index: false, follow: false } };

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireVedoyStaff();
  return children;
}
