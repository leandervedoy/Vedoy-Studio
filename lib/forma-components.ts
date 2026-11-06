/** Vedoy Forma beta gallery: hardcoded trusted examples; never interpolate user HTML. */
export type FormaCategory = "Navigasjon" | "Skjemaer" | "Innhold" | "Tilbakemelding" | "Media og data";
export type FormaExample = { category: FormaCategory; id: string; title: string; description: string; html: string };
export const formaExamples: FormaExample[] = [
  {
    "category": "Navigasjon",
    "id": "navbar",
    "title": "Toppmeny",
    "description": "Responsiv navigasjon med logo og handlinger.",
    "html": "<nav class=\"vf-navbar\" aria-label=\"Hovedmeny\"><strong>Vedoy</strong><div class=\"vf-nav-links\"><a href=\"#\">Hjem</a><a href=\"#\">Produkter</a><a href=\"#\">Kontakt</a></div><button class=\"vf-button\" type=\"button\">Kom i gang</button></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "sidebar",
    "title": "Sidemeny",
    "description": "Vertikal navigasjon for webapper og kontrollpanel.",
    "html": "<aside class=\"vf-sidebar\" aria-label=\"Sidepanel\"><strong>Workspace</strong><a class=\"vf-active\" href=\"#\">Oversikt</a><a href=\"#\">Prosjekter</a><a href=\"#\">Innstillinger</a></aside>"
  },
  {
    "category": "Navigasjon",
    "id": "bottom-nav",
    "title": "Bunnmeny",
    "description": "Mobilvennlig navigasjon nederst på skjermen.",
    "html": "<nav class=\"vf-bottom-nav\" aria-label=\"Mobilmeny\"><a href=\"#\"><span>⌂</span>Hjem</a><a href=\"#\"><span>◈</span>Utforsk</a><a href=\"#\"><span>☻</span>Profil</a></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "drawer",
    "title": "Skuffemeny",
    "description": "Sidepanel som kan åpnes ved behov.",
    "html": "<div class=\"vf-drawer-sample\"><button class=\"vf-button\" type=\"button\" data-vf-drawer-open=\"demo-drawer\">Åpne meny</button><aside id=\"demo-drawer\" class=\"vf-drawer\" hidden><div class=\"vf-row vf-between\"><strong>Meny</strong><button class=\"vf-icon-button\" type=\"button\" data-vf-drawer-close aria-label=\"Lukk meny\">×</button></div><a href=\"#\">Oversikt</a><a href=\"#\">Innstillinger</a><a href=\"#\">Hjelp</a></aside></div>"
  },
  {
    "category": "Navigasjon",
    "id": "menu",
    "title": "Fleksibel meny",
    "description": "Plassering, størrelse, farger, skrifttype og skygger.",
    "html": "<nav class=\"vf-menu\" data-placement=\"top\" data-position=\"static\" aria-label=\"Eksempelmeny\"><strong>VEDOY</strong><a href=\"#\">Home</a><a href=\"#\">Docs</a><a href=\"#\">Explore</a></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "bento-menu",
    "title": "Bento-meny",
    "description": "Visuelle navigasjonskort i ulike størrelser.",
    "html": "<nav class=\"vf-bento-menu\" aria-label=\"Bento-meny\"><a class=\"vf-bento-large\" href=\"#\"><b>Bygg</b><span>Verktøy for idéene dine ↗</span></a><a href=\"#\"><b>Design</b><span>Forma</span></a><a href=\"#\"><b>Motion</b><span>Animasjoner</span></a></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "dropdown",
    "title": "Nedtrekksmeny",
    "description": "Kompakt meny for valg og handlinger.",
    "html": "<div class=\"vf-dropdown\"><button type=\"button\" class=\"vf-button vf-button-outline\" aria-expanded=\"false\" data-vf-dropdown>Flere valg ▾</button><div class=\"vf-dropdown-panel\" hidden><button type=\"button\">Rediger</button><button type=\"button\">Dupliser</button><button type=\"button\">Arkiver</button></div></div>"
  },
  {
    "category": "Navigasjon",
    "id": "breadcrumb",
    "title": "Brødsmulesti",
    "description": "Vis hvor brukeren befinner seg.",
    "html": "<nav class=\"vf-breadcrumb\" aria-label=\"Brødsmulesti\"><a href=\"#\">Studio</a><span aria-hidden=\"true\">/</span><a href=\"#\">Komponenter</a><span aria-hidden=\"true\">/</span><strong aria-current=\"page\">Button</strong></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "pagination",
    "title": "Sidenavigasjon",
    "description": "Bla mellom sider med tydelig aktiv side.",
    "html": "<nav class=\"vf-pagination\" aria-label=\"Sider\"><button type=\"button\" aria-label=\"Forrige side\">‹</button><button type=\"button\" aria-current=\"page\">1</button><button type=\"button\">2</button><button type=\"button\">3</button><button type=\"button\" aria-label=\"Neste side\">›</button></nav>"
  },
  {
    "category": "Navigasjon",
    "id": "tabs",
    "title": "Faner",
    "description": "Bytt mellom innhold i samme visning.",
    "html": "<div class=\"vf-tabs\" data-vf-tabs><div class=\"vf-tablist\" role=\"tablist\" aria-label=\"Profilfaner\"><button id=\"vf-tab-profile\" type=\"button\" role=\"tab\" aria-controls=\"vf-panel-profile\" aria-selected=\"true\">Profil</button><button id=\"vf-tab-settings\" type=\"button\" role=\"tab\" aria-controls=\"vf-panel-settings\" aria-selected=\"false\" tabindex=\"-1\">Innstillinger</button></div><div id=\"vf-panel-profile\" role=\"tabpanel\" aria-labelledby=\"vf-tab-profile\" class=\"vf-tab-panel\">Din profilinformasjon vises her.</div><div id=\"vf-panel-settings\" role=\"tabpanel\" aria-labelledby=\"vf-tab-settings\" class=\"vf-tab-panel\" hidden>Her velger du innstillinger.</div></div>"
  },
  {
    "category": "Navigasjon",
    "id": "stepper",
    "title": "Stegvis fremdrift",
    "description": "Vis fremgang gjennom flerstegsskjemaer.",
    "html": "<ol class=\"vf-stepper\"><li class=\"vf-complete\"><span>✓</span>Detaljer</li><li class=\"vf-current\" aria-current=\"step\"><span>2</span>Oppsett</li><li><span>3</span>Ferdig</li></ol>"
  },
  {
    "category": "Skjemaer",
    "id": "contact-form",
    "title": "Kontaktskjema",
    "description": "Navn, e-post, melding og enkel validering.",
    "html": "<form class=\"vf-form vf-form-card\"><h3>Kontakt oss</h3><label>Navn<input class=\"vf-input\" name=\"name\" autocomplete=\"name\" required placeholder=\"Ditt navn\"></label><label>E-post<input class=\"vf-input\" name=\"email\" type=\"email\" autocomplete=\"email\" required placeholder=\"deg@eksempel.no\"></label><label>Melding<textarea class=\"vf-textarea\" name=\"message\" required placeholder=\"Hva kan vi hjelpe med?\"></textarea></label><button class=\"vf-button\" type=\"submit\">Send melding</button><p class=\"vf-hint\">Demo – skjemaet sender ingen data.</p></form>"
  },
  {
    "category": "Skjemaer",
    "id": "login-form",
    "title": "Innlogging",
    "description": "Tilgjengelig skjema for e-post og passord.",
    "html": "<form class=\"vf-form vf-form-card\"><h3>Logg inn</h3><p>Velkommen tilbake!</p><label>E-post<input class=\"vf-input\" name=\"email\" type=\"email\" autocomplete=\"username\" required placeholder=\"deg@eksempel.no\"></label><label>Passord<input class=\"vf-input\" name=\"password\" type=\"password\" autocomplete=\"current-password\" required placeholder=\"••••••••\"></label><label class=\"vf-check\"><input type=\"checkbox\" name=\"remember\"> Husk meg</label><button class=\"vf-button\" type=\"submit\">Logg inn</button><p class=\"vf-hint\">Kun UI – krever autentiseringsbackend.</p></form>"
  },
  {
    "category": "Skjemaer",
    "id": "register-form",
    "title": "Registrering",
    "description": "Brukervennlig registrering med grunnleggende felt.",
    "html": "<form class=\"vf-form vf-form-card\"><h3>Opprett konto</h3><label>Navn<input class=\"vf-input\" name=\"name\" autocomplete=\"name\" required placeholder=\"Fullt navn\"></label><label>E-post<input class=\"vf-input\" type=\"email\" name=\"email\" autocomplete=\"email\" required placeholder=\"deg@eksempel.no\"></label><label>Passord<input class=\"vf-input\" type=\"password\" name=\"password\" minlength=\"8\" autocomplete=\"new-password\" required placeholder=\"Minst 8 tegn\"></label><button class=\"vf-button\" type=\"submit\">Registrer deg</button><p class=\"vf-hint\">Kun UI – lagrer ikke brukere.</p></form>"
  },
  {
    "category": "Skjemaer",
    "id": "text-input",
    "title": "Tekstfelt",
    "description": "Et universelt tekstfelt med etikett og hjelpetekst.",
    "html": "<label class=\"vf-field\">Prosjektnavn<input class=\"vf-input\" placeholder=\"Mitt nye prosjekt\" aria-describedby=\"vf-input-help\"><small id=\"vf-input-help\">Navnet kan endres senere.</small></label>"
  },
  {
    "category": "Skjemaer",
    "id": "textarea",
    "title": "Tekstområde",
    "description": "Flere linjer med god kontrast og fokusmarkering.",
    "html": "<label class=\"vf-field\">Beskrivelse<textarea class=\"vf-textarea\" rows=\"4\" placeholder=\"Fortell oss litt om prosjektet\"></textarea></label>"
  },
  {
    "category": "Skjemaer",
    "id": "select",
    "title": "Valgliste",
    "description": "Innebygd, tilgjengelig valgkontroll.",
    "html": "<label class=\"vf-field\">Velg teknologi<select class=\"vf-select\"><option>Vedoy Forma</option><option>React</option><option>Vue</option><option>Next.js</option></select></label>"
  },
  {
    "category": "Skjemaer",
    "id": "checkbox",
    "title": "Avkrysningsboks",
    "description": "Velg ett eller flere alternativer.",
    "html": "<fieldset class=\"vf-options\"><legend>Varsler</legend><label class=\"vf-check\"><input type=\"checkbox\" checked> E-postvarsler</label><label class=\"vf-check\"><input type=\"checkbox\"> Push-varsler</label></fieldset>"
  },
  {
    "category": "Skjemaer",
    "id": "radio",
    "title": "Radioknapper",
    "description": "Velg ett alternativ fra en gruppe.",
    "html": "<fieldset class=\"vf-options\"><legend>Visning</legend><label class=\"vf-check\"><input type=\"radio\" name=\"view\" checked> Kort</label><label class=\"vf-check\"><input type=\"radio\" name=\"view\"> Liste</label></fieldset>"
  },
  {
    "category": "Skjemaer",
    "id": "switch",
    "title": "Bryter",
    "description": "En tydelig av/på-kontroll.",
    "html": "<label class=\"vf-switch\"><input type=\"checkbox\" checked><span class=\"vf-switch-track\"></span><span>Aktiver varsler</span></label>"
  },
  {
    "category": "Skjemaer",
    "id": "range",
    "title": "Skyveknapp",
    "description": "Juster numeriske verdier.",
    "html": "<label class=\"vf-field\">Lydnivå<input class=\"vf-range\" type=\"range\" min=\"0\" max=\"100\" value=\"65\"><small>Juster med piltastene.</small></label>"
  },
  {
    "category": "Skjemaer",
    "id": "file-upload",
    "title": "Filopplasting",
    "description": "Velg filer med tydelig etikett.",
    "html": "<label class=\"vf-upload\"><strong>Velg en fil</strong><span>PNG, JPG eller PDF</span><input type=\"file\" accept=\".png,.jpg,.jpeg,.pdf\"></label>"
  },
  {
    "category": "Skjemaer",
    "id": "search",
    "title": "Søkefelt",
    "description": "Raskt søk i innhold og komponenter.",
    "html": "<form role=\"search\" class=\"vf-search\"><label class=\"vf-visually-hidden\" for=\"vf-search-box\">Søk</label><input id=\"vf-search-box\" class=\"vf-input\" type=\"search\" placeholder=\"Søk i komponenter …\"><button type=\"button\" class=\"vf-button\">Søk</button></form>"
  },
  {
    "category": "Innhold",
    "id": "button",
    "title": "Knapp",
    "description": "Hovedhandling, sekundærhandling og outline.",
    "html": "<div class=\"vf-row\"><button class=\"vf-button\">Primær</button><button class=\"vf-button vf-button-secondary\">Sekundær</button><button class=\"vf-button vf-button-outline\">Outline</button></div>"
  },
  {
    "category": "Innhold",
    "id": "icon-button",
    "title": "Ikonknapp",
    "description": "Kompakt handling med tilgjengelig navn.",
    "html": "<div class=\"vf-row\"><button class=\"vf-icon-button\" aria-label=\"Favoritt\">♡</button><button class=\"vf-icon-button\" aria-label=\"Innstillinger\">⚙</button><button class=\"vf-icon-button\" aria-label=\"Mer\">⋯</button></div>"
  },
  {
    "category": "Innhold",
    "id": "button-group",
    "title": "Knappegruppe",
    "description": "Samler relaterte handlinger.",
    "html": "<div class=\"vf-button-group\" role=\"group\" aria-label=\"Tekstformatering\"><button type=\"button\" aria-label=\"Fet\">B</button><button type=\"button\" aria-label=\"Kursiv\"><i>I</i></button><button type=\"button\" aria-label=\"Understreking\"><u>U</u></button></div>"
  },
  {
    "category": "Innhold",
    "id": "card",
    "title": "Kort",
    "description": "Fleksibel innholdscontainer med handling.",
    "html": "<article class=\"vf-card\"><span class=\"vf-badge\">NYHET</span><h3>Din neste idé</h3><p>Et ryddig kort med plass til tittel, forklaring og handling.</p><button class=\"vf-button vf-button-outline\">Les mer</button></article>"
  },
  {
    "category": "Innhold",
    "id": "bento-grid",
    "title": "Bento Grid",
    "description": "Asymmetrisk grid for dashboards og landingssider.",
    "html": "<section class=\"vf-bento-grid\"><article class=\"vf-bento-hero\"><small>ANALYSE</small><h3>Full oversikt</h3><p>Alt samlet på ett sted.</p></article><article><strong>94%</strong><small>Oppetid</small></article><article><strong>24</strong><small>Prosjekter</small></article></section>"
  },
  {
    "category": "Innhold",
    "id": "badge",
    "title": "Merkelapp",
    "description": "Små etiketter for status og kategorier.",
    "html": "<div class=\"vf-row\"><span class=\"vf-badge\">Beta</span><span class=\"vf-badge vf-badge-success\">Publisert</span><span class=\"vf-badge vf-badge-warning\">Under arbeid</span></div>"
  },
  {
    "category": "Innhold",
    "id": "avatar",
    "title": "Avatar",
    "description": "Profilbilde eller initialer.",
    "html": "<div class=\"vf-row\"><span class=\"vf-avatar\" aria-label=\"Leander\">LV</span><span class=\"vf-avatar vf-avatar-blue\" aria-label=\"Sofie\">SA</span><span class=\"vf-avatar vf-avatar-purple\" aria-label=\"Alex\">AK</span></div>"
  },
  {
    "category": "Innhold",
    "id": "stat",
    "title": "Statistikkort",
    "description": "Fremhev et viktig tall.",
    "html": "<article class=\"vf-stat\"><span>Aktive prosjekter</span><strong>28</strong><small>↗ +12 % denne måneden</small></article>"
  },
  {
    "category": "Innhold",
    "id": "pricing",
    "title": "Priskort",
    "description": "Vis abonnementer og funksjoner.",
    "html": "<article class=\"vf-pricing\"><span class=\"vf-badge\">Mest populær</span><h3>Start</h3><p><strong>99 kr</strong> / måned</p><ul><li>Komponentbibliotek</li><li>Design tokens</li><li>Dokumentasjon</li></ul><button class=\"vf-button\">Velg plan</button></article>"
  },
  {
    "category": "Innhold",
    "id": "testimonial",
    "title": "Kundeuttalelse",
    "description": "Presentasjon av ekte kundeuttalelser.",
    "html": "<blockquote class=\"vf-testimonial\"><p>«Her kan du vise en godkjent kundeuttalelse.»</p><footer>— Eksempelperson, eksempelbedrift</footer></blockquote>"
  },
  {
    "category": "Innhold",
    "id": "profile",
    "title": "Profilkort",
    "description": "Vis person, rolle og handlinger.",
    "html": "<article class=\"vf-profile\"><span class=\"vf-avatar\">VD</span><div><h3>Designteam</h3><p>Vedoy Studio</p></div><button class=\"vf-button vf-button-outline\">Se profil</button></article>"
  },
  {
    "category": "Innhold",
    "id": "hero",
    "title": "Hero-seksjon",
    "description": "En tydelig introduksjon med CTA.",
    "html": "<header class=\"vf-hero\"><span class=\"vf-badge\">VEDOY FORMA</span><h2>Design uten friksjon.</h2><p>Ferdige byggesteiner for raske nettsider og webapper.</p><button class=\"vf-button\">Kom i gang ↗</button></header>"
  },
  {
    "category": "Tilbakemelding",
    "id": "alert",
    "title": "Varsel",
    "description": "Informasjon og feilmeldinger som er lette å forstå.",
    "html": "<div class=\"vf-alert\" role=\"status\"><strong>ℹ Viktig informasjon</strong><p>Husk å lagre før du går videre.</p></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "toast",
    "title": "Toast-varsel",
    "description": "Diskret tilbakemelding etter en handling.",
    "html": "<div class=\"vf-toast-demo\"><button class=\"vf-button\" data-vf-toast=\"Endringene er lagret!\">Vis bekreftelse</button><div class=\"vf-toast-region\" role=\"status\" aria-live=\"polite\"></div></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "progress",
    "title": "Fremdriftsindikator",
    "description": "Vis hvor mye som er fullført.",
    "html": "<div class=\"vf-progress-group\"><div class=\"vf-row vf-between\"><strong>Opplasting</strong><span>68 %</span></div><progress class=\"vf-progress\" value=\"68\" max=\"100\">68 %</progress></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "spinner",
    "title": "Lasteindikator",
    "description": "En animert indikator med redusert bevegelse.",
    "html": "<div class=\"vf-row\"><span class=\"vf-spinner\" aria-hidden=\"true\"></span><span role=\"status\">Laster inn …</span></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "skeleton",
    "title": "Skjelettvisning",
    "description": "Plassholder mens innhold laster.",
    "html": "<div class=\"vf-skeleton-card\" aria-label=\"Laster innhold\" role=\"status\"><span class=\"vf-skeleton vf-skeleton-heading\"></span><span class=\"vf-skeleton\"></span><span class=\"vf-skeleton vf-skeleton-short\"></span></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "tooltip",
    "title": "Verktøytips",
    "description": "Kort forklaring ved fokus eller pekebevegelse.",
    "html": "<div class=\"vf-tooltip\"><button type=\"button\" class=\"vf-icon-button\" aria-describedby=\"vf-tooltip-help\">?</button><span id=\"vf-tooltip-help\" role=\"tooltip\">Et lite hint til brukeren.</span></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "popover",
    "title": "Pop-over",
    "description": "Et lite panel med ekstra informasjon.",
    "html": "<details class=\"vf-popover\"><summary>Se detaljer</summary><div class=\"vf-popover-panel\"><strong>Detaljer</strong><p>Dette panelet åpnes og lukkes uten JavaScript.</p></div></details>"
  },
  {
    "category": "Tilbakemelding",
    "id": "modal",
    "title": "Dialogvindu",
    "description": "En tilgjengelig, fokushåndtert dialog.",
    "html": "<div><button class=\"vf-button\" type=\"button\" data-vf-dialog-open=\"vf-example-modal\">Åpne dialog</button><dialog class=\"vf-modal\" id=\"vf-example-modal\" aria-labelledby=\"vf-modal-title\"><h3 id=\"vf-modal-title\">Bekreft handling</h3><p>Vil du fortsette?</p><form method=\"dialog\" class=\"vf-row\"><button class=\"vf-button vf-button-outline\">Avbryt</button><button class=\"vf-button\">Bekreft</button></form></dialog></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "accordion",
    "title": "Trekkspill",
    "description": "Skjul og vis forklaringer.",
    "html": "<div class=\"vf-accordion\"><details><summary>Hva er Vedoy Forma?</summary><p>Et designsystem for stil, struktur og responsive komponenter.</p></details><details><summary>Kan jeg bruke det uten Forge?</summary><p>Ja, Forma skal også fungere selvstendig.</p></details></div>"
  },
  {
    "category": "Tilbakemelding",
    "id": "empty-state",
    "title": "Tom tilstand",
    "description": "Hjelp brukeren videre når ingen data finnes.",
    "html": "<section class=\"vf-empty-state\"><span aria-hidden=\"true\">◇</span><h3>Ingen prosjekter ennå</h3><p>Opprett et prosjekt for å komme i gang.</p><button class=\"vf-button\">Nytt prosjekt</button></section>"
  },
  {
    "category": "Media og data",
    "id": "gallery",
    "title": "Bildegalleri",
    "description": "Responsiv visning av bilder og medier.",
    "html": "<div class=\"vf-gallery\"><button type=\"button\" class=\"vf-gallery-tile vf-photo-a\" data-vf-lightbox aria-label=\"Vis bilde 1\">Natur</button><button type=\"button\" class=\"vf-gallery-tile vf-photo-b\" data-vf-lightbox aria-label=\"Vis bilde 2\">Arkitektur</button><button type=\"button\" class=\"vf-gallery-tile vf-photo-c\" data-vf-lightbox aria-label=\"Vis bilde 3\">Kunst</button></div>"
  },
  {
    "category": "Media og data",
    "id": "carousel",
    "title": "Karusell",
    "description": "Bla mellom flere innholdskort.",
    "html": "<div class=\"vf-carousel\"><div class=\"vf-row vf-between\"><strong>Utvalgte prosjekter</strong><div class=\"vf-row\"><button class=\"vf-icon-button\" type=\"button\" data-vf-carousel=\"-1\" aria-label=\"Forrige\">‹</button><button class=\"vf-icon-button\" type=\"button\" data-vf-carousel=\"1\" aria-label=\"Neste\">›</button></div></div><div class=\"vf-carousel-track\" tabindex=\"0\"><article>Prosjekt 01</article><article>Prosjekt 02</article><article>Prosjekt 03</article></div></div>"
  },
  {
    "category": "Media og data",
    "id": "table",
    "title": "Datatabell",
    "description": "Lesbar tabell som kan rulles på små skjermer.",
    "html": "<div class=\"vf-table-wrap\"><table class=\"vf-table\"><caption>Prosjektoversikt</caption><thead><tr><th scope=\"col\">Prosjekt</th><th scope=\"col\">Status</th><th scope=\"col\">Oppdatert</th></tr></thead><tbody><tr><td>Forma</td><td><span class=\"vf-badge\">Beta</span></td><td>I dag</td></tr><tr><td>Forge</td><td><span class=\"vf-badge vf-badge-warning\">Planlagt</span></td><td>Ny</td></tr></tbody></table></div>"
  },
  {
    "category": "Media og data",
    "id": "timeline",
    "title": "Tidslinje",
    "description": "Hendelser i kronologisk rekkefølge.",
    "html": "<ol class=\"vf-timeline\"><li><strong>Idé</strong><p>Prosjektet ble planlagt.</p></li><li><strong>Design</strong><p>Første komponenter ble tegnet.</p></li><li><strong>Beta</strong><p>Det neste utviklingstrinnet.</p></li></ol>"
  },
  {
    "category": "Media og data",
    "id": "calendar",
    "title": "Kalender",
    "description": "En enkel datovisning uten eksterne avhengigheter.",
    "html": "<div class=\"vf-calendar\"><strong>November 2026</strong><div class=\"vf-calendar-grid\"><b>Ma</b><b>Ti</b><b>On</b><b>To</b><b>Fr</b><b>Lø</b><b>Sø</b><span> </span><span> </span><span> </span><span> </span><span> </span><span> </span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span class=\"vf-today\">6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span></div></div>"
  }
];
export const formaCategories = ["Alle", "Navigasjon", "Skjemaer", "Innhold", "Tilbakemelding", "Media og data"] as const;
export const formaComponentCount = formaExamples.length;