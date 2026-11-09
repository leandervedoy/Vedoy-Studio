"use client";

import { useState } from "react";
import type { InsightArticle } from "@/lib/insights-articles";
import articleStyles from "@/app/insights/insights.module.css";
import { DEFAULT_PREFERENCES, ReaderPreferenceIntro, type ReaderPreferences } from "./reader-preference-intro";

export function InsightsStandardArticle({ sections }: { sections: InsightArticle["sections"] }) {
  const [introOpen, setIntroOpen] = useState(false);
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);
  const [started, setStarted] = useState(false);
  const paragraphsToDisplay = preferences.depth === "brief" ? 1 : preferences.depth === "standard" ? 2 : Number.POSITIVE_INFINITY;
  return (
    <div>
      {introOpen && (
        <ReaderPreferenceIntro
          allowInteractive={false}
          initial={preferences}
          onBegin={(_mode, next) => {
            setPreferences(next);
            setIntroOpen(false);
            setStarted(true);
          }}
        />
      )}
      <div style={{ padding: "15px 0 25px", borderTop: "1px solid #39483a", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", color: "#b9ff39", fontSize: 12, letterSpacing: ".05em" }}>VEDOY INSIGHTS · LESEVALG</strong>
          <span style={{ display: "block", fontSize: 13, color: "#ccdcc8", marginTop: 7 }}>{started ? "Tilpasset din preferanse" : "Les som vanlig eller tilpass artikkelen frivillig."}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center" }}>
          <label htmlFor="insights-standard-depth" style={{ color: "#c7dcc0", fontSize: 13 }}>Detaljnivå</label>
          <select id="insights-standard-depth" value={preferences.depth} onChange={(event) => setPreferences((prev) => ({ ...prev, depth: event.target.value as ReaderPreferences["depth"] }))}
            style={{ background: "#18251a", color: "#fff", padding: 10, border: "1px solid #536c54", borderRadius: 9 }}>
            <option value="brief">Kort</option>
            <option value="standard">Vanlig</option>
            <option value="deep">Detaljert</option>
          </select>
          <button type="button" onClick={() => setIntroOpen(true)}
            style={{ border: "1px solid #526a51", color: "#fff", background: "#223126", borderRadius: 9, padding: 11, cursor: "pointer" }}>
            Tilpass / frivillig data
          </button>
        </div>
      </div>
      <div className={articleStyles.articleBody}>
        {sections.map((section, index) => (
          <section key={section.heading}>
            <div className={articleStyles.chapterNumber}>{String(index + 1).padStart(2, "0")}</div>
            <h2>{section.heading}</h2>
            {section.paragraphs.slice(0, paragraphsToDisplay).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
