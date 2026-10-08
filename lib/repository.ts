import { academyCourses, demoActivities, trafficPoints } from "@/lib/demo-data";
import { randomBytes } from "node:crypto";
import { getDemoStore } from "@/lib/demo-store";
import { databaseEnabled, getSql } from "@/lib/db";
import type {
  AcademyCourse,
  ClothingRequest,
  HostingRequest,
  ContactRequest,
  StudioApiKey,
  StudioBooking,
  StudioCustomer,
  StudioDomain,
  StudioOverview,
  StudioProject,
  StudioNote,
  StudioNoteAttachment,
  StudioNoteShare,
  StudioNoteVersion,
  StudioTicket,
  WorkTimeEntry,
  GrowthNotification,
  GrowthPreferences,
  GrowthCompanyProfile,
  VedoyNewsPost,
  TeamMember,
  TeamRole,
  CompanyRegistration,
  CompanyInviteDraft,
  CompanyRegistrationStatus,
  DomainEmailOrder,
  ProvisioningRequestStatus
} from "@/lib/types";
import { randomId, slugify } from "@/lib/utils";

const ORGANIZATION_ID = "org_vedoy";

function parseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}

function companyRegistrationRow(row: CompanyRegistration): CompanyRegistration {
  return {
    ...row,
    seatLimit: Number(row.seatLimit),
    invitedMembers: parseJsonArray<CompanyInviteDraft>(row.invitedMembers),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt)
  };
}

function domainEmailOrderRow(row: DomainEmailOrder): DomainEmailOrder {
  return {
    ...row,
    mailboxCount: Number(row.mailboxCount),
    requestedAddresses: parseJsonArray<string>(row.requestedAddresses).map(String),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt)
  };
}

function teamMemberRow(row: TeamMember): TeamMember {
  return { ...row, sortOrder: Number(row.sortOrder), createdAt: asIso(row.createdAt), updatedAt: asIso(row.updatedAt) };
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const sql = getSql(); if (!sql) return [];
  const rows = await sql<TeamMember[]>`select id, organization_id as "organizationId", email, name, avatar_url as "avatarUrl", role, team_name as "teamName", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt" from growth_team_members where organization_id = ${ORGANIZATION_ID} order by team_name asc, sort_order asc, created_at asc`;
  return rows.map(teamMemberRow);
}

export async function getTeamSessionRole(email: string): Promise<"owner" | "admin" | "member"> {
  const sql = getSql(); if (!sql) return "member";
  const rows = await sql<{ role: TeamRole }[]>`select role from growth_team_members where organization_id = ${ORGANIZATION_ID} and email = ${email.toLowerCase()} limit 1`;
  return rows[0]?.role === "owner" ? "owner" : rows[0]?.role === "admin" ? "admin" : "member";
}

export async function syncTeamMemberOnLogin(input: { email: string; name: string; avatarUrl?: string; owner: boolean }): Promise<void> {
  const sql = getSql(); if (!sql) return;
  await sql`insert into growth_team_members (id, organization_id, email, name, avatar_url, role, sort_order) values (${randomId("team")}, ${ORGANIZATION_ID}, ${input.email.toLowerCase()}, ${input.name}, ${input.avatarUrl || null}, ${input.owner ? "owner" : "member"}, ${input.owner ? 0 : 100}) on conflict (organization_id, email) do update set name = excluded.name, avatar_url = excluded.avatar_url, role = case when excluded.role = 'owner' then 'owner' else growth_team_members.role end, updated_at = now()`;
}

export async function addTeamMember(input: { email: string; name: string; role: Exclude<TeamRole, "owner">; teamName: string }): Promise<TeamMember> {
  const sql = requireDatabase();
  const rows = await sql<TeamMember[]>`insert into growth_team_members (id, organization_id, email, name, role, team_name, sort_order) values (${randomId("team")}, ${ORGANIZATION_ID}, ${input.email.toLowerCase()}, ${input.name}, ${input.role}, ${input.teamName}, 100) on conflict (organization_id, email) do update set name = excluded.name, role = case when growth_team_members.role = 'owner' then 'owner' else excluded.role end, team_name = excluded.team_name, updated_at = now() returning id, organization_id as "organizationId", email, name, avatar_url as "avatarUrl", role, team_name as "teamName", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt"`;
  return teamMemberRow(rows[0]);
}

export async function updateTeamMember(id: string, input: { role?: Exclude<TeamRole, "owner">; teamName?: string; sortOrder?: number }): Promise<TeamMember> {
  const sql = requireDatabase();
  const rows = await sql<TeamMember[]>`update growth_team_members set role = case when role = 'owner' then role else coalesce(${input.role ?? null}, role) end, team_name = coalesce(${input.teamName ?? null}, team_name), sort_order = coalesce(${input.sortOrder ?? null}, sort_order), updated_at = now() where id = ${id} and organization_id = ${ORGANIZATION_ID} returning id, organization_id as "organizationId", email, name, avatar_url as "avatarUrl", role, team_name as "teamName", sort_order as "sortOrder", created_at as "createdAt", updated_at as "updatedAt"`;
  if (!rows[0]) throw new Error("Teammedlemmet ble ikke funnet.");
  return teamMemberRow(rows[0]);
}

function newsRow(row: VedoyNewsPost): VedoyNewsPost {
  return { ...row, sortOrder: Number(row.sortOrder), publishedAt: row.publishedAt ? asIso(row.publishedAt) : undefined, createdAt: asIso(row.createdAt), updatedAt: asIso(row.updatedAt) };
}

export async function listNewsPosts(publishedOnly = false): Promise<VedoyNewsPost[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql<VedoyNewsPost[]>`select id, organization_id as "organizationId", slug, title, excerpt, content, category, status, author_type as "authorType", author_name as "authorName", author_avatar_url as "authorAvatarUrl", sort_order as "sortOrder", published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt" from vedoy_news_posts where organization_id = ${ORGANIZATION_ID} ${publishedOnly ? sql`and status = 'published'` : sql``} order by sort_order asc, published_at desc nulls last, created_at desc`;
  return rows.map(newsRow);
}

export async function getNewsPost(slug: string, publishedOnly = true): Promise<VedoyNewsPost | null> {
  const sql = getSql(); if (!sql) return null;
  const rows = await sql<VedoyNewsPost[]>`select id, organization_id as "organizationId", slug, title, excerpt, content, category, status, author_type as "authorType", author_name as "authorName", author_avatar_url as "authorAvatarUrl", sort_order as "sortOrder", published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt" from vedoy_news_posts where organization_id = ${ORGANIZATION_ID} and slug = ${slug} ${publishedOnly ? sql`and status = 'published'` : sql``} limit 1`;
  return rows[0] ? newsRow(rows[0]) : null;
}

export async function createNewsPost(input: Omit<VedoyNewsPost, "id" | "organizationId" | "createdAt" | "updatedAt">): Promise<VedoyNewsPost> {
  const sql = requireDatabase(); const id = randomId("news");
  const rows = await sql<VedoyNewsPost[]>`insert into vedoy_news_posts (id, organization_id, slug, title, excerpt, content, category, status, author_type, author_name, author_avatar_url, sort_order, published_at) values (${id}, ${ORGANIZATION_ID}, ${input.slug}, ${input.title}, ${input.excerpt}, ${input.content}, ${input.category}, ${input.status}, ${input.authorType}, ${input.authorName}, ${input.authorAvatarUrl || null}, ${input.sortOrder}, ${input.publishedAt || null}) returning id, organization_id as "organizationId", slug, title, excerpt, content, category, status, author_type as "authorType", author_name as "authorName", author_avatar_url as "authorAvatarUrl", sort_order as "sortOrder", published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"`;
  return newsRow(rows[0]);
}

export async function updateNewsPost(id: string, input: Partial<Omit<VedoyNewsPost, "id" | "organizationId" | "createdAt" | "updatedAt">>): Promise<VedoyNewsPost> {
  const sql = requireDatabase(); const rows = await sql<VedoyNewsPost[]>`update vedoy_news_posts set title = coalesce(${input.title ?? null}, title), slug = coalesce(${input.slug ?? null}, slug), excerpt = coalesce(${input.excerpt ?? null}, excerpt), content = coalesce(${input.content ?? null}, content), category = coalesce(${input.category ?? null}, category), status = coalesce(${input.status ?? null}, status), sort_order = coalesce(${input.sortOrder ?? null}, sort_order), published_at = case when ${input.status ?? null} = 'published' then coalesce(published_at, now()) else published_at end, updated_at = now() where id = ${id} and organization_id = ${ORGANIZATION_ID} returning id, organization_id as "organizationId", slug, title, excerpt, content, category, status, author_type as "authorType", author_name as "authorName", author_avatar_url as "authorAvatarUrl", sort_order as "sortOrder", published_at as "publishedAt", created_at as "createdAt", updated_at as "updatedAt"`;
  if (!rows[0]) throw new Error("Innlegget ble ikke funnet."); return newsRow(rows[0]);
}

function requireDatabase() {
  const sql = getSql();
  if (!sql) throw new Error("Databasen er ikke konfigurert.");
  return sql;
}

function asIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

let bookingPaymentColumnsReady: Promise<void> | undefined;

async function ensureBookingPaymentColumns(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  bookingPaymentColumnsReady ??= (async () => {
    await sql`alter table bookings add column if not exists payment_status text not null default 'not_required'`;
    await sql`alter table bookings add column if not exists payment_required boolean not null default false`;
    await sql`alter table bookings add column if not exists payment_amount_nok integer`;
    await sql`alter table bookings add column if not exists stripe_checkout_session_id text`;
    await sql`alter table bookings add column if not exists stripe_payment_intent_id text`;
    await sql`alter table bookings add column if not exists paid_at timestamptz`;
    await sql`alter table bookings drop constraint if exists bookings_payment_status_check`;
    await sql`alter table bookings add constraint bookings_payment_status_check check (payment_status in ('not_required','unpaid','paid','failed'))`;
    await sql`create index if not exists bookings_stripe_checkout_idx on bookings (stripe_checkout_session_id)`;
  })();
  await bookingPaymentColumnsReady;
}
export async function getOverview(): Promise<StudioOverview> {
  const [projects, domains, bookings, customers] = await Promise.all([
    listProjects(),
    listDomains(),
    listBookings(),
    listCustomers()
  ]);

  return {
    organization: {
      id: ORGANIZATION_ID,
      name: "Vedøy",
      plan: "Studio Growth",
      location: "Haugesund"
    },
    stats: {
      domains: domains.length,
      projects: projects.length,
      bookingsThisMonth: bookings.filter((booking) => {
        const date = new Date(booking.startsAt);
        const current = new Date();
        return date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear();
      }).length,
      customers: customers.length,
      uptime: 99.98,
      monthlyRequests: projects.reduce((sum, project) => sum + project.monthlyRequests, 0)
    },
    traffic: trafficPoints,
    activities: demoActivities,
    projects,
    bookings
  };
}

export async function listProjects(): Promise<StudioProject[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().projects;

  const rows = await sql<StudioProject[]>`
    select
      id,
      organization_id as "organizationId",
      name,
      slug,
      framework,
      status,
      production_url as "productionUrl",
      region,
      last_deploy_at as "lastDeployAt",
      monthly_requests as "monthlyRequests",
      created_at as "createdAt"
    from projects
    where organization_id = ${ORGANIZATION_ID}
    order by created_at desc
  `;

  return rows.map((row) => ({
    ...row,
    lastDeployAt: asIso(row.lastDeployAt),
    createdAt: asIso(row.createdAt),
    monthlyRequests: Number(row.monthlyRequests)
  }));
}

export async function createProject(input: {
  name: string;
  framework?: string;
  productionUrl?: string;
}): Promise<StudioProject> {
  const now = new Date().toISOString();
  const project: StudioProject = {
    id: randomId("prj"),
    organizationId: ORGANIZATION_ID,
    name: input.name.trim(),
    slug: slugify(input.name),
    framework: input.framework?.trim() || "Next.js",
    status: "building",
    productionUrl: input.productionUrl?.trim() || `${slugify(input.name)}.vedoy.site`,
    region: "Frankfurt",
    lastDeployAt: now,
    monthlyRequests: 0,
    createdAt: now
  };

  const sql = getSql();
  if (!sql) {
    getDemoStore().projects.unshift(project);
    return project;
  }

  await sql`
    insert into projects (
      id, organization_id, name, slug, framework, status, production_url,
      region, last_deploy_at, monthly_requests, created_at
    ) values (
      ${project.id}, ${project.organizationId}, ${project.name}, ${project.slug},
      ${project.framework}, ${project.status}, ${project.productionUrl},
      ${project.region}, ${project.lastDeployAt}, ${project.monthlyRequests}, ${project.createdAt}
    )
  `;

  return project;
}

export async function listDomains(): Promise<StudioDomain[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().domains;

  const rows = await sql<StudioDomain[]>`
    select
      id,
      organization_id as "organizationId",
      name,
      status,
      auto_renew as "autoRenew",
      expires_at as "expiresAt",
      project_id as "projectId",
      dns_provider as "dnsProvider"
    from domains
    where organization_id = ${ORGANIZATION_ID}
    order by name asc
  `;

  return rows.map((row) => ({ ...row, expiresAt: asIso(row.expiresAt) }));
}

export async function listBookings(): Promise<StudioBooking[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().bookings;
  await ensureBookingPaymentColumns();

  const rows = await sql<StudioBooking[]>`
    select
      id,
      organization_id as "organizationId",
      service_id as "serviceId",
      service_name as "serviceName",
      plan_id as "planId",
      staff_id as "staffId",
      location,
      custom_fields as "customFields",
      starts_at as "startsAt",
      ends_at as "endsAt",
      customer_name as "customerName",
      customer_email as "customerEmail",
      customer_phone as "customerPhone",
      notes,
      status,
      payment_status as "paymentStatus",
      payment_required as "paymentRequired",
      payment_amount_nok as "paymentAmountNok",
      stripe_checkout_session_id as "stripeCheckoutSessionId",
      stripe_payment_intent_id as "stripePaymentIntentId",
      paid_at as "paidAt",
      created_at as "createdAt"
    from bookings
    where organization_id = ${ORGANIZATION_ID}
    order by starts_at asc
  `;

  return rows.map((row) => ({
    ...row,
    startsAt: asIso(row.startsAt),
    endsAt: asIso(row.endsAt),
    paymentStatus: row.paymentStatus,
    paymentRequired: Boolean(row.paymentRequired),
    paymentAmountNok: row.paymentAmountNok == null ? undefined : Number(row.paymentAmountNok),
    stripeCheckoutSessionId: row.stripeCheckoutSessionId || undefined,
    stripePaymentIntentId: row.stripePaymentIntentId || undefined,
    paidAt: row.paidAt ? asIso(row.paidAt) : undefined,
    createdAt: asIso(row.createdAt)
  }));
}

export async function createBooking(input: {
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
  paymentRequired?: boolean;
  paymentAmountNok?: number;
}): Promise<StudioBooking> {
  const booking: StudioBooking = {
    id: randomId("bk"),
    organizationId: ORGANIZATION_ID,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    planId: input.planId,
    staffId: input.staffId,
    location: input.location,
    customFields: input.customFields,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone?.trim(),
    notes: input.notes?.trim(),
    status: "pending",
    paymentStatus: input.paymentRequired ? "unpaid" : "not_required",
    paymentRequired: Boolean(input.paymentRequired),
    paymentAmountNok: input.paymentAmountNok,
    createdAt: new Date().toISOString()
  };

  const sql = getSql();
  if (!sql) {
    const conflict = getDemoStore().bookings.some((item) =>
      item.status !== "cancelled" &&
      (!booking.staffId || !item.staffId || item.staffId === booking.staffId) &&
      new Date(item.startsAt) < new Date(booking.endsAt) &&
      new Date(item.endsAt) > new Date(booking.startsAt)
    );
    if (conflict) throw new Error("Tidspunktet er allerede bestilt.");
    getDemoStore().bookings.push(booking);
    return booking;
  }

  await ensureBookingPaymentColumns();

  await sql.begin(async (tx) => {
    // Serialiser bookingopprettelser per organisasjon for å unngå to samtidige innsettinger.
    await tx`select pg_advisory_xact_lock(hashtext(${ORGANIZATION_ID}))`;
    const conflicts = booking.staffId
      ? await tx<{ count: number }[]>`
          select count(*)::int as count
          from bookings
          where organization_id = ${ORGANIZATION_ID}
            and status <> 'cancelled'
            and (staff_id is null or staff_id = ${booking.staffId})
            and starts_at < ${booking.endsAt}
            and ends_at > ${booking.startsAt}
        `
      : await tx<{ count: number }[]>`
          select count(*)::int as count
          from bookings
          where organization_id = ${ORGANIZATION_ID}
            and status <> 'cancelled'
            and starts_at < ${booking.endsAt}
            and ends_at > ${booking.startsAt}
        `;

    if (Number(conflicts[0]?.count ?? 0) > 0) {
      throw new Error("Tidspunktet er allerede bestilt.");
    }

    await tx`
      insert into bookings (
        id, organization_id, service_id, service_name, plan_id, staff_id, location, custom_fields, starts_at, ends_at,
        customer_name, customer_email, customer_phone, notes, status, payment_status, payment_required, payment_amount_nok, created_at
      ) values (
        ${booking.id}, ${booking.organizationId}, ${booking.serviceId}, ${booking.serviceName},
        ${booking.planId ?? null}, ${booking.staffId ?? null}, ${booking.location ?? null}, ${JSON.stringify(booking.customFields ?? {})},
        ${booking.startsAt}, ${booking.endsAt}, ${booking.customerName}, ${booking.customerEmail},
        ${booking.customerPhone ?? null}, ${booking.notes ?? null}, ${booking.status}, ${booking.paymentStatus}, ${booking.paymentRequired}, ${booking.paymentAmountNok ?? null}, ${booking.createdAt}
      )
    `;

    await tx`
      insert into customers (
        id, organization_id, name, email, phone, company, value_nok,
        last_activity_at, tags, created_at
      ) values (
        ${randomId("cus")}, ${ORGANIZATION_ID}, ${booking.customerName}, ${booking.customerEmail},
        ${booking.customerPhone ?? null}, ${null}, ${0}, ${booking.createdAt}, ${JSON.stringify(["Booking"])}, ${booking.createdAt}
      )
      on conflict (organization_id, email)
      do update set name = excluded.name, phone = coalesce(excluded.phone, customers.phone), last_activity_at = excluded.last_activity_at
    `;
  });

  return booking;
}

export async function attachBookingCheckoutSession(id: string, sessionId: string): Promise<void> {
  const sql = getSql();
  if (!sql) {
    const item = getDemoStore().bookings.find((booking) => booking.id === id);
    if (item) item.stripeCheckoutSessionId = sessionId;
    return;
  }
  await ensureBookingPaymentColumns();
  await sql`update bookings set stripe_checkout_session_id = ${sessionId} where id = ${id} and organization_id = ${ORGANIZATION_ID}`;
}

export async function markBookingPayment(
  id: string,
  patch: { paymentStatus: StudioBooking["paymentStatus"]; stripeCheckoutSessionId?: string; stripePaymentIntentId?: string; paidAt?: string }
): Promise<void> {
  const sql = getSql();
  if (!sql) {
    const item = getDemoStore().bookings.find((booking) => booking.id === id);
    if (item) Object.assign(item, patch);
    return;
  }
  await ensureBookingPaymentColumns();
  await sql`
    update bookings set
      payment_status = ${patch.paymentStatus},
      stripe_checkout_session_id = coalesce(${patch.stripeCheckoutSessionId ?? null}, stripe_checkout_session_id),
      stripe_payment_intent_id = coalesce(${patch.stripePaymentIntentId ?? null}, stripe_payment_intent_id),
      paid_at = coalesce(${patch.paidAt ?? null}, paid_at)
    where id = ${id} and organization_id = ${ORGANIZATION_ID}
  `;
}
export async function updateBooking(
  id: string,
  patch: Partial<Pick<StudioBooking, "status" | "startsAt" | "endsAt" | "notes">>
): Promise<StudioBooking> {
  const sql = getSql();
  if (!sql) {
    const store = getDemoStore();
    const item = store.bookings.find((booking) => booking.id === id);
    if (!item) throw new Error("Bookingen finnes ikke.");

    const startsAt = patch.startsAt ? new Date(patch.startsAt).toISOString() : item.startsAt;
    const endsAt = patch.endsAt ? new Date(patch.endsAt).toISOString() : item.endsAt;
    const status = patch.status ?? item.status;
    if (new Date(endsAt) <= new Date(startsAt)) throw new Error("Sluttid må være etter starttid.");

    if (status !== "cancelled") {
      const conflict = store.bookings.some((booking) =>
        booking.id !== id &&
        booking.status !== "cancelled" &&
        (!item.staffId || !booking.staffId || booking.staffId === item.staffId) &&
        new Date(booking.startsAt) < new Date(endsAt) &&
        new Date(booking.endsAt) > new Date(startsAt)
      );
      if (conflict) throw new Error("Tidspunktet er allerede bestilt.");
    }

    Object.assign(item, { ...patch, startsAt, endsAt, status });
    return item;
  }

  return sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext(${ORGANIZATION_ID}))`;
    const currentRows = await tx<StudioBooking[]>`
      select
        id, organization_id as "organizationId", service_id as "serviceId", service_name as "serviceName",
        plan_id as "planId", staff_id as "staffId", location, custom_fields as "customFields",
        starts_at as "startsAt", ends_at as "endsAt", customer_name as "customerName",
        customer_email as "customerEmail", customer_phone as "customerPhone", notes, status,
        created_at as "createdAt"
      from bookings
      where id = ${id} and organization_id = ${ORGANIZATION_ID}
      limit 1
      for update
    `;
    const current = currentRows[0];
    if (!current) throw new Error("Bookingen finnes ikke.");

    const updated = {
      status: patch.status ?? current.status,
      startsAt: patch.startsAt ? new Date(patch.startsAt).toISOString() : asIso(current.startsAt),
      endsAt: patch.endsAt ? new Date(patch.endsAt).toISOString() : asIso(current.endsAt),
      notes: patch.notes ?? current.notes
    };
    if (new Date(updated.endsAt) <= new Date(updated.startsAt)) throw new Error("Sluttid må være etter starttid.");

    if (updated.status !== "cancelled") {
      const conflicts = current.staffId
        ? await tx<{ count: number }[]>`
            select count(*)::int as count
            from bookings
            where organization_id = ${ORGANIZATION_ID}
              and id <> ${id}
              and status <> 'cancelled'
              and (staff_id is null or staff_id = ${current.staffId})
              and starts_at < ${updated.endsAt}
              and ends_at > ${updated.startsAt}
          `
        : await tx<{ count: number }[]>`
            select count(*)::int as count
            from bookings
            where organization_id = ${ORGANIZATION_ID}
              and id <> ${id}
              and status <> 'cancelled'
              and starts_at < ${updated.endsAt}
              and ends_at > ${updated.startsAt}
          `;
      if (Number(conflicts[0]?.count ?? 0) > 0) throw new Error("Tidspunktet er allerede bestilt.");
    }

    const rows = await tx<StudioBooking[]>`
      update bookings set
        status = ${updated.status},
        starts_at = ${updated.startsAt},
        ends_at = ${updated.endsAt},
        notes = ${updated.notes ?? null}
      where id = ${id} and organization_id = ${ORGANIZATION_ID}
      returning
        id, organization_id as "organizationId", service_id as "serviceId", service_name as "serviceName",
        plan_id as "planId", staff_id as "staffId", location, custom_fields as "customFields",
        starts_at as "startsAt", ends_at as "endsAt", customer_name as "customerName",
        customer_email as "customerEmail", customer_phone as "customerPhone", notes, status,
        created_at as "createdAt"
    `;

    return {
      ...rows[0],
      startsAt: asIso(rows[0].startsAt),
      endsAt: asIso(rows[0].endsAt),
      createdAt: asIso(rows[0].createdAt)
    };
  });
}

export async function deleteBooking(id: string): Promise<void> {
  const sql = getSql();
  if (!sql) {
    const store = getDemoStore();
    store.bookings = store.bookings.filter((booking) => booking.id !== id);
    return;
  }
  await sql`delete from bookings where id = ${id} and organization_id = ${ORGANIZATION_ID}`;
}

export async function listCustomers(): Promise<StudioCustomer[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().customers;

  const rows = await sql<Array<StudioCustomer & { tags: string | string[] }>>`
    select
      id,
      organization_id as "organizationId",
      name,
      email,
      phone,
      company,
      value_nok as "valueNok",
      last_activity_at as "lastActivityAt",
      tags
    from customers
    where organization_id = ${ORGANIZATION_ID}
    order by last_activity_at desc
  `;

  return rows.map((row) => ({
    ...row,
    valueNok: Number(row.valueNok),
    lastActivityAt: asIso(row.lastActivityAt),
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) as string[] : row.tags
  }));
}

export async function listApiKeys(): Promise<StudioApiKey[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().apiKeys;

  const rows = await sql<Array<StudioApiKey & { scopes: string | string[] }>>`
    select
      id,
      organization_id as "organizationId",
      name,
      prefix,
      created_at as "createdAt",
      last_used_at as "lastUsedAt",
      scopes
    from api_keys
    where organization_id = ${ORGANIZATION_ID}
    order by created_at desc
  `;

  return rows.map((row) => ({
    ...row,
    createdAt: asIso(row.createdAt),
    lastUsedAt: row.lastUsedAt ? asIso(row.lastUsedAt) : undefined,
    scopes: typeof row.scopes === "string" ? JSON.parse(row.scopes) as string[] : row.scopes
  }));
}

export async function createApiKey(name: string, scopes: string[]): Promise<{ key: StudioApiKey; secret: string }> {
  const secret = `vdy_live_${crypto.randomUUID().replaceAll("-", "")}`;
  const key: StudioApiKey = {
    id: randomId("key"),
    organizationId: ORGANIZATION_ID,
    name: name.trim(),
    prefix: secret.slice(0, 17),
    createdAt: new Date().toISOString(),
    scopes,
    lastUsedAt: undefined
  };

  const sql = getSql();
  if (!sql) {
    getDemoStore().apiKeys.unshift(key);
    return { key, secret };
  }

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const hash = Buffer.from(digest).toString("hex");
  await sql`
    insert into api_keys (id, organization_id, name, prefix, secret_hash, created_at, scopes)
    values (${key.id}, ${key.organizationId}, ${key.name}, ${key.prefix}, ${hash}, ${key.createdAt}, ${JSON.stringify(scopes)})
  `;
  return { key, secret };
}

export async function listTickets(): Promise<StudioTicket[]> {
  const sql = getSql();
  if (!sql) return getDemoStore().tickets;

  const rows = await sql<StudioTicket[]>`
    select id, organization_id as "organizationId", subject, message, priority, status, created_at as "createdAt"
    from support_tickets
    where organization_id = ${ORGANIZATION_ID}
    order by created_at desc
  `;
  return rows.map((row) => ({ ...row, createdAt: asIso(row.createdAt) }));
}

export async function createTicket(input: {
  subject: string;
  message: string;
  priority: StudioTicket["priority"];
}): Promise<StudioTicket> {
  const ticket: StudioTicket = {
    id: randomId("ticket"),
    organizationId: ORGANIZATION_ID,
    subject: input.subject.trim(),
    message: input.message.trim(),
    priority: input.priority,
    status: "open",
    createdAt: new Date().toISOString()
  };

  const sql = getSql();
  if (!sql) {
    getDemoStore().tickets.unshift(ticket);
    return ticket;
  }
  await sql`
    insert into support_tickets (id, organization_id, subject, message, priority, status, created_at)
    values (${ticket.id}, ${ticket.organizationId}, ${ticket.subject}, ${ticket.message}, ${ticket.priority}, ${ticket.status}, ${ticket.createdAt})
  `;
  return ticket;
}

export async function createCustomer(input: Omit<StudioCustomer, "id" | "organizationId" | "lastActivityAt">): Promise<StudioCustomer> {
  const now = new Date().toISOString();
  const customer: StudioCustomer = {
    id: randomId("cus"),
    organizationId: ORGANIZATION_ID,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    valueNok: input.valueNok,
    lastActivityAt: now,
    tags: input.tags
  };
  const sql = getSql();
  if (!sql) {
    const store = getDemoStore();
    if (store.customers.some((item) => item.email.toLowerCase() === customer.email)) throw new Error("En kunde med denne e-postadressen finnes allerede.");
    store.customers.unshift(customer);
    return customer;
  }

  const rows = await sql<StudioCustomer[]>`
    insert into customers (id, organization_id, name, email, phone, company, value_nok, last_activity_at, tags)
    values (${customer.id}, ${ORGANIZATION_ID}, ${customer.name}, ${customer.email}, ${customer.phone ?? null}, ${customer.company ?? null}, ${customer.valueNok}, ${customer.lastActivityAt}, ${JSON.stringify(customer.tags)})
    returning id, organization_id as "organizationId", name, email, phone, company, value_nok as "valueNok", last_activity_at as "lastActivityAt", tags
  `;
  return { ...rows[0], valueNok: Number(rows[0].valueNok), lastActivityAt: asIso(rows[0].lastActivityAt) };
}

export async function updateCustomer(
  id: string,
  patch: Pick<StudioCustomer, "name" | "email" | "phone" | "company" | "valueNok" | "tags">
): Promise<StudioCustomer> {
  const updatedAt = new Date().toISOString();
  const next = {
    name: patch.name.trim(),
    email: patch.email.trim().toLowerCase(),
    phone: patch.phone?.trim() || undefined,
    company: patch.company?.trim() || undefined,
    valueNok: patch.valueNok,
    tags: patch.tags
  };
  const sql = getSql();
  if (!sql) {
    const store = getDemoStore();
    const customer = store.customers.find((item) => item.id === id);
    if (!customer) throw new Error("Kunden finnes ikke.");
    if (store.customers.some((item) => item.id !== id && item.email.toLowerCase() === next.email)) throw new Error("En kunde med denne e-postadressen finnes allerede.");
    Object.assign(customer, next, { lastActivityAt: updatedAt });
    return customer;
  }

  const rows = await sql<Array<StudioCustomer & { tags: string | string[] }>>`
    update customers set name = ${next.name}, email = ${next.email}, phone = ${next.phone ?? null}, company = ${next.company ?? null}, value_nok = ${next.valueNok}, tags = ${JSON.stringify(next.tags)}, last_activity_at = ${updatedAt}
    where id = ${id} and organization_id = ${ORGANIZATION_ID}
    returning id, organization_id as "organizationId", name, email, phone, company, value_nok as "valueNok", last_activity_at as "lastActivityAt", tags
  `;
  if (!rows[0]) throw new Error("Kunden finnes ikke.");
  return {
    ...rows[0],
    valueNok: Number(rows[0].valueNok),
    lastActivityAt: asIso(rows[0].lastActivityAt),
    tags: typeof rows[0].tags === "string" ? JSON.parse(rows[0].tags) as string[] : rows[0].tags
  };
}

export async function createContactRequest(input: Omit<ContactRequest, "id" | "status" | "createdAt">): Promise<string> {
  const sql = requireDatabase();
  const id = randomId("lead");
  await sql`
    insert into contact_requests (id, organization_id, name, company, email, phone, need, message)
    values (
      ${id}, ${ORGANIZATION_ID}, ${input.name}, ${input.company ?? null}, ${input.email},
      ${input.phone ?? null}, ${input.need}, ${input.message ?? null}
    )
  `;
  return id;
}

export async function createClothingRequest(input: Omit<ClothingRequest, "id" | "status" | "createdAt" | "logoData"> & { logo?: Buffer }): Promise<string> {
  const sql = requireDatabase();
  const id = randomId("clothing");
  await sql`
    insert into clothing_requests (
      id, organization_id, name, company, email, phone, product_name, product_code,
      quantity, details, logo_filename, logo_content_type, logo_data
    ) values (
      ${id}, ${ORGANIZATION_ID}, ${input.name}, ${input.company ?? null}, ${input.email},
      ${input.phone ?? null}, ${input.productName}, ${input.productCode}, ${input.quantity},
      ${input.details ?? null}, ${input.logoFilename ?? null}, ${input.logoContentType ?? null},
      ${input.logo ?? null}
    )
  `;
  return id;
}

export async function listContactRequests(): Promise<ContactRequest[]> {
  const sql = requireDatabase();
  const rows = await sql<ContactRequest[]>`
    select id, name, company, email, phone, need, message, status, created_at as "createdAt"
    from contact_requests where organization_id = ${ORGANIZATION_ID}
    order by created_at desc limit 250
  `;
  return rows.map((row) => ({ ...row, createdAt: asIso(row.createdAt) }));
}

export async function listClothingRequests(): Promise<ClothingRequest[]> {
  const sql = requireDatabase();
  const rows = await sql<(ClothingRequest & { logoData?: Buffer })[]>`
    select id, name, company, email, phone, product_name as "productName", product_code as "productCode",
      quantity, details, logo_filename as "logoFilename", logo_content_type as "logoContentType",
      logo_data as "logoData", status, created_at as "createdAt"
    from clothing_requests where organization_id = ${ORGANIZATION_ID}
    order by created_at desc limit 250
  `;
  return rows.map((row) => ({
    ...row,
    quantity: Number(row.quantity),
    logoData: row.logoData ? Buffer.from(row.logoData).toString("base64") : undefined,
    createdAt: asIso(row.createdAt)
  }));
}

export async function createHostingRequest(input: Omit<HostingRequest, "id" | "organizationId" | "status" | "createdAt">): Promise<string> {
  const sql = requireDatabase();
  const id = randomId("hosting");
  await sql`
    insert into hosting_requests (
      id, organization_id, name, company, email, phone, server_count, ram_gb, storage_gb,
      region, backups, domain_mode, domain, monthly_nok, setup_nok, details
    ) values (
      ${id}, ${ORGANIZATION_ID}, ${input.name}, ${input.company ?? null}, ${input.email}, ${input.phone ?? null},
      ${input.serverCount}, ${input.ramGb}, ${input.storageGb}, ${input.region}, ${input.backups}, ${input.domainMode},
      ${input.domain ?? null}, ${input.monthlyNok}, ${input.setupNok}, ${input.details ?? null}
    )
  `;
  return id;
}

export async function listHostingRequests(): Promise<HostingRequest[]> {
  const sql = requireDatabase();
  const rows = await sql<HostingRequest[]>`
    select id, organization_id as "organizationId", name, company, email, phone,
      server_count as "serverCount", ram_gb as "ramGb", storage_gb as "storageGb", region, backups,
      domain_mode as "domainMode", domain, monthly_nok as "monthlyNok", setup_nok as "setupNok", details,
      status, created_at as "createdAt"
    from hosting_requests where organization_id = ${ORGANIZATION_ID}
    order by created_at desc limit 250
  `;
  return rows.map((row) => ({
    ...row,
    serverCount: Number(row.serverCount),
    ramGb: Number(row.ramGb),
    storageGb: Number(row.storageGb),
    monthlyNok: Number(row.monthlyNok),
    setupNok: Number(row.setupNok),
    createdAt: asIso(row.createdAt)
  }));
}

export async function createCompanyRegistration(input: Omit<CompanyRegistration, "id" | "status" | "createdAt" | "updatedAt">): Promise<CompanyRegistration> {
  const sql = requireDatabase();
  const id = randomId("company");
  const rows = await sql<CompanyRegistration[]>`
    insert into company_registrations (
      id, company_name, organization_number, owner_name, owner_email, owner_title, phone,
      subscription_plan, seat_limit, invited_members
    ) values (
      ${id}, ${input.companyName}, ${input.organizationNumber ?? null}, ${input.ownerName}, ${input.ownerEmail}, ${input.ownerTitle}, ${input.phone ?? null},
      ${input.subscriptionPlan}, ${input.seatLimit}, ${JSON.stringify(input.invitedMembers)}::jsonb
    )
    returning id, company_name as "companyName", organization_number as "organizationNumber", owner_name as "ownerName",
      owner_email as "ownerEmail", owner_title as "ownerTitle", phone, subscription_plan as "subscriptionPlan",
      seat_limit as "seatLimit", invited_members as "invitedMembers", status, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return companyRegistrationRow(rows[0]);
}

export async function listCompanyRegistrations(): Promise<CompanyRegistration[]> {
  const sql = requireDatabase();
  const rows = await sql<CompanyRegistration[]>`
    select id, company_name as "companyName", organization_number as "organizationNumber", owner_name as "ownerName",
      owner_email as "ownerEmail", owner_title as "ownerTitle", phone, subscription_plan as "subscriptionPlan",
      seat_limit as "seatLimit", invited_members as "invitedMembers", status, created_at as "createdAt", updated_at as "updatedAt"
    from company_registrations order by created_at desc limit 250
  `;
  return rows.map(companyRegistrationRow);
}

export async function updateCompanyRegistrationStatus(id: string, status: CompanyRegistrationStatus): Promise<CompanyRegistration> {
  const sql = requireDatabase();
  const rows = await sql<CompanyRegistration[]>`
    update company_registrations set status = ${status}, updated_at = now() where id = ${id}
    returning id, company_name as "companyName", organization_number as "organizationNumber", owner_name as "ownerName",
      owner_email as "ownerEmail", owner_title as "ownerTitle", phone, subscription_plan as "subscriptionPlan",
      seat_limit as "seatLimit", invited_members as "invitedMembers", status, created_at as "createdAt", updated_at as "updatedAt"
  `;
  if (!rows[0]) throw new Error("Bedriftsregistreringen ble ikke funnet.");
  return companyRegistrationRow(rows[0]);
}

export async function createDomainEmailOrder(input: Omit<DomainEmailOrder, "id" | "status" | "createdAt" | "updatedAt">): Promise<DomainEmailOrder> {
  const sql = requireDatabase();
  const id = randomId("domain_email");
  const rows = await sql<DomainEmailOrder[]>`
    insert into domain_email_orders (
      id, company_name, contact_name, contact_email, phone, domain, domain_mode,
      mailbox_count, requested_addresses, email_package, notes
    ) values (
      ${id}, ${input.companyName}, ${input.contactName}, ${input.contactEmail}, ${input.phone ?? null}, ${input.domain}, ${input.domainMode},
      ${input.mailboxCount}, ${JSON.stringify(input.requestedAddresses)}::jsonb, ${input.emailPackage}, ${input.notes ?? null}
    )
    returning id, company_name as "companyName", contact_name as "contactName", contact_email as "contactEmail", phone,
      domain, domain_mode as "domainMode", mailbox_count as "mailboxCount", requested_addresses as "requestedAddresses",
      email_package as "emailPackage", notes, status, created_at as "createdAt", updated_at as "updatedAt"
  `;
  return domainEmailOrderRow(rows[0]);
}

export async function listDomainEmailOrders(): Promise<DomainEmailOrder[]> {
  const sql = requireDatabase();
  const rows = await sql<DomainEmailOrder[]>`
    select id, company_name as "companyName", contact_name as "contactName", contact_email as "contactEmail", phone,
      domain, domain_mode as "domainMode", mailbox_count as "mailboxCount", requested_addresses as "requestedAddresses",
      email_package as "emailPackage", notes, status, created_at as "createdAt", updated_at as "updatedAt"
    from domain_email_orders order by created_at desc limit 250
  `;
  return rows.map(domainEmailOrderRow);
}

export async function updateDomainEmailOrderStatus(id: string, status: ProvisioningRequestStatus): Promise<DomainEmailOrder> {
  const sql = requireDatabase();
  const rows = await sql<DomainEmailOrder[]>`
    update domain_email_orders set status = ${status}, updated_at = now() where id = ${id}
    returning id, company_name as "companyName", contact_name as "contactName", contact_email as "contactEmail", phone,
      domain, domain_mode as "domainMode", mailbox_count as "mailboxCount", requested_addresses as "requestedAddresses",
      email_package as "emailPackage", notes, status, created_at as "createdAt", updated_at as "updatedAt"
  `;
  if (!rows[0]) throw new Error("Domenebestillingen ble ikke funnet.");
  return domainEmailOrderRow(rows[0]);
}

export async function listStudioNotes(): Promise<StudioNote[]> {
  const sql = requireDatabase();
  const rows = await sql<StudioNote[]>`
    select id, organization_id as "organizationId", title, content, color, pinned, notebook, section, tags,
      created_at as "createdAt", updated_at as "updatedAt"
    from studio_notes
    where organization_id = ${ORGANIZATION_ID}
    order by pinned desc, updated_at desc
    limit 100
  `;
  return rows.map((row) => ({ ...row, tags: Array.isArray(row.tags) ? row.tags.map(String) : [], createdAt: asIso(row.createdAt), updatedAt: asIso(row.updatedAt) }));
}

export async function createStudioNote(input: Pick<StudioNote, "title" | "content" | "color" | "pinned" | "notebook" | "section" | "tags">): Promise<StudioNote> {
  const sql = requireDatabase();
  const note: StudioNote = {
    id: randomId("note"),
    organizationId: ORGANIZATION_ID,
    title: input.title.trim() || "Uten tittel",
    content: input.content.trim(),
    color: input.color,
    pinned: input.pinned,
    notebook: input.notebook.trim() || "Arbeidsområde",
    section: input.section.trim() || "Generelt",
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await sql`
    insert into studio_notes (id, organization_id, title, content, color, pinned, notebook, section, tags, created_at, updated_at)
    values (${note.id}, ${note.organizationId}, ${note.title}, ${note.content}, ${note.color}, ${note.pinned}, ${note.notebook}, ${note.section}, ${JSON.stringify(note.tags)}::jsonb, ${note.createdAt}, ${note.updatedAt})
  `;
  return note;
}

export async function updateStudioNote(
  id: string,
  patch: Partial<Pick<StudioNote, "title" | "content" | "color" | "pinned" | "notebook" | "section" | "tags">>
): Promise<StudioNote> {
  const sql = requireDatabase();
  const tags = patch.tags ? JSON.stringify(patch.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 12)) : null;
  await sql`
    insert into studio_note_versions (id, note_id, organization_id, title, content, color, notebook, section, tags, created_at)
    select ${randomId("notev")}, id, organization_id, title, content, color, notebook, section, tags, now()
    from studio_notes where id = ${id} and organization_id = ${ORGANIZATION_ID}
  `;
  const rows = await sql<StudioNote[]>`
    update studio_notes
    set title = coalesce(${patch.title?.trim() || null}, title),
      content = coalesce(${patch.content?.trim() ?? null}, content),
      color = coalesce(${patch.color ?? null}, color),
      pinned = coalesce(${patch.pinned ?? null}, pinned),
      notebook = coalesce(${patch.notebook?.trim() || null}, notebook),
      section = coalesce(${patch.section?.trim() || null}, section),
      tags = coalesce(${tags}::jsonb, tags),
      updated_at = now()
    where id = ${id} and organization_id = ${ORGANIZATION_ID}
    returning id, organization_id as "organizationId", title, content, color, pinned, notebook, section, tags,
      created_at as "createdAt", updated_at as "updatedAt"
  `;
  const note = rows[0];
  if (!note) throw new Error("Notatet finnes ikke.");
  await sql`
    delete from studio_note_versions where id in (
      select id from studio_note_versions where note_id = ${id} and organization_id = ${ORGANIZATION_ID}
      order by created_at desc offset 50
    )
  `;
  return { ...note, tags: Array.isArray(note.tags) ? note.tags.map(String) : [], createdAt: asIso(note.createdAt), updatedAt: asIso(note.updatedAt) };
}

export async function deleteStudioNote(id: string): Promise<void> {
  const sql = requireDatabase();
  await sql`delete from studio_notes where id = ${id} and organization_id = ${ORGANIZATION_ID}`;
}

export async function listStudioNoteVersions(noteId: string): Promise<StudioNoteVersion[]> {
  const sql = requireDatabase();
  const rows = await sql<StudioNoteVersion[]>`
    select id, note_id as "noteId", title, content, color, notebook, section, tags, created_at as "createdAt"
    from studio_note_versions
    where note_id = ${noteId} and organization_id = ${ORGANIZATION_ID}
    order by created_at desc limit 50
  `;
  return rows.map((row) => ({ ...row, tags: Array.isArray(row.tags) ? row.tags.map(String) : [], createdAt: asIso(row.createdAt) }));
}

export async function restoreStudioNoteVersion(noteId: string, versionId: string): Promise<StudioNote> {
  const versions = await listStudioNoteVersions(noteId);
  const version = versions.find((item) => item.id === versionId);
  if (!version) throw new Error("Versjonen finnes ikke.");
  return updateStudioNote(noteId, { title: version.title, content: version.content, color: version.color, notebook: version.notebook, section: version.section, tags: version.tags });
}

export async function listStudioNoteAttachments(noteId: string): Promise<StudioNoteAttachment[]> {
  const sql = requireDatabase();
  const rows = await sql<StudioNoteAttachment[]>`
    select id, note_id as "noteId", filename, content_type as "contentType", size_bytes as "sizeBytes", created_at as "createdAt"
    from studio_note_attachments where note_id = ${noteId} and organization_id = ${ORGANIZATION_ID}
    order by created_at desc
  `;
  return rows.map((row) => ({ ...row, sizeBytes: Number(row.sizeBytes), createdAt: asIso(row.createdAt) }));
}

export async function createStudioNoteAttachment(noteId: string, input: { filename: string; contentType: string; data: Buffer }): Promise<StudioNoteAttachment> {
  const sql = requireDatabase();
  const id = randomId("notea");
  const rows = await sql<StudioNoteAttachment[]>`
    insert into studio_note_attachments (id, note_id, organization_id, filename, content_type, size_bytes, data)
    select ${id}, id, organization_id, ${input.filename}, ${input.contentType}, ${input.data.length}, ${input.data}
    from studio_notes where id = ${noteId} and organization_id = ${ORGANIZATION_ID}
    returning id, note_id as "noteId", filename, content_type as "contentType", size_bytes as "sizeBytes", created_at as "createdAt"
  `;
  const attachment = rows[0];
  if (!attachment) throw new Error("Notatet finnes ikke.");
  return { ...attachment, sizeBytes: Number(attachment.sizeBytes), createdAt: asIso(attachment.createdAt) };
}

export async function getStudioNoteAttachment(noteId: string, attachmentId: string): Promise<(StudioNoteAttachment & { data: Buffer }) | null> {
  const sql = requireDatabase();
  const rows = await sql<Array<StudioNoteAttachment & { data: Buffer }>>`
    select id, note_id as "noteId", filename, content_type as "contentType", size_bytes as "sizeBytes", data, created_at as "createdAt"
    from studio_note_attachments where id = ${attachmentId} and note_id = ${noteId} and organization_id = ${ORGANIZATION_ID}
  `;
  const attachment = rows[0];
  return attachment ? { ...attachment, sizeBytes: Number(attachment.sizeBytes), createdAt: asIso(attachment.createdAt) } : null;
}

export async function deleteStudioNoteAttachment(noteId: string, attachmentId: string): Promise<void> {
  const sql = requireDatabase();
  await sql`delete from studio_note_attachments where id = ${attachmentId} and note_id = ${noteId} and organization_id = ${ORGANIZATION_ID}`;
}

export async function getStudioNoteShare(noteId: string): Promise<StudioNoteShare | null> {
  const sql = requireDatabase();
  const rows = await sql<StudioNoteShare[]>`
    select token, note_id as "noteId", created_at as "createdAt" from studio_note_shares
    where note_id = ${noteId} and organization_id = ${ORGANIZATION_ID} and revoked_at is null
  `;
  return rows[0] ? { ...rows[0], createdAt: asIso(rows[0].createdAt) } : null;
}

export async function createStudioNoteShare(noteId: string): Promise<StudioNoteShare> {
  const sql = requireDatabase();
  const token = randomBytes(24).toString("base64url");
  const rows = await sql<StudioNoteShare[]>`
    insert into studio_note_shares (token, note_id, organization_id, created_at, revoked_at)
    select ${token}, id, organization_id, now(), null from studio_notes
    where id = ${noteId} and organization_id = ${ORGANIZATION_ID}
    on conflict (note_id) do update set token = excluded.token, created_at = now(), revoked_at = null
    returning token, note_id as "noteId", created_at as "createdAt"
  `;
  const share = rows[0];
  if (!share) throw new Error("Notatet finnes ikke.");
  return { ...share, createdAt: asIso(share.createdAt) };
}

export async function revokeStudioNoteShare(noteId: string): Promise<void> {
  const sql = requireDatabase();
  await sql`update studio_note_shares set revoked_at = now() where note_id = ${noteId} and organization_id = ${ORGANIZATION_ID}`;
}

export async function getSharedStudioNote(token: string): Promise<StudioNote | null> {
  const sql = requireDatabase();
  const rows = await sql<StudioNote[]>`
    select n.id, n.organization_id as "organizationId", n.title, n.content, n.color, n.pinned, n.notebook, n.section, n.tags,
      n.created_at as "createdAt", n.updated_at as "updatedAt"
    from studio_notes n join studio_note_shares s on s.note_id = n.id
    where s.token = ${token} and s.revoked_at is null limit 1
  `;
  const note = rows[0];
  return note ? { ...note, tags: Array.isArray(note.tags) ? note.tags.map(String) : [], createdAt: asIso(note.createdAt), updatedAt: asIso(note.updatedAt) } : null;
}

export async function listWorkTimeEntries(ownerEmail: string): Promise<WorkTimeEntry[]> {
  const sql = requireDatabase();
  const rows = await sql<WorkTimeEntry[]>`
    select id, organization_id as "organizationId", owner_email as "ownerEmail",
      started_at as "startedAt", ended_at as "endedAt", note
    from work_time_entries
    where organization_id = ${ORGANIZATION_ID} and owner_email = ${ownerEmail.toLowerCase()}
    order by started_at desc
    limit 120
  `;
  return rows.map((row) => ({ ...row, startedAt: asIso(row.startedAt), endedAt: row.endedAt ? asIso(row.endedAt) : undefined }));
}

export async function startWorkTimer(ownerEmail: string, note = ""): Promise<WorkTimeEntry> {
  const sql = requireDatabase();
  const entry: WorkTimeEntry = {
    id: randomId("time"), organizationId: ORGANIZATION_ID, ownerEmail: ownerEmail.toLowerCase(),
    startedAt: new Date().toISOString(), note: note.trim()
  };
  const rows = await sql<WorkTimeEntry[]>`
    insert into work_time_entries (id, organization_id, owner_email, started_at, note)
    values (${entry.id}, ${entry.organizationId}, ${entry.ownerEmail}, ${entry.startedAt}, ${entry.note})
    returning id, organization_id as "organizationId", owner_email as "ownerEmail",
      started_at as "startedAt", ended_at as "endedAt", note
  `;
  return { ...rows[0], startedAt: asIso(rows[0].startedAt), endedAt: rows[0].endedAt ? asIso(rows[0].endedAt) : undefined };
}

export async function stopWorkTimer(ownerEmail: string): Promise<void> {
  const sql = requireDatabase();
  await sql`
    update work_time_entries set ended_at = now()
    where organization_id = ${ORGANIZATION_ID} and owner_email = ${ownerEmail.toLowerCase()} and ended_at is null
  `;
}

export async function listGrowthNotifications(userEmail: string): Promise<GrowthNotification[]> {
  const sql = requireDatabase();
  const rows = await sql<GrowthNotification[]>`
    select id, organization_id as "organizationId", user_email as "userEmail", type, title, detail,
      href, read_at as "readAt", created_at as "createdAt"
    from growth_notifications
    where organization_id = ${ORGANIZATION_ID} and user_email = ${userEmail.toLowerCase()}
    order by created_at desc limit 50
  `;
  return rows.map((row) => ({ ...row, readAt: row.readAt ? asIso(row.readAt) : undefined, createdAt: asIso(row.createdAt) }));
}

export async function createGrowthNotification(input: Omit<GrowthNotification, "id" | "organizationId" | "createdAt" | "readAt">): Promise<void> {
  const sql = requireDatabase();
  await sql`
    insert into growth_notifications (id, organization_id, user_email, type, title, detail, href)
    values (${randomId("notice")}, ${ORGANIZATION_ID}, ${input.userEmail.toLowerCase()}, ${input.type}, ${input.title}, ${input.detail}, ${input.href ?? null})
  `;
}

export async function markGrowthNotificationsRead(userEmail: string): Promise<void> {
  const sql = requireDatabase();
  await sql`
    update growth_notifications set read_at = now()
    where organization_id = ${ORGANIZATION_ID} and user_email = ${userEmail.toLowerCase()} and read_at is null
  `;
}

export async function getGrowthPreferences(userEmail: string): Promise<GrowthPreferences> {
  const sql = requireDatabase();
  const rows = await sql<GrowthPreferences[]>`
    select user_email as "userEmail", in_app_notifications as "inAppNotifications", email_booking as "emailBooking",
      email_system as "emailSystem", daily_digest as "dailyDigest"
    from growth_preferences where organization_id = ${ORGANIZATION_ID} and user_email = ${userEmail.toLowerCase()} limit 1
  `;
  return rows[0] ?? { userEmail: userEmail.toLowerCase(), inAppNotifications: true, emailBooking: true, emailSystem: true, dailyDigest: false };
}

export async function saveGrowthPreferences(userEmail: string, patch: Omit<GrowthPreferences, "userEmail">): Promise<GrowthPreferences> {
  const sql = requireDatabase();
  const email = userEmail.toLowerCase();
  const rows = await sql<GrowthPreferences[]>`
    insert into growth_preferences (organization_id, user_email, in_app_notifications, email_booking, email_system, daily_digest)
    values (${ORGANIZATION_ID}, ${email}, ${patch.inAppNotifications}, ${patch.emailBooking}, ${patch.emailSystem}, ${patch.dailyDigest})
    on conflict (organization_id, user_email) do update set
      in_app_notifications = excluded.in_app_notifications, email_booking = excluded.email_booking,
      email_system = excluded.email_system, daily_digest = excluded.daily_digest, updated_at = now()
    returning user_email as "userEmail", in_app_notifications as "inAppNotifications", email_booking as "emailBooking",
      email_system as "emailSystem", daily_digest as "dailyDigest"
  `;
  return rows[0];
}

export async function getGrowthCompanyProfile(): Promise<GrowthCompanyProfile> {
  const sql = requireDatabase();
  const rows = await sql<GrowthCompanyProfile[]>`
    select name, coalesce(organization_number, '') as "organizationNumber", coalesce(location, '') as location,
      coalesce(timezone, 'Europe/Oslo') as timezone, coalesce(description, '') as description
    from organizations where id = ${ORGANIZATION_ID} limit 1
  `;
  return rows[0] ?? { name: "Vedøy", organizationNumber: "", location: "Haugesund", timezone: "Europe/Oslo", description: "" };
}

export async function saveGrowthCompanyProfile(profile: GrowthCompanyProfile): Promise<GrowthCompanyProfile> {
  const sql = requireDatabase();
  const rows = await sql<GrowthCompanyProfile[]>`
    update organizations set name = ${profile.name}, organization_number = ${profile.organizationNumber || null},
      location = ${profile.location || null}, timezone = ${profile.timezone}, description = ${profile.description}
    where id = ${ORGANIZATION_ID}
    returning name, coalesce(organization_number, '') as "organizationNumber", coalesce(location, '') as location,
      coalesce(timezone, 'Europe/Oslo') as timezone, coalesce(description, '') as description
  `;
  if (!rows[0]) throw new Error("Virksomheten ble ikke funnet.");
  return rows[0];
}

export function listAcademyCourses(): AcademyCourse[] {
  return academyCourses;
}

export function isUsingDatabase(): boolean {
  return databaseEnabled();
}
