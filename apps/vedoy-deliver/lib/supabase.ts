import {createClient,type SupabaseClient} from "@supabase/supabase-js";
let instance:SupabaseClient|null=null;
export function backendConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);}
export function supabase():SupabaseClient|null{
 if(!backendConfigured())return null;
 if(!instance)instance=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
   auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
 });
 return instance;
}
