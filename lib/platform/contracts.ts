import { z } from "zod";

/** The stable public API surface. New breaking changes get a new versioned route. */
export const API_VERSION = "2026-11-08";

export const apiErrorSchema = z.object({ error: z.string(), code: z.string().optional(), requestId: z.string() });
export const bookingCreateSchema = z.object({
  serviceId: z.string().min(1).max(120), serviceName: z.string().min(1).max(160),
  planId: z.string().max(120).optional(), staffId: z.string().max(120).optional(), location: z.string().max(300).optional(),
  customFields: z.record(z.string(), z.union([z.string(), z.boolean()])).optional(),
  startsAt: z.string().datetime(), endsAt: z.string().datetime(), customerName: z.string().min(1).max(160),
  customerEmail: z.string().email().max(254), customerPhone: z.string().max(40).optional(), notes: z.string().max(4000).optional()
}).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), { message: "Sluttid må være etter starttid.", path: ["endsAt"] });

export const apiKeyCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  scopes: z.array(z.enum(["booking:read", "booking:write", "analytics:read", "projects:read", "domains:read", "forge:write"])).min(1).max(12)
});

export const featureFlagSchema = z.enum(["forge", "calendar", "vedi", "payments"]);
export const jobTypeSchema = z.enum(["email", "webhook", "domain_check", "ssl_check", "notification"]);
export const openApiDocument = {
  openapi: "3.1.0", info: { title: "Vedøy Platform API", version: API_VERSION },
  paths: {
    "/api/v1/health": { get: { summary: "Platform health" } },
    "/api/v1/bookings": { post: { summary: "Create booking", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/BookingCreate" } } } } } },
    "/api/v1/api-keys": { post: { summary: "Create scoped API key", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ApiKeyCreate" } } } } } }
  },
  components: { schemas: { BookingCreate: z.toJSONSchema(bookingCreateSchema), ApiKeyCreate: z.toJSONSchema(apiKeyCreateSchema), ApiError: z.toJSONSchema(apiErrorSchema) } }
} as const;
