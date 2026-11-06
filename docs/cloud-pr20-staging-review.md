# Vedoy Cloud PR #20 – staging and approval gate (2026-11-06)

Status: **draft / not approved for merge or production rollout**.

## Safeguards proposed in this review

- Composite `(project_id, owner_id)` foreign key blocks cross-tenant file metadata, even if an application endpoint makes a mistake.
- Advisory-locked database insert triggers reserve a maximum of **100 MiB per owner**, **200 files per project**, and **30 projects per owner**, including concurrent requests. Existing pending uploads count toward the quota.
- Project deletion checks ownership *before* touching any storage keys; file and GitHub import routes retain explicit per-owner filters.
- Cloud database URL is mandatory (no silent production fallback). A Vercel preview deploy refuses the currently known production Cloud Supabase host even if a secret is mistakenly configured.
- UI consistently states **Supabase eu-north-1 in Sweden**, 100 MiB/account, 10 MiB/file, 30 projects/account, 200 files/project, and limited GitHub file copying (not Git history or sync).
- New offline tenant tests run in GitHub Actions. These use two fake customer identities and a fake database/storage backend, never real credentials.

## Existing production Cloud database

The original `20261105_vedoy_cloud_projects.sql` was already applied to a hosted project before this PR was merged. Editing that migration alone does **not** apply the new triggers or foreign key to that existing database. After approval and separate backup/restore verification, create a proper new migration using `supabase migration new <descriptive-name>` and move the audited statements from `scripts/vedoy-cloud-existing-db-hardening.sql` into it. Do not execute against production during code review.

Preflight against the current production schema: 0 file records with mismatched owner IDs. This is a point-in-time count, not an ongoing assertion. Re-check on staging and before applying constraints.

## Isolated staging prerequisites

1. Create a dedicated Supabase **staging** project; do not reuse any existing production Cloud project or its secret/service key. Use a distinct project URL and a staging-only secret in *Preview* variables (not `NEXT_PUBLIC_*`).
2. Create a new, unrelated `SESSION_SECRET` for preview. Register a preview-specific Vedoy Login OAuth client/callback. Never reuse the production OAuth client secret or production DB credentials.
3. Apply the Cloud schema to staging only, then apply the tenant and quota guards. Because Supabase CLI v3 defaults to local targets, explicitly verify the linked target and use the documented `--remote` flag only after confirming the staging project ref.
4. Deploy a nonproduction Vercel preview bound to this staging project. Confirm `VERCEL_ENV=preview` and verify that supplying the known production Cloud URL causes the app to fail closed.
5. Create two separate **test** Vedoy Login accounts with verified emails. Check the real OAuth callback, `state`/PKCE, cookie scope, logout, session expiry and Studio-role separation using a browser.

## Staging end-to-end test matrix (must pass before production)

| Operation | Account A on A data | Account B on A data |
|---|---|---|
| List projects | A projects only | A hidden |
| Create and delete a project | Success | Delete A project returns 404 |
| List files | Success | A project returns 404 |
| Request signed upload for A project | Success | Denied; no signed URL issued |
| Confirm pending file | Success with matching storage size | A file returns 404 |
| Get signed download | Success (short-lived attachment) | A file returns 404 |
| Delete file | Removes object and metadata | Denied; object remains |
| Import public GitHub repo | Limited file import | Cannot import into A project |
| Upload beyond 10 MiB/file | Rejected | Rejected |
| Multiple concurrent requests near 100 MiB and 200-file limit | Atomic quota enforcement | Isolated by owner |

Also verify cross-origin POST/PATCH/DELETE rejection, bad UUIDs, malformed paths (`..`, dotfiles, absolute paths), public-only GitHub URLs, truncated trees, >256 KiB blobs, 12-file import cap, 60-second signed-download expiration, partial upload failure, and repeated file deletion.

## Launch blockers beyond PR #20

- Staging must pass real two-account end-to-end tests; the offline tests alone are insufficient.
- Test PostgreSQL trigger/foreign-key DDL on staging, including **concurrent** inserts and failed constraint cases; SQL was reviewed but was not executed here.
- Design and exercise backups and restores (both database metadata and actual Supabase Storage objects).
- Decide retention and cleanup of stale `pending` entries and orphaned storage objects; add scheduled cleanup with safe ownership checks.
- Document incident response, account deletion/export, service terms, privacy notice/DPA, abuse/rate limits and realistic availability commitments.
- Do not market Norwegian data residency or full Git version control while using Swedish Supabase storage and file-copy-only GitHub import.

## Review state and requested approvals

- **Local review only:** patch generated, no branch push, PR merge, Vercel production deployment or production SQL mutation.
- Obtain user approval before updating the PR branch, making a staging environment, migrating production data, merging PR #20, or publishing the Cloud beta.
