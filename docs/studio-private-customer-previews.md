# Private kundepreviews på Vedoy Studio (beta)

## Hensikt
`https://vedoystudio.no/studio` forblir **kundeportalen**. Alle autentiserte kunder kan åpne
`/studio/previews`, men innhold vises bare dersom en Vedoy-administrator har gitt
eksplisitt tilgang til det enkelte utkastet.

En privat preview er tilgjengelig på `/studio/previews/[pageId]`. Public slug
`/[slug]` forblir utilgjengelig frem til publisering, og det eksisterende
admin-preview `/[slug]?preview=1` får ikke utvidede kundetilganger.

## Før testing
1. Kjør først eksisterende migrering `npm run db:migrate:page-builder`.
2. Kjør `npm run db:migrate:page-preview-access` i riktig, godkjent miljø.
3. Kjør `node --test tests/studio-preview-policy.test.mjs`.
4. Kjør repoets `npm run typecheck` og `npm run build`.
5. En intern admin oppretter utkast gjennom `/admin/builder`, velger kunden
   i delingsfeltet «Del privat utkast med kunde», og klikker «Gi tilgang».
6. Kunden logger inn med **samme e-postadresse** og åpner `/studio/previews`.
7. Verifiser at andre kundekontoer får 404 ved direkte URL. Verifiser at
   en publisert side forsvinner fra listen, og at tilbakekalt/utløpt tilgang opphører.
8. Verifiser faktisk mobilvisning, navigasjon og knapper i browser, og at
   production deploy fortsatt ikke har gjort kladdene offentlige.

## Rettigheter og sikkerhet
- Kunder trenger gyldig Vedoy Studio-sesjon og en aktiv, eksplisitt grant.
- Granten knyttes til side-ID + normalisert e-postadresse, ikke en offentlig URL-token.
- Vedoy-owner krever reservert signert rolle og e-post. Vanlige adminbrukere
  må i tillegg til sesjonsrollen finnes som admin/owner i interne teammedlemmer.
- Kun intern admin kan gi og trekke tilbake preview-grants.
- Grants utløper automatisk innen 1–30 dager; behold eller slett metadata iht.
  personvernerklæring og lagringspolitikk.
- Dersom database eller grant-tabellen mangler, **nektes tilgang**.
- Preview-oversikten og selve previewen ligger under autentisert Studio-layout.
- Drafts renderes med den samme PageRenderer som publiserte sider, men uten
  redigeringsrettigheter. Innhold skal likevel ikke omfatte hemmeligheter.
- `noindex` er en ekstra beskyttelse, ikke en erstatning for innlogging.
- Denne førsteversjonen gjenbruker eksisterende `org_vedoy` page builder.
  Ekte multi-tenant kundeprosjekter trenger separat `organizationId`/prosjekteierskap
  i databasen, samt objektbaserte roller i stedet for bare e-postgrants.

## Avgrensninger
- Fungerende kunde-preview krever database-migrering, GitHub-merge og godkjent Vercel-deploy.
- Dette er **ikke** ennå en generell Vercel preview av upubliserte GitHub-branches,
  kun sider som er opprettet i Vedoy Studio Page Builder.
- Kunden kan teste responsive sider og lenker, men får ikke skrive-/publiseringstilgang.
- Ingen faktiske kundegrants, kundeprofiler eller produksjonsdatabaser er endret.
