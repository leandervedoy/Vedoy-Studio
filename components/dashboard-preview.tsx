const bars = [38, 58, 46, 72, 64, 91, 76, 83, 68, 96, 84, 92];

export function DashboardPreview() {
  return (
    <div className="dashboard-preview" aria-label="Forhåndsvisning av Vedøy Studio-dashboard">
      <aside className="dashboard-preview__sidebar">
        <div className="mini-brand"><span>VØ</span></div>
        {["⌂", "△", "◎", "□", "↗", "✦"].map((icon, index) => <i key={`${icon}-${index}`}>{icon}</i>)}
      </aside>
      <div className="dashboard-preview__main">
        <div className="dashboard-preview__header">
          <div><small>GOD KVELD, LEANDER</small><h3>Studiooversikt</h3></div>
          <div className="avatar">EL</div>
        </div>
        <div className="preview-stats">
          <div><small>Domener</small><strong>3</strong><span>Alle aktive</span></div>
          <div><small>Bookinger</small><strong>12</strong><span>+18% denne måneden</span></div>
          <div><small>Oppetid</small><strong>99,98%</strong><span>Alt fungerer</span></div>
        </div>
        <div className="preview-grid">
          <section className="preview-chart">
            <div className="preview-card-heading"><div><small>VEDØY STATISTICS</small><strong>1 842 besøk</strong></div><span>Siste 30 dager</span></div>
            <div className="bar-chart">
              {bars.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
            </div>
          </section>
          <section className="preview-calendar">
            <div className="preview-card-heading"><div><small>NESTE BOOKINGER</small><strong>I dag</strong></div><span>Se kalender</span></div>
            <div className="mini-booking"><time>10:00</time><i style={{ background: "#2563eb" }} /><div><strong>Digital IT-hjelp</strong><small>Ingrid Solheim</small></div></div>
            <div className="mini-booking"><time>13:00</time><i style={{ background: "#7c3aed" }} /><div><strong>Bedriftssjekk</strong><small>Nordlys Kafé</small></div></div>
            <div className="mini-booking"><time>15:30</time><i style={{ background: "#16a34a" }} /><div><strong>Hjemmebesøk</strong><small>Arne Vik</small></div></div>
          </section>
        </div>
        <div className="preview-vedi"><span>✦</span><div><small>VEDI FORESLÅR</small><p>Tre besøkende forlot prissiden. Test en tydeligere knapp til bedriftspakken.</p></div><button type="button">Se forslag</button></div>
      </div>
    </div>
  );
}
