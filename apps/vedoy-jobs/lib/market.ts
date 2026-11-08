export const CATEGORIES = [
  {id:"all",label:"Alt",icon:"✦"},
  {id:"electronics",label:"Elektronikk",icon:"⌘"},
  {id:"fashion",label:"Klær og stil",icon:"✿"},
  {id:"home",label:"Hjem og interiør",icon:"⌂"},
  {id:"vehicles",label:"Bil og kjøretøy",icon:"↗"},
  {id:"property",label:"Bolig",icon:"▦"},
  {id:"sports",label:"Sport og fritid",icon:"◌"},
  {id:"services",label:"Tjenester",icon:"✧"},
  {id:"other",label:"Annet",icon:"＋"}
] as const;
export type MarketCategory = Exclude<(typeof CATEGORIES)[number]["id"],"all">;
export type MarketCondition = "new" | "like_new" | "good" | "used" | "not_applicable";
export type ListingType = "sell" | "give" | "wanted" | "service";
export type ListingStatus = "pending_review" | "active" | "reserved" | "sold" | "rejected";
export type MarketListing = {
 id:string; owner_id:string; seller_name:string; title:string; description:string;
 category:MarketCategory; condition:MarketCondition; listing_type:ListingType;
 price_ore:number; city:string; photos:string[]; created_at:string;status:ListingStatus;
 demo?:boolean;
};
export type MarketProfile={user_id:string;display_name:string;city:string;created_at:string};
export type MarketThread={id:string;listing_id:string;buyer_id:string;seller_id:string;created_at:string};
export type MarketMessage={id:string;thread_id:string;sender_id:string;body:string;created_at:string};
export const CONDITIONS:Record<MarketCondition,string>={
  new:"Ny",like_new:"Som ny",good:"Pent brukt",used:"Brukt",not_applicable:"Ikke relevant"
};
export const LISTING_TYPES:Record<ListingType,string>={
  sell:"Selges",give:"Gis bort",wanted:"Ønskes kjøpt",service:"Tjeneste"
};
export const ACCENTS: Record<MarketCategory,{bg:string,fg:string,icon:string}>={
 electronics:{bg:"#dbe5ed",fg:"#55768c",icon:"⌘"},
 fashion:{bg:"#eadfdc",fg:"#a17d75",icon:"✿"},
 home:{bg:"#e5e5d9",fg:"#808b6b",icon:"⌂"},
 vehicles:{bg:"#e0e7e9",fg:"#657e8c",icon:"↗"},
 property:{bg:"#e4e1d9",fg:"#8f8069",icon:"▦"},
 sports:{bg:"#deeadf",fg:"#719079",icon:"◌"},
 services:{bg:"#e4dfe8",fg:"#8c779b",icon:"✧"},
 other:{bg:"#e9e4d8",fg:"#9a8558",icon:"＋"}
};
export const DEMO_LISTINGS:MarketListing[]=[
 {id:"demo-01",owner_id:"demo",seller_name:"Eksempel",title:"Kompakt kamera til hverdagen",description:"Illustrasjon av en annonse med flere bilder, tydelig tilstand og en enkel meldingsflyt.",category:"electronics",condition:"good",listing_type:"sell",price_ore:149000,city:"Haugesund",photos:[],status:"active",created_at:"2026-11-05T10:00:00Z",demo:true},
 {id:"demo-02",owner_id:"demo",seller_name:"Eksempel",title:"Vintage lenestol i myk ull",description:"Eksempel på en møbelannonse med praktisk henting og god beskrivelse.",category:"home",condition:"good",listing_type:"sell",price_ore:85000,city:"Haugesund",photos:[],status:"active",created_at:"2026-11-05T09:00:00Z",demo:true},
 {id:"demo-03",owner_id:"demo",seller_name:"Eksempel",title:"Vinterjakke, str. M",description:"Eksempel på et pent brukt plagg med enkel filtrering og favorittfunksjon.",category:"fashion",condition:"like_new",listing_type:"sell",price_ore:55000,city:"Bergen",photos:[],status:"active",created_at:"2026-11-05T08:00:00Z",demo:true},
 {id:"demo-04",owner_id:"demo",seller_name:"Eksempel",title:"By-/pendlersykkel",description:"Et illustrert bruktfunn. Ikke en ekte annonse eller tilgjengelig for kjøp.",category:"sports",condition:"good",listing_type:"sell",price_ore:240000,city:"Stavanger",photos:[],status:"active",created_at:"2026-11-04T16:00:00Z",demo:true},
 {id:"demo-05",owner_id:"demo",seller_name:"Eksempel",title:"Hjelp med nettside og innhold",description:"Eksempel på en oppdragstjeneste med tydelig beskrivelse og avtalt pris.",category:"services",condition:"not_applicable",listing_type:"service",price_ore:90000,city:"Digitalt",photos:[],status:"active",created_at:"2026-11-04T13:00:00Z",demo:true},
 {id:"demo-06",owner_id:"demo",seller_name:"Eksempel",title:"Liten hylle i eik",description:"Et eksempel på noe som kan gis bort. Ikke en faktisk tilgjengelig gjenstand.",category:"home",condition:"used",listing_type:"give",price_ore:0,city:"Haugesund",photos:[],status:"active",created_at:"2026-11-04T12:00:00Z",demo:true},
 {id:"demo-07",owner_id:"demo",seller_name:"Eksempel",title:"Brukt småbil til bykjøring",description:"Eksempel på kjøretøyannonse. Historikk, heftelser og teknisk stand skal kontrolleres.",category:"vehicles",condition:"good",listing_type:"sell",price_ore:6900000,city:"Oslo",photos:[],status:"active",created_at:"2026-11-04T09:00:00Z",demo:true},
 {id:"demo-08",owner_id:"demo",seller_name:"Eksempel",title:"Lys leilighet nær sentrum",description:"Konsept for en boligutlysning. Opplysningene her er kun for å vise design.",category:"property",condition:"not_applicable",listing_type:"sell",price_ore:255000000,city:"Haugesund",photos:[],status:"active",created_at:"2026-11-03T17:00:00Z",demo:true}
];
export function formatPrice(ore:number,kind:ListingType="sell"){
 if(kind==="give")return"Gis bort";
 return new Intl.NumberFormat("nb-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0}).format(ore/100);
}
export function categoryName(category:MarketCategory){
 return CATEGORIES.find(c=>c.id===category)?.label ?? "Annet";
}
export function formatRelative(value:string){
 const diff=Date.now()-new Date(value).getTime();
 if(!Number.isFinite(diff)||diff<0)return "Nylig";
 const days=Math.floor(diff/86400000);
 if(days===0)return "I dag";
 if(days===1)return "I går";
 if(days<14)return days+" dager siden";
 return new Intl.DateTimeFormat("nb-NO",{day:"numeric",month:"short"}).format(new Date(value));
}
export function cleanInput(value:string,max:number){return value.trim().slice(0,max);}
export function validImageFile(file:File){
 return ["image/jpeg","image/png","image/webp"].includes(file.type)&&file.size<=5*1024*1024;
}
