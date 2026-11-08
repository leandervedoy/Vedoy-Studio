import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { attachBookingCheckoutSession, createBooking, createGrowthNotification, listBookings } from "@/lib/repository";
import { bookingPaymentsReady, createBookingCheckoutSession } from "@/lib/booking-payments";
import { bookingServices } from "@/lib/booking-config";
import { sendAdminLeadEmail } from "@/lib/lead-email";
import { bookingCreateSchema } from "@/lib/platform/contracts";
import { getPlatformContext } from "@/lib/platform/request-context";
import { errorResponse, logEvent } from "@/lib/platform/observability";
import { enqueueJob } from "@/lib/platform/jobs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const status = url.searchParams.get("status");
  const serviceId = url.searchParams.get("serviceId");
  const staffId = url.searchParams.get("staffId");

  const bookings = (await listBookings()).filter((booking) => {
    if (from && new Date(booking.endsAt) <= new Date(from)) return false;
    if (to && new Date(booking.startsAt) >= new Date(to)) return false;
    if (status && status !== "all" && booking.status !== status) return false;
    if (serviceId && serviceId !== "all" && booking.serviceId !== serviceId) return false;
    if (staffId && staffId !== "all" && booking.staffId !== staffId) return false;
    return true;
  });

  const session = await getSession();
  if (session) return NextResponse.json({ bookings });

  // Offentlig kundevisning trenger bare opptatte tidsrom, aldri kontaktinformasjon.
  return NextResponse.json({
    bookings: bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => ({
        ...booking,
        customerName: "Opptatt",
        customerEmail: "private@vedoy.local",
        customerPhone: undefined,
        notes: undefined,
        customFields: undefined
      }))
  });
}

export async function POST(request: Request) {
  const context = await getPlatformContext();
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || new URL(request.url).host;
    if (new URL(origin).host.toLowerCase() !== host.toLowerCase()) return errorResponse("Ugyldig forespørsel.", context.requestId, 403, "CSRF_ORIGIN");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Ugyldig forespørsel.", context.requestId, 400, "INVALID_JSON");
  }
  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Ugyldig bookinginformasjon.", context.requestId, 400, "INVALID_BOOKING");
  const bookingInput = parsed.data;

  try {
    const service = bookingServices.find((item) => item.id === bookingInput.serviceId);
    const paymentsReady = bookingPaymentsReady();
    const booking = await createBooking({
      ...bookingInput,
      paymentRequired: paymentsReady,
      paymentAmountNok: paymentsReady ? service?.price : undefined
    });
    const checkout = await createBookingCheckoutSession(booking);
    if (checkout?.id) await attachBookingCheckoutSession(booking.id, checkout.id);
    if (process.env.ADMIN_EMAIL) {
      try {
        await createGrowthNotification({ userEmail: process.env.ADMIN_EMAIL, type: "booking", title: "Ny bookingforespørsel", detail: `${booking.customerName} har forespurt ${booking.serviceName}.`, href: "/studio/booking" });
      } catch (error) { console.error("booking_notification_failed", error); }
    }
    await enqueueJob({ organizationId: context.organizationId, type: "notification", payload: { bookingId: booking.id, event: "booking.created" } });
    try {
      await sendAdminLeadEmail({
        subject: `Ny bookingforespørsel · ${booking.serviceName}`,
        replyTo: booking.customerEmail,
        text: [`Kunde: ${booking.customerName}`, `E-post: ${booking.customerEmail}`, booking.customerPhone ? `Telefon: ${booking.customerPhone}` : "", `Tjeneste: ${booking.serviceName}`, `Start: ${booking.startsAt}`, `Slutt: ${booking.endsAt}`, booking.location ? `Lokasjon: ${booking.location}` : "", booking.notes ? `Notat: ${booking.notes}` : ""].filter(Boolean).join("\n")
      });
    } catch (error) { console.error("booking_email_failed", error); }
    logEvent("info", "booking.created", { requestId: context.requestId, organizationId: context.organizationId, bookingId: booking.id });
    return NextResponse.json({ booking: checkout?.id ? { ...booking, stripeCheckoutSessionId: checkout.id } : booking, checkoutUrl: checkout?.url || null, requestId: context.requestId }, { status: 201 });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Bookingen kunne ikke lagres.", context.requestId, 409, "BOOKING_CONFLICT");
  }
}
