"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("vedoy_global_error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html lang="nb">
      <body style={{ margin: 0, background: "#f7f5ef", color: "#181914", fontFamily: "Arial, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <section style={{ maxWidth: 560, padding: 32, border: "1px solid #d8d5cc", borderRadius: 20, background: "#fffdf8" }}>
            <p style={{ margin: "0 0 12px", color: "#49784d", fontSize: 12, fontWeight: 700, letterSpacing: ".12em" }}>VEDØY STUDIO</p>
            <h1 style={{ margin: "0 0 12px", fontSize: 36 }}>Noe stoppet opp.</h1>
            <p style={{ margin: "0 0 24px", lineHeight: 1.6 }}>Prøv igjen. Hvis feilen fortsetter, kan du gå tilbake til forsiden og kontakte Vedøy Studio.</p>
            <button type="button" onClick={reset} style={{ border: 0, borderRadius: 8, padding: "12px 16px", background: "#181914", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Prøv igjen</button>
          </section>
        </main>
      </body>
    </html>
  );
}
