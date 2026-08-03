# @vedoy/booking

Tilpassbar bookingkalender for React og Next.js.

## Installer

Etter publisering:

```bash
npm install @vedoy/booking
```

Før publisering kan pakken testes som `.tgz`:

```bash
npm install C:\sti\til\vedoy-booking-2.0.0.tgz
```

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
