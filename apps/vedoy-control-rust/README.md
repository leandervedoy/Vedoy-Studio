# Vedoy Control v0.1 — Rust Core

First runnable API foundation for one resource and job model across web apps, PCs and servers.

## Run

Install Rust stable. From this folder:

```bash
export VEDOY_CONTROL_TOKEN="$(openssl rand -hex 32)"
cargo test
cargo run
```

The API binds to 127.0.0.1:8080 by default. Keep the token private. Set DATABASE_PATH to choose SQLite location.

## API

- GET /health (public)
- GET /api/v1/resources
- POST /api/v1/resources with {"name":"Deliver","kind":"web","adapter":"vercel"}
- POST /api/v1/resources/{id}/actions with {"action":"backup","approved":false}
- GET /api/v1/jobs

All /api endpoints require Authorization: Bearer <token> and X-Tenant-Id: demo.

## Security and scope

This is a **local development prototype**, not a production remote-management service. It stores data in SQLite and requires a shared server-side bearer token. Tenant header is caller-provided and MUST NOT be used as a production trust boundary. Before exposing publicly, replace this with OIDC authentication, server-derived tenant membership, RBAC, audit logs, rate limiting, TLS, isolated workers and signed agent identity.

Actions are **simulated only**. No remote command execution, backup or software update occurs. Adapters are validated identifiers for later implementation. Do not advertise simulated status as real health checks.

## Next milestones

1. OIDC + real RBAC and tenant isolation.
2. Async worker, durable event queue and audit log.
3. Read-only Vercel, Proxmox and device agent status connectors.
4. Signed agent enrolment with mTLS, narrowly scoped commands and approvals.
5. Backups, retention and restore tests.
6. Deployment gates, canary rollout, rollback and monitoring.
