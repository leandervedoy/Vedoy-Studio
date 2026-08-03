import {
  demoApiKeys,
  demoBookings,
  demoCustomers,
  demoDomains,
  demoProjects,
  demoTickets
} from "@/lib/demo-data";
import type {
  StudioApiKey,
  StudioBooking,
  StudioCustomer,
  StudioDomain,
  StudioProject,
  StudioTicket
} from "@/lib/types";

type DemoStore = {
  projects: StudioProject[];
  domains: StudioDomain[];
  bookings: StudioBooking[];
  customers: StudioCustomer[];
  apiKeys: StudioApiKey[];
  tickets: StudioTicket[];
};

declare global {
  // eslint-disable-next-line no-var
  var __vedoyDemoStore: DemoStore | undefined;
}

export function getDemoStore(): DemoStore {
  if (!globalThis.__vedoyDemoStore) {
    globalThis.__vedoyDemoStore = {
      projects: structuredClone(demoProjects),
      domains: structuredClone(demoDomains),
      bookings: structuredClone(demoBookings),
      customers: structuredClone(demoCustomers),
      apiKeys: structuredClone(demoApiKeys),
      tickets: structuredClone(demoTickets)
    };
  }
  return globalThis.__vedoyDemoStore;
}
