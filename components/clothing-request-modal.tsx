"use client";

import { useState } from "react";
import { ProductCustomizer } from "@/components/product-customizer";

export function ClothingRequestModal() {
  const [open, setOpen] = useState(false);

  return <>
    <button type="button" className="dark-button clothing-request-trigger" onClick={() => setOpen(true)}>Åpne bestillingsskjema <span>↗</span></button>
    {open ? <div className="clothing-modal" role="dialog" aria-modal="true" aria-labelledby="clothing-modal-title">
      <button type="button" className="clothing-modal__backdrop" aria-label="Lukk bestillingsskjema" onClick={() => setOpen(false)} />
      <div className="clothing-modal__panel">
        <header><div><p className="editorial-kicker lime">PROFILPRODUKTER · BESTILL NÅ</p><h2 id="clothing-modal-title">Bestillingsskjema</h2></div><button type="button" className="clothing-modal__close" onClick={() => setOpen(false)} aria-label="Lukk">×</button></header>
        <ProductCustomizer />
      </div>
    </div> : null}
  </>;
}
