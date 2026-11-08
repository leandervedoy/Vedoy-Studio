export type Category = "writing" | "digital" | "delivery" | "phone_sales" | "local";
export type AgeBand = "15_17" | "18_20" | "21_25" | "26_plus" | "";
export type Job = {
  id:string; title:string;description:string;category:Category;city:string;
  pay_ore:number;estimated_minutes:number;min_age:15|18;employer_name:string;
  backup_enabled:boolean;status:"open"|"pending_review"|"closed"|"rejected";
  created_at:string;demo?:boolean;
};
export const CATEGORY_LABELS:Record<Category,string>={
  writing:"Tekst og innhold",digital:"Digitale oppgaver",delivery:"Levering",
  phone_sales:"Telefonsalg",local:"Lokale småjobber"
};
export const CATEGORY_ICONS:Record<Category,string>={
  writing:"✍",digital:"⌘",delivery:"↗",phone_sales:"☎",local:"◈"
};
export const CATEGORY_AGE:Record<Category,15|18>={
  writing:15,digital:15,delivery:18,phone_sales:18,local:18
};
export const AGE_BANDS:Record<Exclude<AgeBand,"">,number>={
  "15_17":15,"18_20":18,"21_25":21,"26_plus":26
};
export function eligibleToExpressInterest(job:Pick<Job,"min_age"|"category">,ageBand:AgeBand):boolean{
 if(!ageBand)return false;
 if(ageBand==="15_17")return job.min_age===15&&(job.category==="digital"||job.category==="writing");
 return AGE_BANDS[ageBand]>=job.min_age;
}
export function formatNok(ore:number){return new Intl.NumberFormat("nb-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0}).format(ore/100);}
export const EXAMPLES:Job[]=[
 {id:"demo-writing",title:"Skriv en kort teknologiguide",description:"Eksempel på et research- og skriveoppdrag med tydelig brief, kilder og redaksjonell gjennomgang.",category:"writing",city:"Digitalt",pay_ore:30000,estimated_minutes:90,min_age:15,employer_name:"Demobedrift",backup_enabled:false,status:"open",created_at:"2026-11-04",demo:true},
 {id:"demo-digital",title:"Test en nettside på mobil",description:"Eksempel: test et nettsted og lever en kort rapport med skjermbilder og forbedringsforslag.",category:"digital",city:"Digitalt",pay_ore:25000,estimated_minutes:60,min_age:15,employer_name:"Demobedrift",backup_enabled:false,status:"open",created_at:"2026-11-04",demo:true},
 {id:"demo-sales",title:"Kundesamtaler etter avtale",description:"Eksempel på kundekontakt i godkjent tidsrom og med nødvendig opplæring.",category:"phone_sales",city:"Haugesund",pay_ore:45000,estimated_minutes:120,min_age:18,employer_name:"Demobedrift",backup_enabled:false,status:"open",created_at:"2026-11-04",demo:true},
 {id:"demo-delivery",title:"Lever en liten pakke lokalt",description:"Eksempel på lokal pakkelevering. Sikkerhet, forsikring og transportmiddel vurderes før oppdrag.",category:"delivery",city:"Haugesund",pay_ore:15000,estimated_minutes:45,min_age:18,employer_name:"Demobedrift",backup_enabled:true,status:"open",created_at:"2026-11-04",demo:true},
 {id:"demo-local",title:"Hjelp til på et lokalt arrangement",description:"Eksempel på en kort arrangementshjelp med definert arbeidstid og veiledning.",category:"local",city:"Haugesund",pay_ore:60000,estimated_minutes:180,min_age:18,employer_name:"Demobedrift",backup_enabled:false,status:"open",created_at:"2026-11-04",demo:true}
];
