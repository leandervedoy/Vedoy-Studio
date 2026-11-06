# Vedoy Shield Core - licensing and distribution review

This source is not a declaration that the product is approved for proprietary
or commercial distribution, or independently certified.

The previous optional third-party messaging ratchet dependency has been
removed from `Cargo.toml`. No equivalent messenger is bundled. Release
owners must review the licenses of **all** remaining and future dependencies,
including transitive dependencies and platform implementations.

## Required before a public or commercial release

1. Decide the project's own copyright and license grant.
2. Inventory dependency licenses and provenance, including transitive crates.
3. Generate and retain a reproducible `Cargo.lock`, SBOM and third-party notices.
4. Obtain review of the complete product distribution model, including native
   apps, hosted services, SDKs and any future message protocol.
5. Keep research disclaimers until the shipped integrated system has passed
   independent review.

Do not interpret a permissively licensed cipher implementation as validation
of an entire messaging system.
