import { ModuleHeader } from "@/components/studio/module-header";

const messages = [
  { from: "Nordlys Kafé", subject: "Re: Forslag til ny nettside", preview: "Dette ser veldig ryddig ut. Kan vi ta en kort gjennomgang …", time: "00:42", unread: true },
  { from: "Ingrid Solheim", subject: "Takk for hjelpen", preview: "Nå fungerer e-posten på både PC og telefon. Tusen takk …", time: "I går", unread: true },
  { from: "Vercel", subject: "Deployment ready", preview: "Your production deployment has completed successfully …", time: "I går" },
  { from: "Kystform Studio", subject: "Bilder til forsiden", preview: "Her kommer bildene vi snakket om. Jeg har merket favorittene …", time: "1. aug" }
];

export default function EmailPage() {
  return <><ModuleHeader eyebrow="DRIFT" title="Vedøy E-post" description="En rolig felles innboks for virksomhetens viktigste samtaler og varsler." badge="UI-PROTOTYPE" /><div className="email-layout"><aside><button className="button button--dark button--wide">✎ Ny melding</button><nav><a className="is-active">Innboks <b>2</b></a><a>Stjernemerket</a><a>Sendt</a><a>Utkast <b>1</b></a><a>Arkiv</a></nav><small>POSTBOKSER</small><nav><a><i style={{ background: "#2563eb" }} /> hei@vedoy.com</a><a><i style={{ background: "#7c3aed" }} /> support@vedoy.com</a></nav></aside><section className="email-list"><header><div className="studio-search"><span>⌕</span><input placeholder="Søk i e-post" /></div><button className="icon-button">↻</button></header>{messages.map((message) => <article key={message.subject} className={message.unread ? "is-unread" : ""}><span className="email-avatar">{message.from.slice(0, 2).toUpperCase()}</span><div><strong>{message.from}</strong><h3>{message.subject}</h3><p>{message.preview}</p></div><time>{message.time}</time>{message.unread && <i />}</article>)}</section><section className="email-empty"><span>✉</span><h2>Velg en melding</h2><p>E-postintegrasjon kobles senere til en leverandør. Denne siden viser ønsket arbeidsflyt og design.</p></section></div></>;
}
