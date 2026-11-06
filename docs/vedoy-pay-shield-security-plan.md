# Vedoy Pay + Vedoy Shield: sikkerhet for betalingskort

**Status 2026-11-06: design og lokal kodeprototype. Ingen kortlagring, kortbetaling, NFC eller ekte Coin-overforinger er aktivert. Ingen uavhengig revisjon er gjennomfort.**

## Valgt modell: sertifisert kortvault utenfor Vedoy

- Registrer kort gjennom Stripe Checkout, Payment Element eller SetupIntent, aldri via egen kortformular. Kortnummer, CVC/CVV, PIN og fulle EMV-/magnetstripedata ma aldri inn i Vedoys server, logger, database, feilmeldinger eller KI.
- Stripe oppbevarer betalingskortene. Vedoy kan lagre bare Stripe Customer-ID, PaymentMethod-ID og begrenset visningsmetadata (kortmerke, siste fire, utlop), etter samtykke og serversjekket identitet/tilgang.
- Stripe er PCI DSS Level 1 Service Provider med arlig QSA-gjennomgang. Dette gjor ikke Vedoy automatisk PCI-kompatibelt. Skaff gjeldende AoC, Shared Responsibility Matrix og riktig SAQ/scoping for Vedoys integrasjon.
- CVC/CVV kan ikke lagres etter autorisasjon, selv kryptert, selv med samtykke.

## Fem sikkerhetsbarrierer

1. Tokenisering og dataminimering: kortdata kun hos PCI-godkjent leverandor.
2. Identitet: Vedoy OAuth, fornyet autentisering ved risikable operasjoner, MFA/passkeys, tilgang til korrekt kunde og tenant.
3. Databeskyttelse: TLS, serverhemmeligheter, secret manager/KMS, test/live-adskillelse, loggsladding, backuper og sletting.
4. Transaksjonsintegritet: serverberegnet pris, verifisert Stripe-webhook, idempotens, atomiske Coin-debet/kredit, rate limits og avstemming.
5. Uavhengig test: QSA-scoping, eksterne penetrasjonstester, separat kryptografivurdering og retest av lukkinger.

Dette er fem barrierer, **ikke dokumentasjon pa at sikkerheten er fem ganger hoyere**.

## Planlagt brukerflyt

- Lagre kort: innlogget bruker -> backend SetupIntent -> Stripe-hostet registrering -> verifisert betalingsmetode -> Vedoy lagrer kun tillatt metadata.
- Betale: backend beregner NOK-belop -> Stripe Checkout/PaymentIntent -> SCA -> kun gyldig, signert webhook kan markere ordre betalt.
- NFC i kasse: sertifisert Stripe Terminal/Tap to Pay for kompatibel norsk enhet. Ikke egen kortlesning i Vedoy-kode. Test kassekrav, kvitteringer, refusjon og avbrudd.
- Coins: ingen ekte betaling eller overforing for regulering, saldo, revisor og oppgjor er klart. Egen sentral poengbok med atomiske transaksjoner, anti-replay og idempotens.
- Sent: brukers identitet verifiseres pa server, mottaker er verifisert, sender kan ikke sette egen saldo. Debet og kredit ma skje atomisk, med sporbar logg.

## Meldingskryptering holdes atskilt fra betalingskort

Ikke stable Signal Protocol og tre krypteringsalgoritmer rundt kortnummer. For Sent ma en produksjonsklar, gjennomgatt E2EE-protokoll velges og revideres. Vedoy Shield kan utforske separat kryptering av felter, men nokkeldistribusjon, enhetsbytte, utlop, tilbakekalling og flerbrukergrupper ma auditeres. Testprototypen med AES-256-GCM og HKDF-SHA256 er **ikke** klar for produksjon. Full tilgangsseparasjon krever at uavhengige segmentnokler faktisk holdes adskilt.

## Uavhengige revisorer og bestillingskrav

| Del | Aktor | Forventet bevis |
| --- | --- | --- |
| Kortlagring | Stripe, arlig eksternt QSA-vurdert | AoC, ansvarsdeling, leverandorvilkar |
| Vedoys PCI-scope | Uavhengig PCI SSC-listet QSA | PCI-scope, SAQ/ROC-vurdering, tiltak |
| API, OAuth, POS, Sent | NCC Group eller annen kvalifisert ekstern tester | OWASP ASVS 5.0, manuell pentest, retest |
| Egne kryptoprotokoller | Uavhengig kryptograf | Trusselmodell, nokkel-/nonce-/ratchet-evaluering |
| Lovverk | Kompetent norsk jurist | Finansregulatorisk vurdering av kjopte/overforbare Coins |

**Ingen aktor er bestilt eller har godkjent Vedoy Pay.** Testere ma bare bruke uttrykkelig godkjent omfang og syntetiske betalingsdata. Alle kritiske/hoye funn ma lukkes og retestes for live.

## Reglene for overforbare Coins

Finanstilsynet beskriver at e-penger kan oppsta der pengeverdi utstedes etter mottak av midler og brukes hos andre enn utsteder. Kjopte, overforbare Coins som kan brukes hos andre virksomheter krever juridisk avklaring for betalings-/e-pengetjenester, herunder mulige unntak. Slike funksjoner holdes av til lovgrunnlag og revisor er klart.

## GitHub-filer og avgrensning

- lib/vedoy-shield-pay.mjs: validerer referanser og avviser raa kortdetaljer, flagg for kritiske funksjoner satt til NOT ENABLED.
- lib/vedoy-shield-segments.mjs: lokal kryptoprototype, ikke ferdig Signal/E2EE.
- tests/vedoy-shield-pay.test.mjs og tests/vedoy-shield-segments.test.mjs: lokale regresjonstester.
- CI kjores pa egen PR, ikke direkte produksjon. Ingen endring av Stripe-konto, prod-DB eller Sent.

## Kilder

- Stripe PCI Level 1: https://support.stripe.com/questions/what-is-pci-compliance?locale=en-GB
- Stripe saved cards: https://support.stripe.com/questions/prefilling-saved-cards-in-checkout
- PCI forbud mot CVC-lagring: https://www.pcisecuritystandards.org/faqs/1280/
- PCI QSA directory: https://www.pcisecuritystandards.org/assessors_and_solutions/qualified_security_assessors/
- Stripe Terminal Norway: https://docs.stripe.com/terminal/payments/regional?integration-country=NO
- OWASP ASVS: https://asvs.owasp.org/
- NCC Group: https://www.nccgroup.com/penetration-testing-services/
- Finanstilsynet e-money: https://www.finanstilsynet.no/tillatelser/e-pengeforetak/
- Signal libsignal: https://github.com/signalapp/libsignal
