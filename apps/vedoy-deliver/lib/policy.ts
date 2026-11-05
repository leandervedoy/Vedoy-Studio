export type AgeBand="15_17"|"18_20"|"21_25";
export type Mode="walk"|"bike"|"car";
export type TaskState="open"|"claimed"|"picked_up"|"delivered"|"verified"|"cancelled";
export type CourierStatus="pending"|"approved"|"declined"|"suspended";
export const MODE_LABELS:Record<Mode,string>={walk:"Til fots",bike:"Sykkel",car:"Bil"};
export const AGE_LABELS:Record<AgeBand,string>={"15_17":"15–17 år","18_20":"18–20 år","21_25":"21–25 år"};
export function validModeForAge(band:AgeBand,mode:Mode):boolean{
 return band!=="15_17"||mode!=="car";
}
export function eligibleForTask(
 courier:{age_band:AgeBand;mode:Mode;status:CourierStatus},
 task:{min_age:15|18;transport:Mode|"any";minor_approved:boolean;status:TaskState}
):boolean{
 if(courier.status!=="approved"||task.status!=="open")return false;
 if(!validModeForAge(courier.age_band,courier.mode))return false;
 if(task.transport!=="any"&&task.transport!==courier.mode)return false;
 return courier.age_band!=="15_17"||task.min_age===15&&task.minor_approved&&courier.mode!=="car";
}
export function money(ore:number){return new Intl.NumberFormat("nb-NO",{style:"currency",currency:"NOK",maximumFractionDigits:0}).format(ore/100);}
export function nextTaskState(current:TaskState):TaskState|null{
 if(current==="claimed")return "picked_up";
 if(current==="picked_up")return "delivered";
 return null;
}
export function taskStateLabel(state:TaskState):string{
 return ({open:"Ledig",claimed:"Tildelt",picked_up:"Hentet",delivered:"Til kontroll",verified:"Godkjent",cancelled:"Avlyst"})[state];
}
