import { redirect } from "next/navigation";

export const metadata = { title: "Vedøy Growth" };

export default function StudioDemoPage() {
  redirect("/pricing#vedoy-growth");
}
