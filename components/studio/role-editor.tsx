"use client";
import { useEffect, useState } from "react";
const PERMISSIONS = [
  ["workspace.read", "Åpne arbeidsområdet"],["projects.read","Se prosjekter"],["projects.edit","Endre prosjekter"],
  ["customers.read","Se kunder"],["customers.edit","Redigere kunder"],["requests.read","Se henvendelser"],
  ["requests.edit","Behandle henvendelser"],["team.read","Se medarbeidere"],["team.edit","Administrere team"],
  ["billing.read","Se fakturering"],["billing.manage","Administrere fakturering"],
  ["roles.manage","Administrere roller"],["content.read","Se innhold"]
] as const;
type Role = { slug:string; title:string; permissions:string[]; protected:boolean };
type Member = { email:string; name:string; role:string };
type Assignment = { member_email:string; role_slug:string };
export function RoleEditor() {
  const [roles,setRoles]=useState<Role[]>([]);
  const [members,setMembers]=useState<Member[]>([]);
  const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [selected,setSelected]=useState("");
  const [draft,setDraft]=useState({slug:"",title:"",permissions:[] as string[]});
  const [notice,setNotice]=useState("");
  const [pending,setPending]=useState(false);
  const [loading,setLoading]=useState(true);
  async function load() {
    setLoading(true);
    try {
      const response=await fetch("/api/vedoy-manager/roles",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||"Kunne ikke hente rollene.");
      setRoles(data.roles||[]);setMembers(data.team||[]);setAssignments(data.assignments||[]);
      if(!selected && data.roles?.length) selectRole(data.roles[0]);
    }catch(error){setNotice(error instanceof Error?error.message:"Feil ved innlasting.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  function selectRole(role:Role){setSelected(role.slug);setDraft({slug:role.slug,title:role.title,permissions:[...role.permissions]});setNotice("");}
  function newRole(){setSelected("");setDraft({slug:"",title:"",permissions:["workspace.read","projects.read","team.read"]});setNotice("");}
  async function save(){
    if(!draft.slug || !draft.title.trim())return setNotice("Rollen trenger navn og ID.");
    setPending(true);setNotice("");
    try{
      const response=await fetch("/api/vedoy-manager/roles",{method:selected?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(draft)});
      const data=await response.json();if(!response.ok)throw Error(data.error||"Kunne ikke lagre.");
      setNotice("Rollen er lagret.");await load();
      const refreshed=[...roles,{...draft,protected:false}].find(r=>r.slug===draft.slug);if(refreshed)selectRole({...draft,protected:refreshed.protected});
    }catch(error){setNotice(error instanceof Error?error.message:"Kunne ikke lagre rollen.");}
    finally{setPending(false);}
  }
  async function assign(email:string,roleSlug:string){
    if(!roleSlug)return;
    setPending(true);setNotice("");
    try{
      const response=await fetch("/api/vedoy-manager/roles",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"assignment",email,roleSlug})});
      const data=await response.json();if(!response.ok)throw Error(data.error||"Kunne ikke tildele.");
      setAssignments(items=>[...items.filter(a=>a.member_email!==email),{member_email:email,role_slug:roleSlug}]);setNotice("Rollen er tildelt medarbeideren.");
    }catch(error){setNotice(error instanceof Error?error.message:"Kunne ikke tildele.");}
    finally{setPending(false);}
  }
  return <div className="vm-roles">
    <div className="vm-role-list"><div className="vm-row-between"><h3>Bedriftsroller</h3><button type="button" onClick={newRole}>+ Ny rolle</button></div>
      {roles.map(role=><button className={selected===role.slug?"selected":""} type="button" key={role.slug} onClick={()=>selectRole(role)}>
        <strong>{role.title}</strong><small>{role.protected?"Standardrolle":"Egendefinert"} · {role.permissions.length} tillatelser</small>
      </button>)}
    </div>
    <div className="vm-role-details"><h3>{selected?"Rediger rolle":"Ny rolle"}</h3>
      {loading&&<p>Laster roller …</p>}
      <label>Rollenavn<input value={draft.title} maxLength={80} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
      <label>Identifikator<input value={draft.slug} disabled={Boolean(selected)} placeholder="f.eks. prosjektleder" onChange={e=>setDraft({...draft,slug:e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,"")})}/></label>
      <div className="vm-permissions"><h4>Velg tillatelser</h4><p>Vedøy Manager er systemlåst og kan aldri gis via egendefinerte roller.</p>
        {PERMISSIONS.map(([key,label])=><label key={key} className="vm-check"><input type="checkbox" disabled={selected==="owner"} checked={draft.permissions.includes(key)} onChange={e=>setDraft({...draft,permissions:e.target.checked?[...draft.permissions,key]:draft.permissions.filter(x=>x!==key)})}/><span><strong>{label}</strong><small>{key}</small></span></label>)}
      </div>
      <button type="button" className="vm-action" disabled={pending||selected==="owner"} onClick={()=>void save()}>{pending?"Lagrer …":"Lagre rolletillatelser"}</button>
      {notice&&<p role="status" className="vm-notice">{notice}</p>}
      <h3>Tildel til medarbeidere</h3>
      {members.filter(m=>m.role!=="owner").map(member=><div className="vm-team-member" key={member.email}>
        <div><strong>{member.name}</strong><small>{member.email}</small></div>
        <select aria-label={`Rolle for ${member.name}`} value={assignments.find(a=>a.member_email===member.email)?.role_slug||""} onChange={e=>void assign(member.email,e.target.value)} disabled={pending}>
          <option value="">Velg rolle</option>{roles.filter(role=>role.slug!=="owner").map(role=><option key={role.slug} value={role.slug}>{role.title}</option>)}
        </select></div>)}
      <p className="vm-muted">Tillatelser for nye moduler ligger i Supabase. Eldre moduler må fortsatt kobles til det nye tillatelsessystemet før tilgangsendringer der trer i kraft.</p>
    </div>
  </div>;
}
