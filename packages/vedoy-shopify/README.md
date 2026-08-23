# Vedøy Shopify

En separat Shopify-integrasjonskjerne for første Vedøy Growth-pilot. Den er **ikke** en offentlig Shopify App Store-app ennå, og den kobler ikke til noen butikk uten at server-variablene er lagt inn.

## Hva som finnes nå

- En ærlig pilotstatus på forsiden og `GET /api/health`; hemmeligheter vises aldri.
- Én HMAC-verifisert webhook-inngang for `orders/create`, `products/update` og `customers/create`.
- Minimert videresending til Vedøy Growth. Ingen adresse- eller betalingsdata sendes videre.
- Ved feil mot Growth returneres `503`, slik at Shopify kan forsøke levering på nytt i stedet for at en ordre forsvinner stille.

## Lokal kjøring

Fra Studio-roten:

```powershell
Copy-Item packages/vedoy-shopify/.env.example packages/vedoy-shopify/.env.local
npm.cmd run dev:shopify
```

Åpne `http://localhost:3101`. Bygg med `npm.cmd run build:shopify`.

## Konfigurasjon for pilot

Legg variablene fra `.env.example` inn i Vercel-prosjektet for **denne** appen. Ikke legg Shopify-tokenet i Studio, Growth-klienten eller Git.

| Variabel | Formål |
| --- | --- |
| `SHOPIFY_API_SECRET` | Hemmelighet for å validere webhook-signaturer |
| `VEDOY_GROWTH_WEBHOOK_URL` | Growth-endepunkt som mottar normaliserte hendelser |
| `VEDOY_GROWTH_WEBHOOK_TOKEN` | Langt tilfeldig bearer-token som Growth også validerer |

Growth-mottakeren må lagre `deliveryId` og avvise duplikater. Det gir trygghet når Shopify prøver samme webhook på nytt.

Growth-mottaket ligger på `/api/integrations/shopify/webhook`. Produksjonsdatabasen må ha tabellen `shopify_sync_events` før en virkelig butikk aktiveres.

## Før kunden kobles til

1. Opprett en Shopify-app for pilotkunden gjennom Shopify CLI / Dev Dashboard.
2. Be kun om scopes som piloten trenger, og oppdater `shopify.app.toml` med riktig offentlig URL.
3. Pek webhookene til `/api/webhooks/shopify` og test HMAC, en produktendring og en testordre.
4. Verifiser i Growth at samme `deliveryId` ikke registreres to ganger før dere går live.

Når piloten er validert kan dere lage en full embedded Shopify-app med OAuth og App Bridge. Ikke gjør den offentlig i App Store før installasjon, support og personvernflyt er testet hos minst én reell kunde.
