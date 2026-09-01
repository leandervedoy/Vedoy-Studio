import Link from "next/link";
import { TrafficChart } from "@/components/studio/traffic-chart";
import { NotesBoard } from "@/components/studio/notes-board";
import { WorkHoursModule } from "@/components/studio/work-hours-module";
import { getOverview, isUsingDatabase, listStudioNotes, listWorkTimeEntries } from "@/lib/repository";
import { requireSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioDashboardPage() {
  const session = await requireSession();
  const [overview, notes, timeEntries] = await Promise.all([getOverview(), listStudioNotes(), listWorkTimeEntries(session.email)]);
  return <div className="growth-dashboard">
    <header className="dashboard-heading"><div><p className="eyebrow">VEDØY GROWTH / BEDRIFTSPLATTFORM</p><h1>Growth-oversikt</h1><p>Drift, kunder, timer og neste steg samlet for virksomheten.</p></div><div className="dashboard-heading__actions"><span className={isUsingDatabase() ? "data-mode is-live" : "data-mode"}><i />{isUsingDatabase() ? "PostgreSQL tilkoblet" : "Demodata i minnet"}</span><Link className="button button--dark" href="/studio/projects">+ Nytt prosjekt</Link></div></header>
    <section className="stat-grid">
      <article><span>◎</span><div><small>Domener</small><strong>{overview.stats.domains}</strong><p>Alle overvåkes</p></div><Link href="/studio/domains">↗</Link></article>
      <article><span>△</span><div><small>Prosjekter</small><strong>{overview.stats.projects}</strong><p>{overview.stats.monthlyRequests.toLocaleString("nb-NO")} forespørsler</p></div><Link href="/studio/projects">↗</Link></article>
      <article><span>□</span><div><small>Bookinger</small><strong>{overview.stats.bookingsThisMonth}</strong><p>Denne måneden</p></div><Link href="/studio/booking">↗</Link></article>
      <article><span>◉</span><div><small>Kunder</small><strong>{overview.stats.customers}</strong><p>Aktive profiler</p></div><Link href="/studio/customers">↗</Link></article>
      <article><span>⌁</span><div><small>Oppetid</small><strong>{overview.stats.uptime}%</strong><p>Alle tjenester friske</p></div><Link href="/studio/monitoring">↗</Link></article>
    </section>
    <section className="dashboard-grid">
      <article className="studio-panel studio-panel--large"><div className="panel-heading"><div><small>VEDØY STATISTICS</small><h2>Trafikk denne uken</h2></div><div><strong>1 842</strong><span className="trend-up">↗ 18,4%</span></div></div><TrafficChart points={overview.traffic} /><div className="metric-row"><div><small>Unike besøkende</small><strong>1 204</strong></div><div><small>Konvertering</small><strong>4,8%</strong></div><div><small>Gjennomsnittstid</small><strong>2m 41s</strong></div></div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>NESTE BOOKINGER</small><h2>Kommende</h2></div><Link href="/studio/booking">Åpne kalender</Link></div><div className="upcoming-list">{overview.bookings.slice(0, 3).map((booking) => <article key={booking.id}><time>{new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short" }).format(new Date(booking.startsAt))}<b>{new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" }).format(new Date(booking.startsAt))}</b></time><i style={{ background: booking.serviceId === "remote-it" ? "#2563eb" : booking.serviceId === "business-check" ? "#7c3aed" : "#16a34a" }} /><div><strong>{booking.serviceName}</strong><p>{booking.customerName}</p></div><span className={`status-chip status-chip--${booking.status}`}><i />{booking.status === "confirmed" ? "Bekreftet" : "Avventer"}</span></article>)}</div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>PROSJEKTER</small><h2>Produksjon</h2></div><Link href="/studio/projects">Se alle</Link></div><div className="compact-projects">{overview.projects.map((project) => <article key={project.id}><span>{project.framework === "Next.js" ? "N" : "S"}</span><div><strong>{project.name}</strong><small>{project.productionUrl}</small></div><i className={`health-dot health-dot--${project.status}`} /><time>{formatDateTime(project.lastDeployAt)}</time></article>)}</div></article>
      <NotesBoard initialNotes={notes} compact />
      <WorkHoursModule initialEntries={timeEntries} />
      <article className="studio-panel vedi-insight"><div className="vedi-insight__mark">✦</div><div><small>VEDI FORESLÅR</small><h2>Gjør booking tydeligere på forsiden</h2><p>Bookingdemoen får trafikk, men få går videre til tidspunkt. Test en knapp med «Se ledige tider» i hero-seksjonen.</p><Link href="/studio/vedi">Utforsk med Vedi →</Link></div></article>
      <article className="studio-panel"><div className="panel-heading"><div><small>AKTIVITET</small><h2>Siste hendelser</h2></div><button className="icon-button">•••</button></div><div className="activity-list">{overview.activities.map((activity) => <article key={activity.id}><span>{activity.type === "deployment" ? "△" : activity.type === "booking" ? "□" : activity.type === "domain" ? "◎" : "⌁"}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><time>{formatDateTime(activity.createdAt)}</time></article>)}</div></article>
    </section>
  </div>;
}
