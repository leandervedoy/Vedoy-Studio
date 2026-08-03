"use client";

import { useState } from "react";
import { DomainSearch } from "@/components/domain-search";
import type { StudioDomain } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function DomainManager({ domains }: { domains: StudioDomain[] }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <div className="action-row">
        <button className="button button--dark" type="button" onClick={() => setShowSearch((value) => !value)}>{showSearch ? "Lukk domenesøk" : "+ Finn et domene"}</button>
        <button className="button button--ghost" type="button">Overfør domene</button>
      </div>
      {showSearch && <div className="inline-tool"><DomainSearch compact /></div>}
      <div className="domain-table">
        <div className="domain-table__head"><span>Domene</span><span>Status</span><span>Koblet til</span><span>Fornyes</span><span /></div>
        {domains.map((domain) => (
          <article key={domain.id}>
            <div className="domain-name"><span>◎</span><div><strong>{domain.name}</strong><small>{domain.dnsProvider}</small></div></div>
            <span className={`status-chip status-chip--${domain.status}`}><i />{domain.status === "active" ? "Aktivt" : domain.status === "pending" ? "Venter på DNS" : "Utløper snart"}</span>
            <span>{domain.projectId ? domain.projectId.replace("prj_", "") : "Ikke koblet"}</span>
            <span>{domain.autoRenew ? `Automatisk · ${formatDate(domain.expiresAt)}` : formatDate(domain.expiresAt)}</span>
            <button className="icon-button" type="button">•••</button>
          </article>
        ))}
      </div>
    </>
  );
}
