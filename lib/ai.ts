const SYSTEM_PROMPT = `Du er Vedi, en rolig og praktisk digital assistent i Vedøy Studio. Du hjelper små og mellomstore virksomheter med nettsider, domener, hosting, booking, e-post, analyse, sikkerhet og digitale rutiner. Svar på norsk, bruk tydelige setninger, prioriter neste konkrete steg og ikke påstå at funksjoner er aktivert når de bare er demo eller planlagt.`;

function demoAnswer(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("domene")) {
    return "Start med ett kort hoveddomene som er lett å si høyt. Koble det til nettsiden, slå på automatisk fornyelse og legg DNS-endringer i en enkel logg. Vedøy Domains-siden kan brukes til å teste navneforslag nå.";
  }
  if (text.includes("booking") || text.includes("kalender")) {
    return "For booking ville jeg startet med tre tjenester, tydelig varighet, buffertid og én standarduke. Test hele kundereisen på mobil før du legger til betaling og kalender-synk.";
  }
  if (text.includes("nettside") || text.includes("forside")) {
    return "Gjør forsiden enkel å forstå på fem sekunder: hva dere tilbyr, hvem det er for og én tydelig handling. Vis deretter ekte produkter, dashboardet og personlig support — ikke bare lange beskrivelser.";
  }
  if (text.includes("markedsføring") || text.includes("salg")) {
    return "Velg én tydelig målgruppe først, for eksempel lokale tjenestebedrifter. Lag en konkret demo for dem, kontakt fem relevante virksomheter og noter hvilke problemer de faktisk ber om hjelp med.";
  }
  if (text.includes("sikker")) {
    return "Prioriter tofaktor, separate kontoer, minst mulig tilgang, automatisk backup og en enkel hendelseslogg. Ikke lagre hemmelige nøkler i nettleseren eller i GitHub.";
  }
  return "Jeg ville valgt ett mål for denne uken: få én funksjon helt demonstrerbar fra start til slutt. Deretter kan Studio vokse modul for modul uten at opplevelsen blir rotete.";
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;
  if (!Array.isArray(record.output)) return null;
  const pieces: string[] = [];
  for (const item of record.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const value = part as Record<string, unknown>;
      if (typeof value.text === "string") pieces.push(value.text);
    }
  }
  return pieces.join("\n").trim() || null;
}

export async function askVedi(message: string): Promise<{ answer: string; mode: "ai" | "demo" }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { answer: demoAnswer(message), mode: "demo" };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: SYSTEM_PROMPT,
      input: message,
      store: false,
      max_output_tokens: 500
    }),
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Vedi API-feil (${response.status}): ${detail.slice(0, 180)}`);
  }

  const data = await response.json() as unknown;
  return { answer: extractOutputText(data) || demoAnswer(message), mode: "ai" };
}
