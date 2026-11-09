import type {AgeBand,Mode,TaskState,CourierStatus} from "@/lib/policy";
export type Courier={
 user_id:string;name:string;age_band:AgeBand;city:string;mode:Mode;
 motivation:string;availability:string;status:CourierStatus;minor_checked:boolean;created_at:string
};
export type Task={
 id:string;merchant_name:string;pickup_area:string;dropoff_area:string;
 estimated_minutes:number;distance_km:number;reward_ore:number;
 transport:Mode|"any";min_age:15|18;minor_approved:boolean;
 status:TaskState;courier_id:string|null;scheduled_at:string;
 claimed_at:string|null;created_at:string;demo?:boolean;
};
export type TaskPrivate={
 task_id:string;pickup_address:string;dropoff_address:string;
 recipient_name:string;recipient_phone:string;delivery_note:string;
};
export type BusinessRequest={
 owner_id:string;company_name:string;org_number:string;contact_name:string;city:string;note:string;
 status:"pending"|"approved"|"rejected";created_at:string;
};
export const DEMO_TASKS:Task[]=[
{id:"sample-1",merchant_name:"Eksempel: Kafé Sentrum",pickup_area:"Haugesund sentrum",dropoff_area:"Hasseløy",estimated_minutes:25,distance_km:2.1,reward_ore:8500,transport:"bike",min_age:15,minor_approved:true,status:"open",courier_id:null,scheduled_at:"2026-11-06T12:30:00Z",claimed_at:null,created_at:"2026-11-05T08:00:00Z",demo:true},
{id:"sample-2",merchant_name:"Eksempel: Lokal nettbutikk",pickup_area:"Haugesund sentrum",dropoff_area:"Rossabø",estimated_minutes:40,distance_km:4.0,reward_ore:12500,transport:"bike",min_age:18,minor_approved:false,status:"open",courier_id:null,scheduled_at:"2026-11-06T14:30:00Z",claimed_at:null,created_at:"2026-11-05T09:00:00Z",demo:true},
{id:"sample-3",merchant_name:"Eksempel: Blomsterbutikk",pickup_area:"Haugesund sentrum",dropoff_area:"Sentrum",estimated_minutes:15,distance_km:0.9,reward_ore:6500,transport:"walk",min_age:15,minor_approved:true,status:"open",courier_id:null,scheduled_at:"2026-11-06T15:30:00Z",claimed_at:null,created_at:"2026-11-05T10:00:00Z",demo:true}
];
