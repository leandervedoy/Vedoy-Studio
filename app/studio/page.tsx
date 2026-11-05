import Link from "next/link";
import { TrafficChart } from "@/components/studio/traffic-chart";
import { WorkHoursModule } from "@/components/studio/work-hours-module";
import { getOverview, isUsingDatabase, listWorkTimeEntries } from "@/lib/repository";
import { requireSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioDashboardPage() {
  const session = await requireSession();
  const [overview, timeEntries] = await Promise.all([getOverview(), listWorkTimeEntries(session.email)]);
  return <div className="growth-dashboard">
    <header className="dashboard-heading"><div><p className="eyebrow">VEDØY GROWTH / BEDRIFTSPLATTFORM</p><h1>God oversikt over Vedøy</h1><p>Her finner du de viktigste oppgavene, kundene og prosjektene dine.</p></div><div className="dashboard-heading__actions"><span className={isUsingDatabase() ? "data-mode is-live" : "data-mode"}><i />{isUsingDatabase() ? "PostgreSQL tilkoblet" : "Demodata i minnet"}</span><Link className="button button--dark" href="/studio/requests">Se henvendelser</Link></div></header>
    {!isUsingDatabase() && <div className="studio-info-banner" role="status"><strong>Eksempelvisning</strong><span>Growth er ikke koblet til databasen ennå. Tall, prosjekter og aktiviteter nedenfor er demonstrasjonsdata, ikke live-statistikk.</span></div>}
    <section className="growth-start" aria-labelledby="growth-start-title">
      <div className="growth-start__heading"><div><small>HURTIGTILGANG</small><h2 id="growth-start-title">Hva vil du gjøre?</h2></div><p>Vanlige oppgaver, ett klikk unna.</p></div>
      <div className="growth-start__list">
        <Link href="/studio/requests"><span aria-hidden>✦</span><strong>Svar på henvendelser</strong><small>Se nye forespørsler fra kunder</small><b aria-hidden>↗</b></Link>
        <Link href="/studio/booking"><span aria-hidden>□</span><strong>Administrer bookinger</strong><small>Avtaler og ledige tider</small><b aria-hidden>↗</b></Link>
        <Link href="/studio/projects"><span aria-hidden>△</span><strong>Se prosjekter</strong><small>Nettsider og hosting</small><b aria-hidden>↗</b></Link>
        <Link href="/studio/customers"><span aria-hidden>◉</span><strong>Finn kunder</strong><small>Kundeoversikt og CRM</small><b aria-hidden>↗</b></Link>
      </div>
    </section>
    <section className="stat-grid">
      <article><span>◎</span><div><small>Domener</small><strong>{overview.stats.domains}</strong><p>Registrert i Growth</p></div><Link href="/studio/domains">↗</Link></article>
      <article><span>△</span><div><small>Prosjekter</small><strong>{overview.stats.projects}</strong><p>{overview.stats.monthlyRequests.toLocaleString("nb-NO")} forespørsler</p></div><Link href="/studio/projects">↗</Link></article>
      <article><span>□</span><div><small>Bookinger</small><strong>{overview.stats.bookingsThisMonth}</strong><p>Denne måneden</p></div><Link href="/studio/booking">↗</Link></article>
      <article><span>◉</span><div><small>Kunder</small><strong>{overview.stats.customers}</strong><p>Aktive profiler</p></div><Link href="/studio/customers">↗</Link></article>
      <article><span>⌁</span><div><small>Oppetid</small><strong>–</strong><p>Ikke koblet til live-overvåkning</p></div><Link href="/studio/locked?module=Overvåkning" aria-label="Les om overvåkning">↗</Link></article>
    </section>
    <section className="dashboard-grid">
      <article className="studio-panel studio-panel--large"><div className="panel-heading"><div><small>EKSEMPEL · STATISTIKK</small><h2>Slik kan trafikken vises</h2></div><Link href="/studio/analytics">Åpne statistikk</Link></div><TrafficChart points={overview.traffic} /><p className="growth-demo-note">Illustrasjon – diagrammet viser ikke faktisk trafikk fra nettsidene dine.</p></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>NESTE BOOKINGER</small><h2>Kommende</h2></div><Link href="/studio/booking">Åpne kalender</Link></div><div className="upcoming-list">{overview.bookings.slice(0, 3).map((booking) => <article key={booking.id}><time>{new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" }).format(new Date(booking.startsAt))}<b>{new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" }).format(new Date(booking.startsAt))}</b></time><i style={{ background: booking.serviceId === "remote-it" ? "#2563eb" : booking.serviceId === "business-check" ? "#7c3aed" : "#16a34a" }} /><div><strong>{booking.serviceName}</strong><p>{booking.customerName}</p></div><span className={`status-chip status-chip--${booking.status}`}><i />{booking.status === "confirmed" ? "Bekreftet" : "Avventer"}</span></article>)}</div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>PROSJEKTER</small><h2>Produksjon</h2></div><Link href="/studio/projects">Se alle</Link></div><div className="compact-projects">{overview.projects.map((project) => <article key={project.id}><span>{project.framework === "Next.js" ? "N" : "S"}</span><div><strong>{project.name}</strong><small>{project.productionUrl}</small></div><i className={`health-dot health-dot--${project.status}`} /><time>{formatDateTime(project.lastDeployAt)}</time></article>)}</div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>VEDØY CANVAS</small><h2>Visuelt arbeidsområde</h2></div><Link href="/studio/canvas">Åpne Canvas</Link></div><p>Samle skisser, diagrammer, sider og arbeidsbøker i én visuell flate.</p><Link className="button button--dark" href="/studio/canvas">Fortsett i Canvas →</Link></article>
      <WorkHoursModule initialEntries={timeEntries} />
      <article className="studio-panel vedi-insight"><div className="vedi-insight__mark">✦</div><div><small>KOM I GANG</small><h2>Hold oversikten enkel</h2><p>Begynn med henvendelser og bookinger. Bruk prosjektlisten når du skal følge opp nettsider.</p><Link href="/studio/requests">Gå til henvendelser →</Link></div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>EKSEMPEL · AKTIVITET</small><h2>Slik kan hendelser se ut</h2></div></div><div className="activity-list">{overview.activities.map((activity) => <article key={activity.id}><span>{activity.type === "deployment" ? "△" : activity.type === "booking" ? "□" : activity.type === "domain" ? "◎" : "⌁"}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><time>{formatDateTime(activity.createdAt)}</time></article>)}</div></article>
    </section>
  </div>;
}
