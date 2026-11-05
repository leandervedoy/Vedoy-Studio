# Vedoy Advertize – første kommersielle byggestein

Status: **MVP under gjennomgang. Ikke fakturerbar annonsetjeneste.**

## Hva som finnes

- Supabase-tabeller: `advertize_sites`, `advertize_slots`, `advertize_campaigns`, `advertize_daily_metrics`, `advertize_delivery_dedupe` og `statistics_voluntary_daily`.
- Eier-only administrasjon: `/studio/advertize`. Krever gyldig `vedoy_owner`-sesjon.
- Annonselevering: `GET /api/advertize/frame?slot=studio-home` eller `slot=sent-sidebar`.
- Signert klikk-redirect: `GET /api/advertize/click?t=<token>`; ikke en åpen redirect.
- Frivillig, aggregert Statistics: `POST /api/advertize/voluntary`, eksplisitt `consent: true`.
- Studio-forsiden har husannonse + frivillig statistikkprompt. Sent-integrasjonen ligger i separat PR.
- To aktive husannonser er lagt inn i databasen.

## Forutsetninger før publisering

- Vercel produksjon må ha `VEDOY_SUPABASE_SECRET_KEY`, `VEDOY_SUPABASE_URL` og `SESSION_SECRET` (minst 32 tegn), konfigurert gjennom Vercel settings. **Aldri legg verdier i kode.**
- Preview trenger **separat** godkjent nøkkel for en isolert testdatabase. Ikke kopier produksjonens hemmeligheter til uverifiserte pull requests.
- Kontroller `frame-ancestors` og `advertize_sites.allowed_origins` for eksakte domenenavn. Kun godkjente Vedoy-domener kan vise iframe.
- Ved behov for andre nettsider: registrer ny side, opprinnelsesadresse og annonseplass; bygg et eget integrasjonspunkt på den nettsiden.

## Eksempel – en Vedoy-side

```html
<iframe
  title="Vedoy Advertize – annonse"
  src="https://www.vedoystudio.no/api/advertize/frame?slot=studio-home"
  sandbox="allow-popups allow-popups-to-escape-sandbox"
  referrerpolicy="no-referrer"
  loading="lazy"
  style="border:0;width:100%;height:168px">
</iframe>
```

Annonser merkes tydelig og bruker ingen samtaleinformasjon, profil-ID eller individuell målretting.

## Statistikk og begrensninger

- Tallet **annonseforespørsler** er antall leverte annonse-HTML-svar, *ikke* verifiserte synlige visninger eller faktureringsgrunnlag.
- Klikk har en signert token og idempotent registrering per utlevering, men er **ikke svindelfiltrert**.
- Frivillig besøksteller samler kun per dag, site og en forhåndsgodkjent sidetype. Ingen individ-ID, meldingsinnhold eller besøkssti lagres i tabellen.
- HTTP-forespørsler kan fremdeles behandles av hostingplattformen og dens logger; påstander om fullstendig anonymitet må derfor unngås.
- En klient kan forfalske `consent:true` og gjenta kall. Dette er *ikke* en teknisk eller juridisk sikker samtykkedokumentasjon; alle statistiske totalsummer er veiledende.
- Samtykke som er nødvendig for andre sporingsmetoder må innhentes separat. Ingen slik sporing aktiveres i MVP.
- Dedupe-tabellen må ha en vedlikeholdt retensjonspolicy før høy trafikk; hendelser bør slettes etter kort tid når de ikke lenger trengs.
- Før eksterne annonsører: avtalemaler, reklamekontroll, betaling, rate limiting, viewability, bedrageribeskyttelse, refusjoner og personverndokumentasjon.

## Relevante sjekker

```sh
npm ci --ignore-scripts
npm run typecheck
npm run build
```

GitHub Actions `Verify Vedoy Advertize MVP` kjører disse kontrollene automatisk.
