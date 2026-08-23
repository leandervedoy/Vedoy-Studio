import type {
  BookingConfiguration,
  BookingPlan,
  BookingService,
  BookingStaff,
  ScheduleData
} from "@vedoy/booking";
import { defaultSchedule } from "@vedoy/booking";

export const bookingServices: BookingService[] = [
  {
    id: "remote-it",
    name: "Digital IT-hjelp",
    description: "Rolig hjelp via telefon eller sikker skjermdeling.",
    category: "IT-hjelp",
    durationMinutes: 60,
    bufferAfterMinutes: 10,
    price: 350,
    currency: "NOK",
    color: "#2563eb",
    active: true,
    location: "remote"
  },
  {
    id: "home-visit",
    name: "Hjemmebesøk",
    description: "PC, TV, Wi-Fi, printer eller mobil hjemme hos kunden.",
    category: "IT-hjelp",
    durationMinutes: 90,
    bufferBeforeMinutes: 15,
    bufferAfterMinutes: 20,
    price: 599,
    currency: "NOK",
    color: "#16a34a",
    active: true,
    location: "customer"
  },
  {
    id: "business-check",
    name: "Digital bedriftssjekk",
    description: "Gjennomgang av nettside, e-post, sikkerhet, rutiner og muligheter.",
    category: "Bedrift",
    durationMinutes: 120,
    bufferAfterMinutes: 20,
    price: 1190,
    currency: "NOK",
    color: "#7c3aed",
    active: true,
    location: "remote"
  },
  {
    id: "website-session",
    name: "Nettside og vekst",
    description: "En praktisk workshop for budskap, struktur, SEO og neste steg.",
    category: "Vekst",
    durationMinutes: 90,
    bufferAfterMinutes: 15,
    price: 890,
    currency: "NOK",
    color: "#ea580c",
    active: true,
    location: "remote"
  }
];

export const bookingPlans: BookingPlan[] = [
  {
    id: "single",
    name: "Enkeltime",
    description: "Betal bare for timen du bestiller.",
    price: 350,
    currency: "NOK",
    billing: "one-time",
    color: "#475569",
    active: true
  },
  {
    id: "trygg",
    name: "Trygg",
    description: "Én inkludert time hver måned.",
    price: 299,
    currency: "NOK",
    billing: "monthly",
    includedMinutes: 60,
    color: "#0891b2",
    active: true
  },
  {
    id: "growth",
    name: "Growth",
    description: "To timer, rapport og lavere pris på ekstra hjelp.",
    price: 699,
    currency: "NOK",
    billing: "monthly",
    includedMinutes: 120,
    discountPercent: 10,
    color: "#7c3aed",
    active: true,
    popular: true,
    features: ["Prioritert svartid", "Månedsrapport", "Små forbedringer"]
  }
];

export const bookingStaff: BookingStaff[] = [
  {
    id: "leander",
    name: "Eiolf-Leander",
    description: "IT-hjelp, nettsider og digital oppfølging",
    color: "#171714",
    active: true
  },
  {
    id: "first-available",
    name: "Første ledige",
    description: "Studio velger riktig ressurs",
    color: "#dfb934",
    active: true
  }
];

export const bookingSchedule: ScheduleData = {
  ...defaultSchedule,
  weeklyHours: {
    1: [{ start: "10:00", end: "16:00" }],
    2: [{ start: "10:00", end: "16:00" }],
    3: [{ start: "10:00", end: "16:00" }],
    4: [{ start: "10:00", end: "18:00" }],
    5: [{ start: "10:00", end: "15:00" }]
  }
};

export const bookingConfiguration: BookingConfiguration = {
  locale: "nb-NO",
  timeZone: "Europe/Oslo",
  currency: "NOK",
  slotIntervalMinutes: 30,
  minNoticeMinutes: 120,
  bookingWindowDays: 120,
  animations: true,
  showPlans: true,
  showStaff: true,
  showCategories: true,
  locations: [
    { id: "remote", name: "Digitalt møte", description: "Telefon eller sikker skjermdeling." },
    { id: "haugesund", name: "Vedøy · Haugesund", description: "Møte etter avtale." },
    { id: "customer", name: "Hos kunden", description: "Hjemmebesøk eller bedriftsbesøk." }
  ],
  requirePhone: false,
  autoConfirm: false,
  layout: "full",
  theme: {
    accent: "#171714",
    accentContrast: "#ffffff",
    surface: "#f8f7f2",
    surfaceElevated: "#ffffff",
    text: "#171714",
    muted: "#6f6e66",
    border: "#dedbd0",
    radius: "22px",
    shadow: "0 24px 60px rgba(26, 24, 18, .10)"
  },
  labels: {
    title: "Bestill en rolig start",
    subtitle: "Velg tjeneste, dato og tidspunkt. Du får en tydelig bekreftelse før timen.",
    bookingSuccess: "Takk! Forespørselen er mottatt og venter på bekreftelse."
  },
  customFields: [
    {
      id: "goal",
      label: "Hva ønsker du å få til?",
      type: "textarea",
      placeholder: "Beskriv kort hva du trenger hjelp med."
    },
    {
      id: "consent",
      label: "Vedøy kan kontakte meg om denne bestillingen",
      type: "checkbox",
      required: true
    }
  ]
};
