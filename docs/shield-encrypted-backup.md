# Vedoy Shield: encrypted Git backups

The existing backup branch `backup/2026-11-09-before-smart-welcome` is a **Git recovery point**, not an encrypted or off-site backup. This workflow adds encrypted Git history bundle artifacts when enabled.

## Enable
1. Add a repository Actions secret named `SHIELD_BACKUP_PASSPHRASE` containing a randomly generated secret of at least 32 bytes. Store a copy safely outside GitHub. Losing it means losing access to backup files.
2. Review and merge this PR. Trigger **Vedoy Shield encrypted repository backup** manually in Actions. The scheduled job runs on Mondays after merge.
3. Download the encrypted `.shield` artifact and test a restore on a separate machine. Artifacts expire after 14 days: configure an independent longer-retention storage destination before relying on this for disaster recovery.
4. Repeat this setup separately for the legacy `Vedoystudio` repository if it is still in use. GitHub branches do not cover databases, Vercel settings, Stripe keys, uploaded assets or external services.

## Local restore

```sh
export SHIELD_BACKUP_PASSPHRASE="your-private-recovery-secret"
node scripts/shield-backup.mjs decrypt vedoy-studio.bundle.shield recovered.bundle
git clone recovered.bundle restored-studio
```

The file envelope is AES-256-GCM with a random nonce and salt, PBKDF2-SHA256 (600000 iterations), and authenticated metadata. Encryption is implemented with Node.js standard crypto, not the experimental Vedoy Shield Rust PQ core. The runner holds the plaintext bundle temporarily; only the ciphertext is uploaded. GitHub Actions administrators, workflow changes, malicious dependencies, and the security of stored secrets remain part of the threat model. Review action permissions and pin third-party actions before high-assurance production use.

**Status:** This workflow is only configured after its PR is merged and the required secret exists. Do not claim that a live encrypted backup exists until the action succeeds and a restore has been verified.
