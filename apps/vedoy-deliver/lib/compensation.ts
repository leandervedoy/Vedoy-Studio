export type YouthAgeTier="15_16"|"17"|"18_plus";
export type YouthRate={hourlyNok:number;deliveryCoins:number;mailboxPhotoCoins:number};
export const YOUTH_RATES:Record<YouthAgeTier,YouthRate>={
 "15_16":{hourlyNok:150,deliveryCoins:10,mailboxPhotoCoins:5},
 "17":{hourlyNok:160,deliveryCoins:20,mailboxPhotoCoins:10},
 "18_plus":{hourlyNok:170,deliveryCoins:35,mailboxPhotoCoins:25}
};
export function tierForAge(age:number):YouthAgeTier|null{
 if(!Number.isInteger(age)||age<15)return null;
 return age<=16?"15_16":age===17?"17":"18_plus";
}
export function calculateCompensation(tier:YouthAgeTier,minutes:number,deliveries:number,approvedPhotos:number){
 if(!Number.isFinite(minutes)||minutes<0||![deliveries,approvedPhotos].every(n=>Number.isInteger(n)&&n>=0))throw new Error("Invalid compensation inputs");
 const rate=YOUTH_RATES[tier];
 return {grossWageNok:Math.round(rate.hourlyNok*minutes/60*100)/100,coins:deliveries*rate.deliveryCoins+approvedPhotos*rate.mailboxPhotoCoins};
}
