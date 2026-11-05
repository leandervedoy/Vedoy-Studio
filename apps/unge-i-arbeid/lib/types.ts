export const CATEGORIES=[
{id:"butikk",label:"Butikk og salg",icon:"◈"},
{id:"servering",label:"Kafé og servering",icon:"☕"},
{id:"levering",label:"Levering og bud",icon:"↗"},
{id:"distribusjon",label:"Reklame og postdistribusjon",icon:"✉"},
{id:"renhold",label:"Renhold og rydding",icon:"✧"},
{id:"arrangement",label:"Arrangement",icon:"✦"},
{id:"kontor",label:"Kontor og administrasjon",icon:"▤"},
{id:"teknologi",label:"IT og teknologi",icon:"⌘"},
{id:"annet",label:"Annet",icon:"✳"}
] as const;
export type Category=(typeof CATEGORIES)[number]["id"];
export type AgeBand="15_17"|"18_20"|"21_25"|"26_plus";
export type AccountType="candidate"|"employer";
export type JobStatus="pending_review"|"published"|"closed"|"rejected";
export type ApplicationStatus="sent"|"reviewed"|"shortlisted"|"rejected"|"hired"|"completed";
export type WorkType="part_time"|"summer"|"weekend"|"full_time";
export type WorkMode="onsite"|"hybrid"|"remote";
export const WORK_TYPES:Record<WorkType,string>={part_time:"Deltid",summer:"Sommerjobb",weekend:"Helg og kvelder",full_time:"Heltid"};
export const WORK_MODES:Record<WorkMode,string>={onsite:"På arbeidsplassen",hybrid:"Hybrid",remote:"Hjemmefra"};
export type Profile={user_id:string;display_name:string;account_type:AccountType;age_band:AgeBand|null;city:string;created_at:string};
export type Company={owner_id:string;company_name:string;org_number:string;status:"pending"|"verified"|"rejected";created_at:string};
export type Job={
id:string;owner_id:string;company_name:string;title:string;description:string;
category:Category;city:string;work_type:WorkType;work_mode:WorkMode;
pay_min_ore:number;pay_max_ore:number;pay_unit:"hour"|"month";min_age:15|18;
application_deadline:string|null;status:JobStatus;created_at:string;demo?:boolean;
};
export type Application={
id:string;job_id:string;applicant_id:string;applicant_name:string;contact_email:string;
introduction:string;availability:string;status:ApplicationStatus;created_at:string
};
export type InsightArticle={id:string;title:string;excerpt:string;url:string;categoryLabel:string;publishedAt:string};
export function kr(ore:number){return new Intl.NumberFormat("nb-NO",{maximumFractionDigits:0}).format(ore/100)+" kr";}
export function categoryLabel(id:Category){return CATEGORIES.find(c=>c.id===id)?.label||"Annet";}
export function paymentLabel(j:Job){return (j.pay_min_ore===j.pay_max_ore?kr(j.pay_min_ore):kr(j.pay_min_ore)+"–"+kr(j.pay_max_ore))+(j.pay_unit==="hour"?"/t":"/mnd");}
export function permittedAge(j:Pick<Job,"min_age"|"category">,age:AgeBand|null|undefined){if(!age)return false;return age==="15_17"?j.min_age===15&&j.category!=="levering"&&j.category!=="renhold":true;}
export const DEMOS:Job[]=[
{id:"demo-1",owner_id:"demo",company_name:"Eksempelbutikk",title:"Butikkmedarbeider – helg",description:"Eksempelutlysning: hjelpetimer på lørdager med opplæring, kundeservice og varepåfylling. Arbeidsgiver må vurdere om oppgavene er egnet for aldersgruppen.",category:"butikk",city:"Haugesund",work_type:"weekend",work_mode:"onsite",pay_min_ore:16000,pay_max_ore:17500,pay_unit:"hour",min_age:15,application_deadline:null,status:"published",created_at:"2026-11-05T11:00:00Z",demo:true},
{id:"demo-2",owner_id:"demo",company_name:"Eksempelkafé",title:"Ekstrahjelp på kafé",description:"Eksempelutlysning: servering på dagtid, rydding og lett kundearbeid med opplæring. Ikke en reell ledig stilling.",category:"servering",city:"Karmøy",work_type:"part_time",work_mode:"onsite",pay_min_ore:16500,pay_max_ore:18000,pay_unit:"hour",min_age:15,application_deadline:null,status:"published",created_at:"2026-11-05T10:00:00Z",demo:true},
{id:"demo-3",owner_id:"demo",company_name:"Eksempellevering",title:"Bud for lokale leveranser",description:"Eksempelutlysning for voksne bud. Trafikksikkerhet, forsikring, utstyr og arbeidsvilkår må kontrolleres.",category:"levering",city:"Haugesund",work_type:"part_time",work_mode:"onsite",pay_min_ore:20000,pay_max_ore:22000,pay_unit:"hour",min_age:18,application_deadline:null,status:"published",created_at:"2026-11-05T09:00:00Z",demo:true},
{id:"demo-4",owner_id:"demo",company_name:"Eksempelarrangør",title:"Assistent på lokalt arrangement",description:"Eksempelutlysning: enkel publikumsveiledning og rydding. Oppgaver, tillatelser og arbeidstid må tilpasses alderen.",category:"arrangement",city:"Haugesund",work_type:"weekend",work_mode:"onsite",pay_min_ore:17000,pay_max_ore:18000,pay_unit:"hour",min_age:15,application_deadline:null,status:"published",created_at:"2026-11-05T08:00:00Z",demo:true}
,
{id:"demo-5",owner_id:"demo",company_name:"Eksempelbedrift",title:"Lett rydding og klargjøring av kontor",description:"Illustrert jobb: rydde fellesarealer og organisere utstyr. Yrkesrenhold krever godkjent virksomhet, HMS-kort og korrekte lønns- og sikkerhetsvilkår.",category:"renhold",city:"Haugesund",work_type:"part_time",work_mode:"onsite",pay_min_ore:19000,pay_max_ore:22000,pay_unit:"hour",min_age:18,application_deadline:null,status:"published",created_at:"2026-11-05T07:00:00Z",demo:true},
{id:"demo-6",owner_id:"demo",company_name:"Eksempelbyrå",title:"Del ut brosjyrer i godkjent rute",description:"Eksempelstilling: distribuer uadressert reklame til postkasser uten reservasjonsmerke. Grunnlønn for arbeidstid, eventuell bonus for kontrollert antall. Dokumenter ruten uten å fotografere navn eller adresser.",category:"distribusjon",city:"Haugesund",work_type:"weekend",work_mode:"onsite",pay_min_ore:16000,pay_max_ore:18500,pay_unit:"hour",min_age:15,application_deadline:null,status:"published",created_at:"2026-11-05T06:00:00Z",demo:true}];

export type CV={
 user_id:string;headline:string;summary:string;skills:string;education:string;
 other_experience:string;updated_at:string;
};
export type WorkConfirmation={
 id:string;application_id:string;job_id:string;candidate_id:string;employer_id:string;
 company_name:string;worker_name:string;position_title:string;
 start_date:string;end_date:string;duties:string;optional_assessment:string;
 issued_by:string;issued_at:string;revoked_at:string|null;
};
