# Security model — 2026-11-06 — v0.3.0

## Absolutely not ready for production

No independent crypto audit, formal model or working native integration exists for this specific composite protocol. v0.3.0 is source for research, not an endorsement of any algorithm or a certification of a complete secure messaging protocol. The previously optional messaging ratchet integration has been removed; secure messaging is deliberately disabled until a reviewed replacement is available.

## Threats and controls

| Threat | Current control | Remaining exposure |
|---|---|---|
| MITM substitutes recipient public keys | Pin Ed25519 public key, verify signed bundle and full sender transcript | No global key transparency and no key distribution trust established. |
| Attacker impersonates sender | Sender signature on invite transcript, pinned sender identity | Ed25519 classical authentication; no sender prekey rotation / quantum-authenticated identity. |
| Quantum attack on session establishment | X25519 + ML-KEM-1024 combined with HKDF-SHA512 | Hybrid experimental handshake is not PQXDH; not a security theorem. |
| Long-term key compromise | No active secure messaging ratchet (fail closed) | A reviewed ratchet and complete device compromise recovery are required. |\n| Tampered packet or replay | AES-256-GCM-SIV, XChaCha20-Poly1305 for standalone data, local inbox ID cache | Incomplete global replay protection and prekey lifecycle. |
| Power loss while sending | Encrypted outbox + ratchet state written atomically before transport | Storage supports only suitable Unix local FS. Rollback attack and multi-device conflicts not solved. |
| Device theft | Argon2id password #2 and PIN, 0600 state file, file AEAD | Offline PIN brute force possible; hardware wrapping, biometrics and hardware throttling missing. |
| Malicious ID document | Identity provider adapter fails closed by default | Real NFC/passport scanning and issuer proof validation not yet integrated. |
| VPN exit compromise | E2EE is independent of transport | Metadata may reveal counterparties, location, timing and social graph. |

## Mandatory fail-closed conditions

- Refuse unknown versions and disallow all messenger sessions without an audited ratchet implementation.
- `PostQuantumRatchet::initialize`, `prepare_send`, `prepare_receive` always return `RatchetUnavailable` until a reviewed replacement exists. Do NOT bypass this using the research `chain.rs` API or standalone AEAD.
- Do not upload private ratchet states or unlock secrets to a server. **JSON** only carries public handshake data and ciphertext; private JSON snapshots are locally encrypted.
- Never send ciphertext before the encrypted outbox+state write succeeds.
- Never display received plaintext before new state+inbox write succeeds.
- Signature public keys MUST be authenticated out-of-band, through verified QR/safety number or key transparency. A signature by an unknown key establishes no real-world identity.
- An invite ID must be consumed in an account-wide persistent replay ledger before activating the session. NOT implemented; blocking for production.
- Password2/PIN must be collected via native secure UI and rate-limited with platform-backed hardware. NOT implemented; blocking for production.

## High-priority security review items

1. Replace homegrown research AKE with an audited standard PQXDH implementation including signed prekeys, one-time keys, key IDs, timestamps, prekey depletion and asynchronous server queues.
2. Integrate a separately licensed, independently reviewed messaging ratchet with full session and multi-device lifecycle; do not implement a new homegrown ratchet. Prove state transitions and replay / out-of-order protections, including multiple devices.
3. Threat model malicious server, server-to-server and push notification metadata, group-chat membership and attachments.
4. Device keystore integration, key recovery, backup, PIN rate limiting and account revocation.
5. Fuzz JSON parsers and envelope decoding; adversarial tests for decryption failures, crash points, unlock throttling, rollback and reinstallation.
6. Conduct licensing and dependency supply-chain review for the replacement ratchet and all retained libraries.
7. Cryptographic external audit, UX security review and penetration testing before any production release.

## Vulnerability reporting

Do not publish real-world secrets or proof-of-concept exploits on a public issue tracker. Contact Vedoy project maintainers privately through an established security reporting channel before disclosure. A dedicated `security@` mailbox has **not** been provisioned by this code package.