# Vedoy Shield + Vedoy Cloud — Gigahost storage and Restic backup pilot

**Status: staging implementation, NOT a production backup service.** 2026-11-09.

## Planned hardware (not yet purchased or deployed)

- Gigahost dedicated server: NVMe for OS, API and any **locally hosted** database.
- Separate data pool: two HDDs in a **ZFS mirror** (one disk may fail without immediate data loss).
- Separate encrypted Restic backup repository on a **different host/location** (SFTP over SSH with pinned server host key, or an approved object-store backend).
- Later: 8–12-bay SAS JBOD enclosure with an appropriate HBA, redundant cooling/power and a supported ZFS expansion strategy.
- Keep a storage-driver interface between Vedoy Cloud file API and its backend; **do not switch existing Supabase Storage tenants to local disks before staged migrations and two-account restore tests**.

A mirror is **not** a backup. Raw disk capacity is not sellable space: account for mirror redundancy, headroom, snapshots, metadata and encrypted off-site backups. Gigahost must confirm drive bays, NVMe slots, disk controllers, SAS/HBA expansion, rack power and remote hands. No automatic procurement.

## What is implemented in this PR

`tools/vedoy-shield/backup/restic-runner.mjs` controls an existing **Restic** binary. This is a server-side orchestration module for Vedoy Shield, **not** the experimental Vedoy Shield Rust cryptographic protocol.

- Explicit `init` (requires an extra opt-in), `backup`, `verify`, `status` and `restore` commands.
- Refuses insecure password-file permissions, missing remote repository selection (except explicitly opted-in test mode), symlink/device-file backup inputs, overlapping secret/source/report directories, invalid snapshot IDs and restore into a pre-existing target.
- Before snapshot: records each regular file's **SHA-256**. Restic creates the **encrypted and authenticated** repository snapshot.
- After backup: invokes `restic check --read-data`, performs a **real restore to a temporary directory**, compares every restored file's size and hash, and scans the original again to detect changes. Only then is the local report marked `verified: true`.
- Outputs sanitized operational status to stdout; does not log repository credentials, source paths or secret values. Local verification reports contain paths/hashes: protect them with owner-only permissions and volume encryption.
- **No delete, prune, forget or automatic source cleanup command exists.** No original is removed merely because an upload completed or backup was written.

**Limits:** A healthy backup on one run does not establish continuous availability. Source datasets should be application-consistent snapshots (ZFS snapshots or a coordinated database dump), not arbitrary live mutable trees. Restic protects data stored in the repository, but write access to the repository can still permit deletion: use immutable/append-only backend protections and separate credentials as available. Reports local to a failing machine must be backed up separately; recovery must also be tested with the disaster-recovery key from another host.

## Restic deployment and secrets (illustrative commands, do not run against production without review)

Install a verified Restic release from trusted OS packages or signed/release-verified distribution; do **not** use `npm install vedoy-shield` as a replacement for Restic or assume it deploys native cryptography.

Use a distinct backup identity with permission to read the **immutable snapshot**. The backup repository lives on an independently secured server. Do **not** put a Restic password in GitHub, CI variables intended for public PRs, a command-line argument, the repository directory, an `.env` in the source tree or the backup itself.

Provide `RESTIC_PASSWORD_FILE` via a root-managed secret file (0600; readable only by the backup service user) materialized from an external secret manager or hardware-backed key management. Store a sealed, separately kept **offline recovery copy** of the secret and rehearse recovery periodically. The key file can exist on the **application host at runtime**; it must never be stored on the remote backup storage server. Secure the application host because its compromise can expose that runtime secret.

Example service-only environment file outside the repository:

```ini
# /etc/vedoy-shield/backup.env (0600; never commit actual values)
RESTIC_REPOSITORY=sftp:vedoy-backup@backup-host.example:/srv/backup-repo
RESTIC_PASSWORD_FILE=/run/secrets/vedoy-shield-restic
RESTIC_CACHE_DIR=/var/lib/vedoy-shield-backup/cache
SHIELD_BACKUP_STATE_DIR=/var/lib/vedoy-shield-backup
```

Configure SSH authentication with **a dedicated restricted account**, pinned SSH host keys, no interactive shell if supported, and narrowly scoped filesystem access. No storage host details or passwords are supplied by this PR.

For a *local disposable test only*:

```sh
export RESTIC_REPOSITORY=/tmp/vedoy-restic-test-repo
export RESTIC_PASSWORD_FILE=/tmp/vedoy-restic-test-secret
export SHIELD_BACKUP_ALLOW_LOCAL=1
export SHIELD_BACKUP_ALLOW_INIT=1
node tools/vedoy-shield/backup/restic-runner.mjs init --state /tmp/vedoy-restic-state
node tools/vedoy-shield/backup/restic-runner.mjs backup --source /tmp/vedoy-test-dataset --state /tmp/vedoy-restic-state
```

**The example requires creating the directories with 0700 and secret file with 0600 first.** Never run this test on genuine customer data.

Production systemd template: `deploy/gigahost/vedoy-shield-backup.service` + `.timer`; **shipped disabled**, requires the reviewed service user, readonly source snapshot, mounted secrets, offsite target and full test results. Avoid treating a timer as proof that a backup succeeded.

## Restoration / disaster recovery runbook

1. On a separate trusted **recovery host**, obtain the repository address, offline password from the designated custodian, and a verified Restic binary. Do not retrieve the key from the backup repository itself.
2. Verify the repository with `restic check --read-data` and list snapshots. Recover the per-snapshot manifest/report from the secured operational evidence archive (or compare independently held hashes).
3. Restore the selected snapshot to a **new empty directory** with the runner, then verify contents via SHA-256. The original production path is never overwritten.
4. Test application-level recovery: Postgres version/schema, file metadata, referenced objects, auth, and two separate users' download isolation. Raw backups alone do not prove that Vedoy Cloud is restorable.
5. Record restore duration, snapshot ID, verified file count, database/object coverage, operator and recovery result. Only then consider any independently approved retention or cleanup policy.

A report written to NVMe is **not** proof of recovery if the NVMe dies; archive protected reports off-host (e.g. separately encrypted with a distinct key) or regenerate a trustworthy manifest from an immutable baseline.

## Supabase / customer isolation: current scope and blockers

Current Vedoy Cloud routes use the `vedoy_cloud_session` cookie, enforce `owner_id` on project/file mutations, and issue short-lived Storage signed URLs. Offline tenant regression tests in `tests/cloud-tenant-isolation.test.mjs` exercise **Alice cannot be accessed by Bob**, including upload, list, download, delete and project import.

The actual Cloud service currently uses **Supabase in Sweden** (100 MiB/user and 10 MiB/file in code). This Restic runner backs up only its explicitly supplied filesystem snapshot. It **does not currently back up production Supabase Storage objects or hosted database**, does not connect to an actual Gigahost machine and does not create encrypted backups of existing GitHub backup branches.

Before production:
- Isolated **staging** Cloud project and second test account, run real (not mocked) A/B authorization checks.
- Explicit SQL export/backup that matches all Storage object versions and project/file rows, plus checksum reconciliation. Never claim a folder of pointers equals the Cloud backup.
- Verify ZFS snapshot lifecycle, remote repository encryption, monitored job exit status, SSH host authenticity, repository retention/immutability, key recovery, backup and restore on a second machine.
- Enforce server-side retention and repository credential separation, track storage cost and disaster recovery objectives.
- Prepare user data export/deletion and GDPR documentation for the new data location; review subprocessor agreements before migrating tenants.

## Launch gate

**No automatic deletion of an original file unless a valid encrypted offsite backup has been created, a complete restore test has succeeded, checksums match, the required user authorization exists and an independently approved retention policy permits deletion.** This PR intentionally ships **no** original-file deletion pathway.

### Tests
- `node --test tools/vedoy-shield/backup/restic-runner.test.mjs` (real Restic install required for E2E).
- `node --test tests/cloud-tenant-isolation.test.mjs` (offline 2-user route mocks; requires dependencies).
- `.github/workflows/shield-restic-integration.yml` runs both in a fresh GitHub Actions runner without production secrets.

Restic docs: https://restic.readthedocs.io/ and https://github.com/restic/restic/blob/master/doc/design.rst
