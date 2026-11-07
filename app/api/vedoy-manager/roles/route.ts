import { enforceInternalApi } from "@/lib/studio-api-guard";
import { NextResponse } from "next/server";
import { z } from "zod";
import { listTeamMembers } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { isOrganizationOwner, logManagerAction, MANAGED_PERMISSIONS, privilegedSupabase, publicError, sameOriginWrite } from "@/lib/vedoy-manager";
export const runtime = "nodejs";
const permissionSchema = z.array(z.enum(MANAGED_PERMISSIONS)).max(MANAGED_PERMISSIONS.length);
const roleSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z0-9_-]{1,40}$/).refine(s => s !== "vedoy_owner"),
  title: z.string().trim().min(2).max(80),
  permissions: permissionSchema
});
export async function GET() {
  const access = await enforceInternalApi();
  if (access) return access;
  const session = await getSession();
  if (!isOrganizationOwner(session)) return NextResponse.json({ error: "Forbudt." }, { status: 403 });
  try {
    const db = privilegedSupabase();
    const [roles, members, team] = await Promise.all([
      db.from("vedoy_org_roles").select("slug,title,permissions,protected").eq("organization_id",session.organizationId).order("slug"),
      db.from("vedoy_org_role_members").select("member_email,role_slug").eq("organization_id",session.organizationId),
      listTeamMembers()
    ]);
    if (roles.error || members.error) throw new Error("Role read failed");
    return NextResponse.json({ roles: roles.data, assignments: members.data, team: team.map(t=>({ email:t.email,name:t.name,role:t.role })) });
  } catch (error) { return NextResponse.json(publicError(error), { status: 503 }); }
}
export async function POST(request: Request) {
  const access = await enforceInternalApi(request);
  if (access) return access;
  const session = await getSession();
  if (!isOrganizationOwner(session)) return NextResponse.json({ error: "Forbudt." }, { status: 403 });
  if (!sameOriginWrite(request)) return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  const input = roleSchema.safeParse(await request.json().catch(()=>null));
  if (!input.success || ["employee","admin","owner"].includes(input.data.slug))
    return NextResponse.json({ error: "Ugyldig rollenavn eller tillatelser." }, { status: 422 });
  try {
    const { error } = await privilegedSupabase().from("vedoy_org_roles").insert({
      organization_id: session.organizationId, slug: input.data.slug, title: input.data.title,
      permissions: [...new Set(input.data.permissions)], protected: false
    });
    if (error) return NextResponse.json({ error: error.code==="23505" ? "Rollen finnes allerede." : "Kunne ikke opprette rollen." }, { status: error.code==="23505"?409:503 });
    await logManagerAction(session.email,"create","role",input.data.slug,{ permissions: input.data.permissions });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch(error) { return NextResponse.json(publicError(error), { status: 503 }); }
}
export async function PATCH(request: Request) {
  const access = await enforceInternalApi(request);
  if (access) return access;
  const session = await getSession();
  if (!isOrganizationOwner(session)) return NextResponse.json({ error: "Forbudt." }, { status: 403 });
  if (!sameOriginWrite(request)) return NextResponse.json({ error: "Ugyldig opphav." }, { status: 403 });
  const body = await request.json().catch(()=>null);
  if (body?.type === "assignment") {
    const parsed = z.object({ email:z.email(), roleSlug:z.string().regex(/^[a-z][a-z0-9_-]{1,40}$/) }).safeParse(body);
    if (!parsed.success || parsed.data.email.toLowerCase()===session.email.toLowerCase() || parsed.data.roleSlug==="owner" || parsed.data.roleSlug==="vedoy_owner")
      return NextResponse.json({error:"Ugyldig tildeling. Eierrollen kan ikke tildeles her."},{status:422});
    try {
      const team = await listTeamMembers();
      if (!team.some(member=>member.email.toLowerCase()===parsed.data.email.toLowerCase()&&member.role!=="owner"))
        return NextResponse.json({ error:"Medlemmet finnes ikke i bedriftens team." },{status:404});
      const db=privilegedSupabase();
      const {data: role,error:checkError}=await db.from("vedoy_org_roles").select("slug").eq("organization_id",session.organizationId).eq("slug",parsed.data.roleSlug).maybeSingle();
      if(checkError||!role) return NextResponse.json({error:"Ukjent rolle."},{status:404});
      const {error}=await db.from("vedoy_org_role_members").upsert({organization_id:session.organizationId,member_email:parsed.data.email.toLowerCase(),role_slug:parsed.data.roleSlug,updated_at:new Date().toISOString()},{onConflict:"organization_id,member_email"});
      if(error) throw error;
      await logManagerAction(session.email,"assign","role_member",parsed.data.email,{roleSlug:parsed.data.roleSlug});
      return NextResponse.json({success:true});
    }catch(error){return NextResponse.json(publicError(error),{status:503});}
  }
  const parsed=roleSchema.safeParse(body);
  if(!parsed.success||parsed.data.slug==="owner")
    return NextResponse.json({error:"Ugyldig rolle eller endring."},{status:422});
  try{
    const db=privilegedSupabase();
    const {data,error}=await db.from("vedoy_org_roles").update({title:parsed.data.title,permissions:[...new Set(parsed.data.permissions)],updated_at:new Date().toISOString()})
      .eq("organization_id",session.organizationId).eq("slug",parsed.data.slug).select("slug").maybeSingle();
    if(error) throw error;
    if(!data) return NextResponse.json({error:"Rollen finnes ikke."},{status:404});
    await logManagerAction(session.email,"update","role",parsed.data.slug,{permissions:parsed.data.permissions});
    return NextResponse.json({success:true});
  }catch(error){return NextResponse.json(publicError(error),{status:503});}
}
