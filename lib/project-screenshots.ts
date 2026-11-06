export type StudioScreenshot = {
  src: string;
  alt: string;
  project: string;
  caption: string;
  status: "Demo" | "Prototype" | "Beta";
  href?: string;
};

export const STUDIO_SCREENSHOTS = {
  bank: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/vedoy-studio-bank-demo-nov-2026.jpg?v=1793925866",
    alt: "Mobilvisning av Vedoy Bank-konseptet med flervaluta, kort og simulerte kontoer.",
    project: "Vedoy Bank",
    caption: "Finansapp-konsept med fiktive kontoer. Ingen banktjenester er operative.",
    status: "Demo",
    href: "https://vedoy-bank.vercel.app/"
  },
  collective: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-collective-arcade-nov-2026.jpg?v=1793926247",
    alt: "Mobilskjerm fra Vedoy Collective med spillbibliotek og Vedoy Coins.",
    project: "Vedoy Collective",
    caption: "Spillbiblioteket i Collective-appen, med spill og Vedoy Coins.",
    status: "Beta",
    href: "/projects/collective"
  },
  hosting: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-hosting-dashboard-nov-2026.jpg?v=1793926242",
    alt: "Vedoy Hosting-kontrollpanel i demomodus, med servervalg og oversikt.",
    project: "Vedoy Hosting",
    caption: "Kontrollpanel i demomodus. Serverprovisjonering er ikke aktivert.",
    status: "Demo",
    href: "/tjenester/hosting-og-domene"
  },
  booking: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-booking-calendar-nov-2026.jpg?v=1793926253",
    alt: "Mobiltilpasset kalender for Vedoy Booking med datoer og ledige tidspunkter.",
    project: "Vedoy Booking",
    caption: "Mobiltilpasset tidsbestilling med dato- og tidspunktvelger.",
    status: "Beta",
    href: "/booking"
  },
  artist: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-artist-demo-nov-2026.jpg?v=1793926258",
    alt: "Vedoy Studio musikkdemo med valgfrie moduler for nettbutikk, levering, design og hosting.",
    project: "Vedoy Studio / Musikk",
    caption: "Bransjedemo med valgfrie tillegg, blant annet nettbutikk og design.",
    status: "Demo",
    href: "/yrker"
  },
  deliver: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-deliver-home-nov-2026.jpg?v=1793926225",
    alt: "Vedoy Deliver-pilotens mobilside for å bli bud på Haugalandet.",
    project: "Vedoy Deliver",
    caption: "Mobilgrensesnitt for en planlagt lokal budtjeneste. Pilot, ikke operativ tjeneste.",
    status: "Prototype",
    href: "https://vedoy-deliver.vercel.app/"
  },
  deliverJobs: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-deliver-jobs-nov-2026.jpg?v=1793926230",
    alt: "Eksempler på fiktive leveringsoppdrag i Vedoy Deliver med rute og godtgjørelse.",
    project: "Vedoy Deliver / Oppdrag",
    caption: "Fiktive oppdrag med illustrerte satser; ingen ekte bestillinger.",
    status: "Prototype",
    href: "https://vedoy-deliver.vercel.app/"
  },
  deliverEarnings: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-deliver-earnings-nov-2026.jpg?v=1793926236",
    alt: "Vedoy Deliver-kalkulator for foreslått lønn og Vedoy Coins.",
    project: "Vedoy Deliver / Opptjening",
    caption: "Eksempelberegner for mulig lønn og poeng, ikke registrert opptjening.",
    status: "Prototype",
    href: "https://vedoy-deliver.vercel.app/"
  },
  deliverSteps: {
    src: "https://cdn.shopify.com/s/files/1/0659/3524/5371/files/studio-project-deliver-steps-nov-2026.jpg?v=1793926262",
    alt: "Tre steg i Vedoy Deliver-piloten: søk, bli godkjent og ta leveringsoppdrag.",
    project: "Vedoy Deliver / Prosess",
    caption: "Søknad, kontroll og oppdrag forklart i tre trinn.",
    status: "Prototype",
    href: "https://vedoy-deliver.vercel.app/"
  }
} as const satisfies Record<string, StudioScreenshot>;

export const FEATURED_STUDIO_SCREENSHOTS: readonly StudioScreenshot[] = [
  STUDIO_SCREENSHOTS.bank,
  STUDIO_SCREENSHOTS.collective,
  STUDIO_SCREENSHOTS.booking,
  STUDIO_SCREENSHOTS.hosting,
  STUDIO_SCREENSHOTS.deliver,
  STUDIO_SCREENSHOTS.artist
];

export const DELIVER_SCREENSHOTS: readonly StudioScreenshot[] = [
  STUDIO_SCREENSHOTS.deliver,
  STUDIO_SCREENSHOTS.deliverJobs,
  STUDIO_SCREENSHOTS.deliverEarnings,
  STUDIO_SCREENSHOTS.deliverSteps
];
