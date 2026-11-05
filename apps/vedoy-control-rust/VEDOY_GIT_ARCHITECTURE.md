# Vedoy Git + Vedoy Cloud — collaboration architecture (proposal)

## Git compatibility
Keep stock Git over HTTPS/SSH using Gitea. Clone, fetch, pull, push, branches, tags, PRs and commit SHA semantics remain standard. Rust Control is orchestration, not a replacement for Git object storage or transport.

## Storage and durability
- Gitea repositories stored on durable, access-controlled persistent volumes in Vedoy Cloud. Git objects and refs are authoritative; never use a transient container filesystem as the only store.
- Encrypted off-host backups of repository data, Gitea DB, LFS objects, secrets and configuration. Test restores. Separate backup credentials and retention policy.
- Git LFS object storage must be included; a Git repo alone does not include LFS payloads.
- Immutable snapshots and deletion protection for protected repositories; restore procedures and retention policies must be documented.
- Do not promise that no data can ever be lost. Measure recovery point and recovery time objectives.

## Concurrent developers
1. Developers work on separate feature branches and push normally.
2. Branch protection denies force-push and deletion on main, and requires review and successful CI.
3. Gitea creates pull requests. Rust service queues a merge candidate for the latest target and source SHAs.
4. The included merge_guard uses git merge-tree --write-tree to detect conflicts without modifying branches or working tree. It does NOT create a merge commit or perform tests.
5. For clean merges, an isolated CI runner creates an integration branch/commit, runs build, lint, tests, migrations dry-run and security checks.
6. For conflicts, retain both branches. Optional AI suggests a patch in a new reviewable branch. Require human approval and passing CI before merging.
7. Serialize merges per target branch and recheck target SHA immediately before writing. If main advanced, recompute candidate. Never blindly force-push.
8. Use append-only audit events and idempotent job IDs. Restrict Git service credentials to required repo operations.

## AI guardrails
AI suggestions are untrusted code. Run in sandbox with no production secrets, outbound network denied unless explicitly approved, bounded compute/time, dependency allowlist and full diff review. AI cannot bypass approvals or branch protections.

## Local merge preflight
From apps/vedoy-control-rust:
```bash
cargo run --bin merge_guard -- /path/to/repo main feature/example
```
Requires Git with merge-tree --write-tree support. The command writes candidate Git objects but never changes refs or working files. An exit code of 1 means conflicts; 2 means invalid arguments or tooling failure.

## Next engineering tasks
- Provision a Gitea instance and durable Git/LFS storage in Vedoy Cloud (not provisioned by this commit).
- Connect Gitea webhooks with signed verification and durable Rust job queue.
- Build Gitea API adapter, scoped credentials, OIDC authentication, tenant-aware authorization and audit.
- Implement isolated integration workers, protected branch merges and human review UI.
- Add scheduled backups and restore drills.
