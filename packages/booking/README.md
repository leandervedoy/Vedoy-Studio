# @vedoy/booking

Tilpassbar bookingkalender for React og Next.js.

Pakken er utviklet av Vedøy og kan brukes som en modul i egne prosjekter. Den leverer UI-komponenter og kalenderlogikk, mens bedriftens data og lagring kobles til gjennom adaptere.

## Installer

Etter publisering:

```bash
npm install @vedoy/booking
```

Pakken er foreløpig under lokal klargjøring og er ikke publisert til npm ennå.

Før publisering kan pakken testes som en lokal `.tgz`-fil:

```bash
npm install C:\sti\til\vedoy-booking-2.0.0.tgz
```

Fra repository-roten kan du lage pakken slik:

```bash
npm run build --workspace=@vedoy/booking
npm pack --workspace=@vedoy/booking
```

Dette lager en installerbar tarball utenfor `dist`-mappen.

Importer CSS én gang:

```tsx
import "@vedoy/booking/styles.css";
```

## Viktigste komponenter

- `BookingCalendar` – kundens bookingflyt
- `BookingAdminCalendar` – Outlook-lignende bestillingskalender
- `ScheduleCalendarEditor` – klikk datoer og endre åpningstider
- `BookingCatalogManager` – legg til og rediger tjenester og planer
- `MonthCalendar` – ren kalendervisning for egne løsninger

## Data og tilpasning

Pakken inneholder standardverdier, kalenderlogikk, konfliktsjekk, animasjoner og UI. Bedriftens faktiske data sendes inn som props eller hentes fra API/database:

```tsx
<BookingCalendar
  services={services}
  plans={plans}
  staff={staff}
  adapter={bookingAdapter}
  schedule={schedule}
  configuration={{
    timeZone: "Europe/Oslo",
    slotIntervalMinutes: 30,
    theme: { accent: "#2563eb" }
  }}
/>
```

For produksjon bør `BookingAdapter` og `ScheduleAdapter` implementeres på serveren med transaksjoner og unik konfliktkontroll i databasen.

## Status

- Lokal pakke: klar for testing
- React/Next.js: støttet
- npm-publisering: ikke utført
- Betaling og eksterne kalendere: må kobles av konsumerende prosjekt
