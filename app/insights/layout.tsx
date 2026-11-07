import { VoluntaryStatistics } from "@/components/voluntary-statistics";

export default function InsightsLayout({children}:{children:React.ReactNode}){
 return <>
  {children}
  <VoluntaryStatistics site="studio" group="news" />
 </>;
}
