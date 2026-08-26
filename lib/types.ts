export type ProductStatus = "live" | "beta" | "planned";
export type ProjectStatus = "healthy" | "building" | "attention" | "paused";
export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
export type TicketStatus = "open" | "in-progress" | "resolved";

export interface StudioProduct {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  group: "Bygg" | "Drift" | "Voks" | "Utvikle";
  status: ProductStatus;
  accent: string;
  highlights: string[];
}

export interface StudioProject {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  framework: string;
  status: ProjectStatus;
  productionUrl: string;
  region: string;
  lastDeployAt: string;
  monthlyRequests: number;
  createdAt: string;
}

export interface StudioDomain {
  id: string;
  organizationId: string;
  name: string;
  status: "active" | "pending" | "expiring";
  autoRenew: boolean;
  expiresAt: string;
  projectId?: string;
  dnsProvider: string;
}

export interface StudioBooking {
  id: string;
  organizationId: string;
  serviceId: string;
  serviceName: string;
  planId?: string;
  staffId?: string;
  location?: string;
  customFields?: Record<string, string | boolean>;
  startsAt: string;
  endsAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface StudioCustomer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  valueNok: number;
  lastActivityAt: string;
  tags: string[];
}

export interface StudioApiKey {
  id: string;
  organizationId: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  scopes: string[];
}

export interface StudioTicket {
  id: string;
  organizationId: string;
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  status: TicketStatus;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  need: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

export interface ClothingRequest {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  productName: string;
  productCode: string;
  quantity: number;
  details?: string;
  logoFilename?: string;
  logoContentType?: string;
  logoData?: string;
  status: "new" | "contacted" | "quoted" | "closed";
  createdAt: string;
}

export type StudioNoteColor = "sand" | "lemon" | "mint" | "lavender" | "coral";

export interface StudioNote {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  color: StudioNoteColor;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkTimeEntry {
  id: string;
  organizationId: string;
  ownerEmail: string;
  startedAt: string;
  endedAt?: string;
  note: string;
}

export interface GrowthNotification {
  id: string;
  organizationId: string;
  userEmail: string;
  type: "lead" | "booking" | "system";
  title: string;
  detail: string;
  href?: string;
  readAt?: string;
  createdAt: string;
}

export interface GrowthPreferences {
  userEmail: string;
  inAppNotifications: boolean;
  emailBooking: boolean;
  emailSystem: boolean;
  dailyDigest: boolean;
}

export interface GrowthCompanyProfile {
  name: string;
  organizationNumber: string;
  location: string;
  timezone: string;
  description: string;
}

export interface StudioActivity {
  id: string;
  organizationId: string;
  type: string;
  title: string;
  detail: string;
  createdAt: string;
}

export interface StudioMetricPoint {
  label: string;
  value: number;
}

export interface StudioOverview {
  organization: {
    id: string;
    name: string;
    plan: string;
    location: string;
  };
  stats: {
    domains: number;
    projects: number;
    bookingsThisMonth: number;
    customers: number;
    uptime: number;
    monthlyRequests: number;
  };
  traffic: StudioMetricPoint[];
  activities: StudioActivity[];
  projects: StudioProject[];
  bookings: StudioBooking[];
}

export interface AcademyCourse {
  id: string;
  title: string;
  description: string;
  level: "Nybegynner" | "Viderekommen";
  minutes: number;
  progress: number;
  category: string;
}

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  annualPriceNok: number;
  renewalPriceNok: number;
  premium: boolean;
}

export interface SessionPayload {
  email: string;
  name: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  expiresAt: number;
}
