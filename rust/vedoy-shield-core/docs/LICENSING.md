# Licensing and redistribution review — 2026-11-06

## Vedoy Shield Core v0.3.0

This repository branch publishes experimental source for technical review. It is **not** a declaration that the code is approved for commercial distribution, safe for production messaging, or open-sourced under any particular license. Do not add a license statement on Vedoy's behalf without an explicit decision by the owner.

### Dependency policy\n\nThe optional third-party messaging ratchet integration has been removed from Cargo dependencies. This branch does not ship a replacement production messenger. Review license terms for all existing and newly selected libraries, and obtain legal advice before proprietary redistribution.\n\n### Release checklist

1. Decide whether Vedoy Shield will be open-source, dual-licensed, separately licensed, or internal research.
2. Get written legal review for the AGPL dependency and related transitive licenses.
3. Include a complete third-party dependency and copyright notice after locking versions.
4. Publish `LICENSE` / SPDX identifiers only after an explicit business licensing decision.
5. Keep the experimental security disclaimer and independent-review requirements regardless of license selection.
