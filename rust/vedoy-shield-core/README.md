# Vedoy Shield Core - research and developer preview

**Status: NOT independently audited, NOT approved for production end-to-end messaging.**
This is an experimental Rust library. No live VPN, transport server, native Android/iOS integration, or messenger deployment is included.

## Active components

| Component | What it does | Key limits |
| --- | --- | --- |
| `src/hybrid.rs` | Experimental authenticated X25519 + ML-KEM-1024 key establishment, Ed25519 pinned signatures and HKDF-SHA512 | Custom handshake is not independently audited; no asynchronous prekey service or post-quantum authentication |
| `src/sealed.rs` | Standalone context-authenticated XChaCha20-Poly1305 encryption from the existing RustCrypto implementation | Caller provides securely managed 32-byte keys; does not provide E2EE, post-quantum key exchange, or forward secrecy |
| `src/storage.rs` | Unix-local crash-atomic encrypted snapshots using Argon2id and AES-256-GCM-SIV | No platform-backed rate limiting, hardware key wrapping, or rollback resistance |
| `src/replay.rs` | Encrypted per-device/account invite replay ledger with fail-closed persistence | Does not provide global multi-device replay protection; ledger rollback and deletion remain serious threats |
| `src/ratchet.rs` | Explicit unavailable placeholder | All messaging ratchet operations fail closed; no third-party ratchet dependency is installed |
| `src/session.rs` | Research-only persist-before-send session API | Unusable for live messages without a complete reviewed ratchet |
| `src/wordforge.rs` | Experimental per-word envelope, retained for research and tests | Not recommended for real user data; not known to improve security |
| `src/vault.rs` and `src/identity.rs` | Pluggable hardware-vault and identity-proofing contracts | Default adapters fail closed |

The third-party ratchet dependency has been removed. We intentionally did **not**
replace it with a homemade ratchet or silent fallback. New secure messaging
requires an independently reviewed, licensed, maintained ratchet/protocol
implementation, wired into the app and tested for multi-device lifecycle.

## Quick local build

Requires Rust 1.88 or later and network access to fetch Cargo dependencies:

```sh
cd rust/vedoy-shield-core
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test --all-targets
```

These commands are not proof of cryptographic security. At the time of this
change, the actual Rust toolchain, CI results, and reproducible `Cargo.lock`
were not verified in the authoring environment.

## Safe evaluation scope

- Use only synthetic, non-sensitive test data.
- `sealed::seal_payload` and `sealed::open_payload` offer authenticated
  standalone data sealing. Supply independent random 256-bit keys through a
  trusted key lifecycle, never via untrusted JSON or plaintext network APIs.
- Do not enable messaging on `ratchet.rs`, `session.rs` or the research chain.
- Do not treat a classical Ed25519 identity signature as post-quantum identity
  authentication.
- Do not send private key material, unlock PINs or vault snapshots to servers.

See `docs/SECURITY.md`, `docs/INTEGRATION.md`,
`docs/RELEASE-READINESS.md`, `docs/LICENSING.md`, and `CHANGELOG.md`.

## Production release blockers

A reviewed authenticated asynchronous session protocol, secure ratchet,
cross-device replay/key transparency, mobile hardware key custody, migration
policy, reproducible builds, dependency/license review, external design and
implementation audits, and a verified host-app integration are all mandatory.
`json::capabilities().production_ready` intentionally remains `false`.
