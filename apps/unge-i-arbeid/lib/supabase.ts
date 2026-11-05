import {createClient,type SupabaseClient} from "@supabase/supabase-js";
let singleton:SupabaseClient|null=null;
export const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export function client():SupabaseClient|null{
  if(!configured())return null;
  if(!singleton)singleton=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  return singleton;
}
