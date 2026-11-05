import "server-only";
import {createClient} from "@supabase/supabase-js";
export function admin(){
 const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Supabase server credentials missing");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function authenticatedUser(request:Request){
 const bearer=request.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return null;
 const client=admin();
 const {data,error}=await client.auth.getUser(bearer.slice(7));
 return error?null:data.user;
}
