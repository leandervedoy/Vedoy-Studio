# Vedoy Shield Core - release readiness gate
Last reviewed: 2026-11-06

## Product status
**Research/developer preview only. NOT approved for production messaging, real customer secrets, VPN, payments, or claims of end-to-end post-quantum security.**

The `0.3.0` number describes experimental source compatibility, not a security grade. There is no confirmed successful Rust compile, test, SPQR-enabled build, or independent audit for this branch.

## Code implemented in this preparation branch
- Added `hybrid::InviteReplayGuard` and `RecipientPrivate::accept_guarded`: verify the pinned sender identity and authenticated handshake before consuming the invite ID. The derived root is returned only after the replay guard reports successful persistence.
- Added `replay::LocalEncryptedReplayLedger` with encrypted, revision-checked local snapshots, per-account scope, non-evicting bounded history, and failure on missing ledger, duplicates, storage errors, wrong credentials or race conflicts.
- New negative regression tests for duplicate invites, tampered signatures, unavailable storage, incorrect credentials/scope, process restart, and reinitialization.
- Updated GitHub Actions checks to require clean formatting, Clippy, default tests, opt-in SPQR tests and dependency audit.

## Review blockers for a production release (all MUST be completed)
- [ ] **Replace custom handshake** with an independently reviewed, supported PQXDH-or-equivalent implementation; lifecycle for signed, rotated and one-time prekeys.
- [ ] **Complete a reviewed Double/Triple Ratchet integration**. SPQR alone is not a complete production messenger ratchet.
- [ ] **Global replay defense** shared across all user devices and restored backups. Current local ledger is per-account/per-device research only, not global; deletion or rollback can reopen an invite.
- [ ] **Verified public keys / key transparency** with account recovery, device add/removal and revocation; Ed25519 authentication is classical, not PQ authentication.
- [ ] **Hardware-wrapped key protection** on each supported platform and OS-enforced PIN retry throttling; disable use on unsupported/untrusted storage.
- [ ] **Secure multi-device state recovery and atomic session transitions** with adverse power loss, backup, and concurrency testing.
- [ ] **Native FFI and end-to-end integration** with one shipping application, including attachment encryption, authenticated receipts and authenticated notifications where applicable.
- [ ] **Full transport and protocol threat model**: replay, MITM, malicious relay, compromise recovery, metadata minimization, misuse resistance, parse limits, nonce and state transition safety.
- [ ] **Build and tests verified green** in GitHub Actions on exact release commit, both default and `signal-spqr` feature sets; commit reproducible `Cargo.lock` and approved dependency inventory.
- [ ] **Dependency, SBOM, vulnerability and third-party license review**, including Signal SPQR's AGPL-3.0-only terms and release-compatible Vedoy licensing decision.
- [ ] **Independent cryptographic design review, implementation audit and penetration testing**, with remediation and re-test of high/critical findings.
- [ ] **Documentation, SDK versioning, vulnerability disclosure channel, release signer and rollback plan**, plus privacy/data handling review.

## Internal developer-preview entry criteria
- [ ] CI green on the PR with all configured gates (evidence: job links).
- [ ] All tests executed using Rust toolchain and documented with exact commit hash.
- [ ] No production credentials, user messages, identity documents or customer keys used.
- [ ] Clearly label all examples, artifacts and endpoints as research/developer-preview only.
- [ ] Sign-off by a human maintainer; a preview is not a security certification.

## Non-goals / prohibited shortcuts
- Do not change `production_ready` to `true` simply because CI passes.
- Do not silently fall back from PQ ratchet to research `chain.rs`.
- Do not ship `accept` (the unguarded research helper) in a real messaging app; even `accept_guarded` requires a stronger global ledger for production.
- Do not assume multiple independent layers of ad-hoc encryption substitute for reviewed standard protocols.
- Do not deploy on Vercel: this crate is a Rust library, not a Next.js application.
