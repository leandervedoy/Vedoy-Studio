# Changelog — Vedoy Shield Core

All dates in ISO 8601. Semantic versioning reflects *experimental implementation changes*, NOT cryptographic security certification.

## [Unreleased] - security migration (research only)

- Removed the optional third-party messaging ratchet source dependency and
  its compile feature. Messaging sessions now fail closed by design.
- Added standalone RustCrypto XChaCha20-Poly1305 authenticated sealing,
  with random 192-bit nonce, context binding, versioning and bounded inputs.
- Added local encrypted invite replay ledger (per device; not global).
- Added negative tests and CI controls for research/developer evaluation.
- Updated documentation to prohibit production messaging until an audited,
  independently licensed full session protocol is integrated.
- This is NOT a new certified release, and no successful build or audit is
  claimed.

## [0.3.0] — 2026-11-06

### Added
- Rust-only authenticated *experimental* hybrid handshake: sender signs transcript, recipient bundle signature and both identity pins are verified.
- Version-3 JSON envelopes; authenticated field for the post-quantum ratchet chunk.
- Optional Signal SPQR v1.6.0 adapter, hard-disabled unless feature `signal-spqr` is explicitly enabled; forbids downgrade to SPQR V0.
- New encrypted crash-atomic local snapshots (Argon2id + AES-256-GCM-SIV) using both password #2 and a numeric PIN.
- Unix file locking, revision conflict detection, durable directory sync and encrypted outbox-before-send / inbox-before-display research APIs.
- Provider-neutral passport and national-ID verification interface, default fail-closed; no ID document collection.
- Bounded JSON capability format, regression tests and CI workflow.
- Security and ID proofing documentation.

### Changed
- Cryptographic domain strings and wire version bumped from 0.2 to 0.3. No automatic migration of v0.2 ciphertext or sessions.
- Python v0.1 remains reference-only in `legacy-python/` (not used by Rust).

### NOT YET DONE / KNOWN RISKS
- **Not PQXDH**, and **not** a complete Triple Ratchet. Full asynchronous one-time prekey management, checked sender/receiver identity-key transparency and global replay prevention are missing.
- SPQR dependency is AGPLv3-only; opt-in integration has not been compiled/tested locally.
- No Android Keystore/iOS Secure Enclave connector or hardware PIN attempt throttling. Password/PIN-derived snapshots alone are inadequate against device compromise.
- No independent audit, formal proof, cross-platform tests, privacy impact assessment, live identity verification provider or WireGuard/Proton deployment.
- No Cargo.lock: unavailable compiler and network prevented generating and verifying a lockfile.

## [0.2.0] — 2026-11-06
- Earlier Rust research scaffold: one-sided authenticated hybrid KEM, symmetric chains, WordForge AEAD and fail-closed key vault abstraction. No authenticated sender or real post-quantum ratchet.

## [0.1.0] — 2026-11-06
- Original Python-only WordForge proof of concept, preserved for historical comparison.