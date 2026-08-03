"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string; mode?: "ai" | "demo" };

const starters = [
  "Hva bør jeg forbedre på forsiden?",
  "Lag en enkel plan for flere bookinger",
  "Forklar trafikken denne uken",
  "Hva er viktigst for digital sikkerhet?"
];

export function VediChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hei! Jeg er Vedi. Jeg kan hjelpe deg å forstå Studio, velge neste steg og gjøre digitale ting litt mindre knotete.", mode: "demo" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setInput("");
    setMessages((items) => [...items, { role: "user", text: message }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json() as { answer?: string; mode?: "ai" | "demo"; error?: string };
      if (!response.ok) throw new Error(data.error || "Vedi kunne ikke svare.");
      setMessages((items) => [...items, { role: "assistant", text: data.answer ?? "", mode: data.mode }]);
    } catch (reason) {
      setMessages((items) => [...items, { role: "assistant", text: reason instanceof Error ? reason.message : "Noe gikk galt." }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="vedi-layout">
      <aside className="vedi-context">
        <div className="vedi-orb">✦</div>
        <h2>Vedi kjenner Studio</h2>
        <p>Assistenten kan bruke sammenheng fra modulene du er inne i. I demoen brukes trygge standardsvar når ingen OpenAI-nøkkel er satt.</p>
        <div className="context-sources"><span><i /> Prosjekter</span><span><i /> Booking</span><span><i /> Statistics</span><span><i /> Academy</span></div>
        <small>Ikke legg passord, helseopplysninger eller kunders sensitive data i chatten.</small>
      </aside>
      <section className="vedi-chat">
        <div className="vedi-chat__messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-message chat-message--${message.role}`}>
              <span>{message.role === "assistant" ? "✦" : "EL"}</span>
              <div><p>{message.text}</p>{message.role === "assistant" && message.mode && <small>{message.mode === "ai" ? "Svar fra tilkoblet KI" : "Smart demomodus"}</small>}</div>
            </div>
          ))}
          {loading && <div className="chat-message chat-message--assistant"><span>✦</span><div className="typing"><i /><i /><i /></div></div>}
        </div>
        {messages.length <= 1 && <div className="prompt-grid">{starters.map((starter) => <button key={starter} onClick={() => void ask(starter)}>{starter}<span>↗</span></button>)}</div>}
        <form className="vedi-composer" onSubmit={submit}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Spør Vedi om nettsiden, booking, tall eller neste steg …" rows={3} maxLength={4000} />
          <div><small>{input.length}/4000</small><button className="button button--dark" disabled={loading || input.trim().length < 2}>Send <span>↑</span></button></div>
        </form>
      </section>
    </div>
  );
}
