import type {
  AcademyCourse,
  StudioActivity,
  StudioApiKey,
  StudioBooking,
  StudioCustomer,
  StudioDomain,
  StudioOverview,
  StudioProject,
  StudioTicket
} from "@/lib/types";

const now = new Date();
const isoAfter = (days: number, hour = 10) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const demoProjects: StudioProject[] = [
  {
    id: "prj_studio",
    organizationId: "org_vedoy",
    name: "Vedøy Studio",
    slug: "vedoy-studio",
    framework: "Next.js",
    status: "healthy",
    productionUrl: "studio.vedoy.com",
    region: "Frankfurt",
    lastDeployAt: isoAfter(-1, 21),
    monthlyRequests: 18420,
    createdAt: isoAfter(-62)
  },
  {
    id: "prj_collective",
    organizationId: "org_vedoy",
    name: "Vedøy Collective",
    slug: "vedoy-collective",
    framework: "Shopify",
    status: "healthy",
    productionUrl: "vedoycollective.no",
    region: "Global CDN",
    lastDeployAt: isoAfter(-4, 14),
    monthlyRequests: 9320,
    createdAt: isoAfter(-180)
  },
  {
    id: "prj_assist",
    organizationId: "org_vedoy",
    name: "Vedøy Assist",
    slug: "vedoy-assist",
    framework: "Next.js",
    status: "building",
    productionUrl: "assist.vedoy.com",
    region: "Frankfurt",
    lastDeployAt: isoAfter(-2, 18),
    monthlyRequests: 4210,
    createdAt: isoAfter(-35)
  }
];

export const demoDomains: StudioDomain[] = [
  {
    id: "dom_vedoy",
    organizationId: "org_vedoy",
    name: "vedoy.com",
    status: "active",
    autoRenew: true,
    expiresAt: isoAfter(280),
    projectId: "prj_studio",
    dnsProvider: "Vedøy DNS"
  },
  {
    id: "dom_collective",
    organizationId: "org_vedoy",
    name: "vedoycollective.no",
    status: "active",
    autoRenew: true,
    expiresAt: isoAfter(194),
    projectId: "prj_collective",
    dnsProvider: "Cloudflare"
  },
  {
    id: "dom_assist",
    organizationId: "org_vedoy",
    name: "vedoyassist.no",
    status: "pending",
    autoRenew: true,
    expiresAt: isoAfter(365),
    projectId: "prj_assist",
    dnsProvider: "Vedøy DNS"
  }
];

export const demoBookings: StudioBooking[] = [
  {
    id: "bk_1001",
    organizationId: "org_vedoy",
    serviceId: "remote-it",
    serviceName: "Digital IT-hjelp",
    startsAt: isoAfter(1, 10),
    endsAt: isoAfter(1, 11),
    customerName: "Ingrid Solheim",
    customerEmail: "ingrid@example.no",
    customerPhone: "+47 900 00 001",
    notes: "Trenger hjelp med e-post på ny PC.",
    status: "confirmed",
    createdAt: isoAfter(-2)
  },
  {
    id: "bk_1002",
    organizationId: "org_vedoy",
    serviceId: "business-check",
    serviceName: "Digital bedriftssjekk",
    startsAt: isoAfter(2, 13),
    endsAt: isoAfter(2, 15),
    customerName: "Nordlys Kafé AS",
    customerEmail: "hei@nordlyskafe.no",
    notes: "Gjennomgang av nettside, booking og e-post.",
    status: "pending",
    createdAt: isoAfter(-1)
  },
  {
    id: "bk_1003",
    organizationId: "org_vedoy",
    serviceId: "home-visit",
    serviceName: "Hjemmebesøk",
    startsAt: isoAfter(4, 12),
    endsAt: isoAfter(4, 13),
    customerName: "Arne Vik",
    customerEmail: "arne@example.no",
    customerPhone: "+47 900 00 002",
    notes: "TV og Wi-Fi.",
    status: "confirmed",
    createdAt: isoAfter(-3)
  }
];

export const demoCustomers: StudioCustomer[] = [
  {
    id: "cus_1",
    organizationId: "org_vedoy",
    name: "Nordlys Kafé AS",
    email: "hei@nordlyskafe.no",
    phone: "+47 400 00 100",
    company: "Nordlys Kafé AS",
    valueNok: 6890,
    lastActivityAt: isoAfter(-1),
    tags: ["Bedrift", "Growth"]
  },
  {
    id: "cus_2",
    organizationId: "org_vedoy",
    name: "Ingrid Solheim",
    email: "ingrid@example.no",
    phone: "+47 900 00 001",
    valueNok: 1298,
    lastActivityAt: isoAfter(-2),
    tags: ["Privat", "Trygg"]
  },
  {
    id: "cus_3",
    organizationId: "org_vedoy",
    name: "Kystform Studio",
    email: "post@kystform.no",
    company: "Kystform Studio",
    valueNok: 11980,
    lastActivityAt: isoAfter(-4),
    tags: ["Bedrift", "Nettside", "Hosting"]
  },
  {
    id: "cus_4",
    organizationId: "org_vedoy",
    name: "Arne Vik",
    email: "arne@example.no",
    phone: "+47 900 00 002",
    valueNok: 998,
    lastActivityAt: isoAfter(-5),
    tags: ["Privat", "Hjemmebesøk"]
  }
];

export const demoApiKeys: StudioApiKey[] = [
  {
    id: "key_1",
    organizationId: "org_vedoy",
    name: "Produksjon",
    prefix: "vdy_live_3P7X",
    createdAt: isoAfter(-28),
    lastUsedAt: isoAfter(0, 1),
    scopes: ["booking:read", "booking:write", "analytics:read"]
  },
  {
    id: "key_2",
    organizationId: "org_vedoy",
    name: "Lokal utvikling",
    prefix: "vdy_test_9K2M",
    createdAt: isoAfter(-14),
    lastUsedAt: isoAfter(-1),
    scopes: ["booking:read"]
  }
];

export const demoTickets: StudioTicket[] = [
  {
    id: "ticket_1",
    organizationId: "org_vedoy",
    subject: "Koble domenet til ny nettside",
    message: "Ønsker hjelp med DNS og publisering.",
    priority: "normal",
    status: "in-progress",
    createdAt: isoAfter(-1)
  },
  {
    id: "ticket_2",
    organizationId: "org_vedoy",
    subject: "Oppsett av bedriftse-post",
    message: "Trenger tre adresser og hjelp på mobil.",
    priority: "high",
    status: "open",
    createdAt: isoAfter(-2)
  }
];

export const demoActivities: StudioActivity[] = [
  {
    id: "act_1",
    organizationId: "org_vedoy",
    type: "deployment",
    title: "Ny versjon publisert",
    detail: "Vedøy Studio ble deployet uten feil.",
    createdAt: isoAfter(0, 0)
  },
  {
    id: "act_2",
    organizationId: "org_vedoy",
    type: "booking",
    title: "Ny booking",
    detail: "Nordlys Kafé bestilte en digital bedriftssjekk.",
    createdAt: isoAfter(-1, 18)
  },
  {
    id: "act_3",
    organizationId: "org_vedoy",
    type: "domain",
    title: "Domene koblet til",
    detail: "vedoyassist.no venter på DNS-verifisering.",
    createdAt: isoAfter(-2, 16)
  },
  {
    id: "act_4",
    organizationId: "org_vedoy",
    type: "monitor",
    title: "Alle tjenester er friske",
    detail: "Siste sjekk fullført på 428 ms.",
    createdAt: isoAfter(-3, 12)
  }
];

export const academyCourses: AcademyCourse[] = [
  {
    id: "course_website",
    title: "Nettsiden som faktisk selger",
    description: "Bygg en tydelig forside med riktig struktur, budskap og handling.",
    level: "Nybegynner",
    minutes: 18,
    progress: 64,
    category: "Nettside"
  },
  {
    id: "course_security",
    title: "Trygg digital hverdag",
    description: "Passord, tofaktor, backup og rutiner forklart uten teknisk tåkeprat.",
    level: "Nybegynner",
    minutes: 14,
    progress: 32,
    category: "Sikkerhet"
  },
  {
    id: "course_analytics",
    title: "Forstå tallene dine",
    description: "Finn ut hva som fungerer og hva du bør gjøre mer av.",
    level: "Viderekommen",
    minutes: 22,
    progress: 8,
    category: "Analyse"
  },
  {
    id: "course_ai",
    title: "KI som praktisk kollega",
    description: "Bruk KI til tekster, oppsummeringer og idéarbeid på en ansvarlig måte.",
    level: "Nybegynner",
    minutes: 16,
    progress: 0,
    category: "KI"
  }
];

export const trafficPoints = [
  { label: "Man", value: 42 },
  { label: "Tir", value: 61 },
  { label: "Ons", value: 54 },
  { label: "Tor", value: 86 },
  { label: "Fre", value: 72 },
  { label: "Lør", value: 93 },
  { label: "Søn", value: 78 }
];

export const demoOverview: StudioOverview = {
  organization: {
    id: "org_vedoy",
    name: "Vedøy",
    plan: "Studio Growth",
    location: "Haugesund"
  },
  stats: {
    domains: demoDomains.length,
    projects: demoProjects.length,
    bookingsThisMonth: 12,
    customers: demoCustomers.length,
    uptime: 99.98,
    monthlyRequests: demoProjects.reduce((total, project) => total + project.monthlyRequests, 0)
  },
  traffic: trafficPoints,
  activities: demoActivities,
  projects: demoProjects,
  bookings: demoBookings
};
