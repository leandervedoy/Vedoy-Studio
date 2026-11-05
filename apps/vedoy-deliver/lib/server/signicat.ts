import "server-only";
const env=(name:string)=>{const value=process.env[name];if(!value)throw new Error(name+" is not configured");return value;};
export async function signicatToken():Promise<string>{
 const url=env("SIGNICAT_TOKEN_URL");
 if(!url.startsWith("https://"))throw new Error("Signicat token URL must be HTTPS");
 const body=new URLSearchParams({grant_type:"client_credentials",scope:process.env.SIGNICAT_SCOPE||"signicat-api"});
 const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Authorization:"Basic "+Buffer.from(env("SIGNICAT_CLIENT_ID")+":"+env("SIGNICAT_CLIENT_SECRET")).toString("base64")},body,cache:"no-store"});
 if(!response.ok)throw new Error("Signicat OAuth failed: "+response.status);
 const result=await response.json();
 if(typeof result.access_token!=="string")throw new Error("Signicat token missing");
 return result.access_token;
}
export async function signicatSession(id:string){
 const token=await signicatToken();
 const response=await fetch("https://api.signicat.com/auth/rest/sessions/"+encodeURIComponent(id),{headers:{Authorization:"Bearer "+token},cache:"no-store"});
 if(!response.ok)throw new Error("Signicat session status failed: "+response.status);
 return response.json() as Promise<{status:string;provider?:string;subject?:{id?:string;dateOfBirth?:string;name?:string}}>;
}
export async function startSignicat(callback:string){
 const token=await signicatToken();
 const url="https://api.signicat.com/auth/rest/sessions?signicat-accountId="+encodeURIComponent(env("SIGNICAT_ACCOUNT_ID"));
 const response=await fetch(url,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({
   allowedProviders:["nbid"],flow:"redirect",requestedAttributes:["dateOfBirth","name"],
   callbackUrls:{success:callback+"&result=success",abort:callback+"&result=abort",error:callback+"&result=error"}
 }),cache:"no-store"});
 if(!response.ok)throw new Error("Signicat session creation failed: "+response.status);
 const data=await response.json();
 if(typeof data.id!=="string"||typeof data.authenticationUrl!=="string")throw new Error("Invalid Signicat response");
 const target=new URL(data.authenticationUrl);
 if(target.protocol!=="https:")throw new Error("Invalid Signicat redirect URL");
 return {id:data.id,url:data.authenticationUrl};
}
export function ageFromBirthdate(dateOfBirth:string):number|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth))return null;
 const [year,month,day]=dateOfBirth.split("-").map(Number);
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 const now=new Date();const age=now.getUTCFullYear()-year-((now.getUTCMonth()+1<month||(now.getUTCMonth()+1===month&&now.getUTCDate()<day))?1:0);
 return age;
}
export function bandForAge(age:number):"15_17"|"18_20"|"21_25"|null{
 return age>=15&&age<=17?"15_17":age>=18&&age<=20?"18_20":age>=21&&age<=25?"21_25":null;
}
