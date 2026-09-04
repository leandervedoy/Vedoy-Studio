import type { ReactNode } from "react";

export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
export type CalendarView = "month" | "week" | "day";
export type BookingLayout = "full" | "compact" | "embedded";
export type BookingLocation = "remote" | "business" | "customer" | "custom";
export interface BookingLocationOption {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  capacity?: number;
}
export type BillingInterval = "one-time" | "monthly" | "yearly";
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeRange {
  start: string;
  end: string;
}

export interface BookingService {
  id: string;
  name: string;
  description?: string;
  category?: string;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  price?: number;
  currency?: string;
  color?: string;
  active?: boolean;
  location?: BookingLocation;
  capacity?: number;
  planIds?: string[];
  staffIds?: string[];
  icon?: ReactNode;
}

export interface BookingPlan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  billing?: BillingInterval;
  includedMinutes?: number;
  discountPercent?: number;
  color?: string;
  active?: boolean;
  popular?: boolean;
  serviceIds?: string[];
  features?: string[];
}

export interface BookingStaff {
  id: string;
  name: string;
  description?: string;
  color?: string;
  active?: boolean;
  serviceIds?: string[];
  avatarUrl?: string;
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface BookingCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface BookingInput {
  serviceId: string;
  initialStatus?: BookingStatus;
  planId?: string;
  staffId?: string;
  startsAt: string;
  endsAt: string;
  customer: BookingCustomer;
  notes?: string;
  location?: string;
  customFields?: Record<string, string | boolean>;
  metadata?: Record<string, unknown>;
}

export interface Booking extends Omit<BookingInput, "initialStatus"> {
  id: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  query?: string;
  status?: BookingStatus | "all";
  serviceId?: string | "all";
  planId?: string | "all";
  staffId?: string | "all";
  from?: string;
  to?: string;
}

export interface BookingAdapter {
  create(input: BookingInput): Promise<Booking>;
  list(filters?: BookingFilters): Promise<Booking[]>;
  get?(id: string): Promise<Booking | null>;
  update(id: string, patch: Partial<Booking>): Promise<Booking>;
  cancel(id: string): Promise<Booking>;
  remove(id: string): Promise<void>;
  hasConflict?(input: BookingInput): Promise<boolean>;
}

export interface DateOverride {
  date: string;
  closed?: boolean;
  ranges?: TimeRange[];
  label?: string;
  color?: string;
  note?: string;
}

export interface ScheduleData {
  weeklyHours: Partial<Record<Weekday, TimeRange[]>>;
  overrides: DateOverride[];
  updatedAt?: string;
}

export interface ScheduleAdapter {
  getSchedule(): Promise<ScheduleData>;
  saveSchedule(schedule: ScheduleData): Promise<ScheduleData>;
}

export interface BookingTheme {
  accent?: string;
  accentContrast?: string;
  surface?: string;
  surfaceElevated?: string;
  text?: string;
  muted?: string;
  border?: string;
  danger?: string;
  success?: string;
  radius?: string;
  fontFamily?: string;
  shadow?: string;
}

export interface BookingLabels {
  title?: string;
  subtitle?: string;
  today?: string;
  back?: string;
  next?: string;
  previous?: string;
  chooseService?: string;
  choosePlan?: string;
  chooseStaff?: string;
  chooseDate?: string;
  chooseTime?: string;
  chooseLocation?: string;
  yourDetails?: string;
  confirm?: string;
  noTimes?: string;
  closed?: string;
  fullyBooked?: string;
  bookingSuccess?: string;
}

export interface BookingConfiguration {
  locale?: string;
  timeZone?: string;
  currency?: string;
  weekStartsOn?: 0 | 1;
  slotIntervalMinutes?: number;
  minNoticeMinutes?: number;
  bookingWindowDays?: number;
  defaultView?: CalendarView;
  layout?: BookingLayout;
  animations?: boolean;
  showWeekNumbers?: boolean;
  showPlans?: boolean;
  showStaff?: boolean;
  showCategories?: boolean;
  locations?: BookingLocationOption[];
  requirePhone?: boolean;
  allowPastDates?: boolean;
  autoConfirm?: boolean;
  theme?: BookingTheme;
  labels?: BookingLabels;
  customFields?: CustomFieldDefinition[];
}

export interface AvailabilityRequest {
  date: string;
  service: BookingService;
  staffId?: string;
  location?: string;
  schedule: ScheduleData;
  bookings: Booking[];
  configuration: Required<Pick<BookingConfiguration, "locale" | "timeZone" | "slotIntervalMinutes" | "minNoticeMinutes" | "bookingWindowDays">>;
}

export interface AvailabilitySlot {
  id: string;
  startsAt: string;
  endsAt: string;
  label: string;
  available: boolean;
  remainingCapacity?: number;
  reason?: string;
}

export type AvailabilityProvider = (request: AvailabilityRequest) => Promise<AvailabilitySlot[]> | AvailabilitySlot[];
