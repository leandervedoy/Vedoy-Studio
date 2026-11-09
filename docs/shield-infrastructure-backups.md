# Shield backups: Vercel and Supabase

## Current scope

- **Vercel:** team `vedoy`, project `vedoy-studio` (`prj_K5sVV1TAkhCQ9BJt7xNMQqRgVrOO`). The exporter saves only allowlisted metadata: project build settings, domain names and environment variable **names/types/targets**, never variable values. It does **not** back up deployed functions, live DNS records, secure values, Blob storage, or third-party integration accounts.
- **Supabase:** project `Vedoy` (`niedmgyyougvgiiuwcvw`), region `eu-north-1`, database Postgres 17. The job creates a read-only Postgres custom-format logical dump through the official Postgres client. It is not a Supabase-managed physical backup, nor a complete turnkey restore. **Nine Storage buckets exist:** Storage objects require a separate snapshot and restoration plan.
- **Git:** separate Shield backup workflow and pre-change branches protect repository history. Git history alone does not include Vercel or Supabase configuration and data.

## Required GitHub Actions repository secrets

| Name | Value |
|---|---|
| `SHIELD_BACKUP_PASSPHRASE` | Long random encryption secret stored independently of GitHub |
| `SHIELD_VERCEL_READ_TOKEN` | Restricted Vercel API token capable of reading this project's metadata |
| `SHIELD_SUPABASE_PGHOST` | Exactly `db.niedmgyyougvgiiuwcvw.supabase.co` |
| `SHIELD_SUPABASE_PGUSER` | Database username for the Vedoy project |
| `SHIELD_SUPABASE_PGPASSWORD` | Database password, never an API publishable or service-role key |

**Do not send any secret into ChatGPT, Git commits or Vercel environment variables for these GitHub Actions jobs.** Add secrets directly via repository Settings → Secrets and variables → Actions. The Supabase job deliberately binds the host to the known Vedoy production database to avoid accidentally copying a different project. If IPv6 is unavailable for the direct host on GitHub runners, change to a verified session-pooler hostname only after reviewing the desired TLS verification and exact project identity.

The jobs start after **merge to the default branch** and secrets configuration; the PR itself does not enable a running production backup. Review and pin the `postgres:17` container to a known digest for long-term supply-chain stability. Workflows retain encrypted artifacts for 14 days; use a separately authorized, encrypted off-site destination for longer retention.

## Restoration drill

1. Download a `.shield` file from a successful GitHub Actions run.
2. Set `SHIELD_BACKUP_PASSPHRASE` locally using a secure environment mechanism.
3. Decrypt with `node scripts/shield-backup.mjs decrypt input.shield restored.dump`.
4. Check `pg_restore --list restored.dump`, then restore into an **isolated test** PostgreSQL instance. Don't restore directly onto the live project.
5. Compare tables, constraints, critical row counts, roles, permissions, RLS, Auth, and applications.
6. Export and restore Storage files separately: DB backups preserve metadata only, not file content.
7. Restore or rotate Vercel and third-party secrets manually from an independent credential vault, not these metadata archives.

### Limitations and security

The Postgres dump may contain personal information and sensitive data; encryption and least privilege are essential. Postgres direct logical exports may contain Supabase-managed schemas and require selective, tested restores. For a Supabase-to-Supabase migration, use the Supabase CLI's documented schema/roles/data export instead, plus a separate storage-file export. For comprehensive disaster recovery, include Neon/Postgres instances used by Studio, Storage objects, SMTP, OAuth/provider configuration, DNS and external systems, or document them as explicit exclusions. No backup is considered successful until an encrypted artifact has been produced and an isolated restore has been verified.
