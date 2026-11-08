# Vedøy Platform Core

Studio is the control plane. Phone, Canvas, Earth and games remain independently deployable applications and communicate only through versioned `/api/v1` contracts.

- Contract source: `lib/platform/contracts.ts`; machine-readable OpenAPI: `/api/v1/openapi`.
- Tenant source: session `organizationId`. All new platform data carries `organization_id`; repository migrations must preserve the filter on every query.
- Jobs: `platform_jobs` is durable queue storage. A separate worker/cron claims queued jobs; Vercel request handlers only enqueue.
- API keys: secrets are returned once and stored hashed. Add authentication middleware before accepting keys on public integrations; revoke/rotate through a future managed UI.
- Mobile: web-first. React Native begins only for Phone or another product requiring push, camera, contacts or reliable offline work.
- Paid flows remain disabled until `DATABASE_URL` is production-backed and the Platform Core migration is applied.
