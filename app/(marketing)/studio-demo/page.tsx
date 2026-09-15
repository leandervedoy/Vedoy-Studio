import { StudioDemoDashboard } from "@/components/studio-demo-dashboard";

export const metadata = { title: "Vedøy Studio-demo", description: "Se et trygt eksempel på Vedøy Studio-dashboardet uten å bruke ekte data." };

export default function StudioDemoPage() {
  return <main className="studio-demo-page"><StudioDemoDashboard /></main>;
}
