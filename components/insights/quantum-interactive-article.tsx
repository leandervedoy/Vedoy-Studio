"use client";

import { useState } from "react";
import type { InsightArticle } from "@/lib/insights-articles";
import articleStyles from "../../app/insights/insights.module.css";
import styles from "./quantum-interactive-article.module.css";
import { DEFAULT_PREFERENCES, ReaderPreferenceIntro, type ReaderPreferences } from "./reader-preference-intro";

type Mode = "choose" | "read" | "explore";
type Props = { sections: InsightArticle["sections"] };

const concepts = [
  {
    name: "Kvantefysikk",
    description: "Fagområdet som undersøker hvordan lys, atomer og andre svært små systemer oppfører seg.",
    example: "Eksempel: hvorfor lasere og transistorer fungerer.",
  },
  {
    name: "Kvantemekanikk",
    description: "Det matematiske rammeverket som beskriver disse kvantefenomenene.",
    example: "Eksempel: regne ut sannsynligheten for ulike måleresultater.",
  },
  {
    name: "Kvanteteknologi",
    description: "Teknologi som bruker kvantefenomener til beregning, måling eller kommunikasjon.",
    example: "Eksempel: kvantedatamaskiner og svært følsomme sensorer.",
  },
] as const;

const questions = [
  {
    question: "Hva betyr superposisjon for en qubit?",
    choices: ["At den er en vanlig bit", "At tilstanden er en kombinasjon av mulige utfall", "At vi får 0 og 1 fra samme måling"],
    correct: 1,
    explanation: "En qubit kan være i en superposisjon før måling, men målingen gir ett klassisk resultat.",
  },
  {
    question: "Trenger postkvantekryptografi en kvantedatamaskin for å fungere?",
    choices: ["Ja, alltid", "Bare på mobil", "Nei, algoritmene kan kjøres på vanlige maskiner"],
    correct: 2,
    explanation: "Postkvantekryptografi er klassiske algoritmer designet for å motstå kjente kvanteangrep.",
  },
  {
    question: "Kan dagens kvantedatamaskiner praktisk knekke RSA-2048?",
    choices: ["Nei", "Ja", "Det skjer automatisk når de kobles til internett"],
    correct: 0,
    explanation: "Shors algoritme viser en framtidig trussel, men det krever langt mer robuste, feilkorrigerte kvantedatamaskiner.",
  },
] as const;

function ConceptExplorer() {
  const [selected, setSelected] = useState(0);
  return (
    <div className={styles.lab} aria-label="Utforsk de tre kvantebegrepene">
      <p className={styles.labEyebrow}>PRØV SELV / BEGREPER</p>
      <h3>Hva er egentlig forskjellen?</h3>
      <div className={styles.conceptButtons} role="group" aria-label="Velg begrep">
        {concepts.map((concept, index) => (
          <button key={concept.name} type="button"
            className={selected === index ? styles.conceptActive : styles.conceptButton}
            aria-pressed={selected === index} onClick={() => setSelected(index)}>
            {concept.name}
          </button>
        ))}
      </div>
      <div className={styles.conceptDetail} aria-live="polite">
        <h4>{concepts[selected].name}</h4>
        <p>{concepts[selected].description}</p>
        <p className={styles.example}>{concepts[selected].example}</p>
      </div>
    </div>
  );
}

function QubitSimulator() {
  const [angle, setAngle] = useState(90);
  const [last, setLast] = useState<number | null>(null);
  const [counts, setCounts] = useState<[number, number]>([0, 0]);
  const probabilityZero = Math.cos((angle * Math.PI / 180) / 2) ** 2;
  const probabilityOne = 1 - probabilityZero;
  const total = counts[0] + counts[1];

  function measure() {
    const outcome = Math.random() < probabilityZero ? 0 : 1;
    setLast(outcome);
    setCounts((previous) => outcome === 0 ? [previous[0] + 1, previous[1]] : [previous[0], previous[1] + 1]);
  }

  return (
    <div className={styles.lab} aria-label="Interaktiv qubit-simulator">
      <p className={styles.labEyebrow}>PRØV SELV / SIMULATOR</p>
      <h3>Mål en qubit</h3>
      <p>Juster en idealisert qubit. Se hvordan sannsynligheten for resultatet 0 eller 1 endrer seg. Trykk «Mål» flere ganger.</p>
      <label className={styles.sliderLabel} htmlFor="qubit-angle">Qubit-tilstand <strong>{angle}°</strong></label>
      <input id="qubit-angle" type="range" className={styles.slider} min={0} max={180} step={15} value={angle}
        onChange={(event) => { setAngle(Number(event.target.value)); setLast(null); setCounts([0, 0]); }}/>
      <div className={styles.probabilities} aria-label="Teoretiske sannsynligheter">
        <div><span>Resultat 0</span><strong>{Math.round(probabilityZero * 100)} %</strong></div>
        <div className={styles.track}><span style={{ width: String(probabilityZero * 100) + "%" }}/></div>
        <div><span>Resultat 1</span><strong>{Math.round(probabilityOne * 100)} %</strong></div>
        <div className={styles.track}><span style={{ width: String(probabilityOne * 100) + "%" }}/></div>
      </div>
      <div className={styles.measureRow}>
        <button type="button" className={styles.actionButton} onClick={measure}>Mål qubiten</button>
        <button type="button" className={styles.subtleButton} onClick={() => {setCounts([0, 0]); setLast(null);}}>Nullstill</button>
      </div>
      <p className={styles.result} role="status">
        {last === null ? "Ingen målinger ennå." : "Siste måling: " + last + ". "}
        {total > 0 ? "Totalt " + total + " målinger (0: " + counts[0] + ", 1: " + counts[1] + ")." : ""}
      </p>
      <p className={styles.finePrint}>Pedagogisk simulering med vanlige tilfeldige tall – ikke en ekte kvantedatamaskin. Sannsynligheten for 0 er cos²(θ/2).</p>
    </div>
  );
}

function KnowledgeCheck() {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const answered = answers.filter((value) => value !== null).length;
  const correct = answers.filter((value, index) => value === questions[index].correct).length;
  return (
    <div className={styles.lab} aria-label="Test kunnskapen din">
      <p className={styles.labEyebrow}>TEST DEG SELV / 3 SPØRSMÅL</p>
      <h3>Hva har du lært?</h3>
      {questions.map((item, questionIndex) => (
        <fieldset key={item.question} className={styles.question}>
          <legend>{questionIndex + 1}. {item.question}</legend>
          <div className={styles.answers}>
            {item.choices.map((choice, choiceIndex) => {
              const selected = answers[questionIndex] === choiceIndex;
              return <button key={choice} type="button" aria-pressed={selected}
                className={selected ? styles.answerSelected : styles.answer}
                onClick={() => setAnswers((previous) => previous.map((value, index) => index === questionIndex ? choiceIndex : value))}>
                {choice}
              </button>;
            })}
          </div>
          {answers[questionIndex] !== null && (
            <p className={styles.feedback} role="status">
              <strong>{answers[questionIndex] === item.correct ? "Riktig!" : "Ikke helt."}</strong> {item.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <div className={styles.quizFooter}>
        <p aria-live="polite">{answered === questions.length ? "Resultat: " + correct + " av " + questions.length + " riktige." : answered + " av " + questions.length + " besvart."}</p>
        <button type="button" className={styles.subtleButton} onClick={() => setAnswers([null, null, null])}>Prøv igjen</button>
      </div>
    </div>
  );
}

export function QuantumInteractiveArticle({ sections }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [chapter, setChapter] = useState(0);
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);

  function choose(next: Mode, nextPreferences: ReaderPreferences = preferences) {
    setPreferences(nextPreferences);
    setMode(next);
    if (next === "explore") setChapter(0);
  }

  const maxParagraphs = preferences.depth === "brief" ? 1 : preferences.depth === "standard" ? 2 : Number.POSITIVE_INFINITY;

  function navigateTo(index: number) {
    setChapter(Math.max(0, Math.min(index, sections.length - 1)));
    document.getElementById("quantum-experience")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="quantum-experience" className={styles.experience}>
      {mode === "choose" && (
        <ReaderPreferenceIntro onBegin={(readingMode, nextPreferences) => choose(readingMode, nextPreferences)} />
      )}

      <div className={styles.toolbar}>
        <div>
          <span className={styles.kicker}>TO MÅTER Å LÆRE PÅ</span>
          <p>{mode === "explore" ? "Interaktiv artikkel" : "Vanlig artikkel"} · {preferences.depth === "deep" ? "Detaljert" : preferences.depth === "brief" ? "Kort" : "Vanlig"} nivå</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cde2c9" }}>
          Detaljnivå
          <select aria-label="Detaljnivå" value={preferences.depth}
            style={{ padding: 8, color: "#eef8eb", background: "#17251a", border: "1px solid #567157", borderRadius: 8 }}
            onChange={(event) => setPreferences((previous) => ({ ...previous, depth: event.target.value as ReaderPreferences["depth"] }))}>
            <option value="brief">Kort</option>
            <option value="standard">Vanlig</option>
            <option value="deep">Detaljert</option>
          </select>
        </label>
        <button type="button" className={styles.switchMode} onClick={() => setMode("choose")}>Bytt lesemodus / personvern ↗</button>
      </div>

      {mode !== "explore" ? (
        <div className={articleStyles.articleBody}>
          {sections.map((section, index) => (
            <section key={section.heading}>
              <div className={articleStyles.chapterNumber}>{String(index + 1).padStart(2, "0")}</div>
              <h2>{section.heading}</h2>
              {section.paragraphs.slice(0, maxParagraphs).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.interactive}>
          <div className={styles.stepHeader}>
            <div>
              <span className={styles.kicker}>KAPITTEL {chapter + 1} AV {sections.length}</span>
              <label htmlFor="quantum-chapter-select">Hopp til et kapittel</label>
            </div>
            <select id="quantum-chapter-select" className={styles.chapterSelect} value={chapter}
              onChange={(event) => navigateTo(Number(event.target.value))}>
              {sections.map((section, index) => <option key={section.heading} value={index}>{index + 1}. {section.heading}</option>)}
            </select>
          </div>
          <progress className={styles.progress} max={sections.length} value={chapter + 1} aria-label="Fremdrift i interaktiv artikkel"/>
          <div className={articleStyles.articleBody}>
            <section key={sections[chapter].heading}>
              <div className={articleStyles.chapterNumber}>{String(chapter + 1).padStart(2, "0")}</div>
              <h2>{sections[chapter].heading}</h2>
              {sections[chapter].paragraphs.slice(0, maxParagraphs).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          </div>
          {chapter === 0 && <ConceptExplorer />}
          {sections[chapter].heading.includes("Vanlige bits") && <QubitSimulator />}
          {chapter === sections.length - 2 && <KnowledgeCheck />}
          <div className={styles.stepActions}>
            <button type="button" className={styles.subtleButton} disabled={chapter === 0} onClick={() => navigateTo(chapter - 1)}>← Forrige</button>
            {chapter === sections.length - 1 ? (
              <button type="button" className={styles.actionButton} onClick={() => choose("read")}>Les hele artikkelen</button>
            ) : (
              <button type="button" className={styles.actionButton} onClick={() => navigateTo(chapter + 1)}>Neste kapittel →</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
